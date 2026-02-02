import { prisma } from './db.ts';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let analyticsCache: {
    data: any;
    timestamp: number;
} | null = null;

export interface ProductAnalytics {
    id: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    totalSales: number;
    salesVelocity: number; // sales per day
    daysSinceLastMovement: number;
    status: 'best-seller' | 'low-sales' | 'no-movement' | 'stagnant' | 'normal';
    badge?: {
        type: 'best-seller' | 'low-sales' | 'no-movement' | 'stagnant';
        label: string;
        color: string;
    };
}

export interface AnalyticsSummary {
    topProducts: Array<{
        id: string;
        name: string;
        totalSales: number;
        revenue: number;
    }>;
    alerts: Array<{
        type: 'warning' | 'danger' | 'info';
        productId: string;
        productName: string;
        message: string;
        action: string;
    }>;
    metrics: {
        totalProducts: number;
        activeProducts: number;
        stagnantProducts: number;
        noMovementProducts: number;
        averageSalesVelocity: number;
    };
}

/**
 * Calculate days since last movement for a product
 */
async function getDaysSinceLastMovement(productId: string): Promise<number> {
    try {
        const lastMovement = await prisma.stockMovement.findFirst({
            where: { productId },
            orderBy: { date: 'desc' }
        });

        if (!lastMovement) {
            return -1; // Specific flag for "No movement ever"
        }

        const now = new Date();
        const lastDate = new Date(lastMovement.date);
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    } catch (error) {
        console.error(`Error calculating days since last movement for ${productId}:`, error);
        return -1;
    }
}

/**
 * Calculate total sales (exits) for a product
 */
async function getTotalSales(productId: string): Promise<number> {
    const exits = await prisma.stockMovement.findMany({
        where: {
            productId,
            type: 'exit',
            // Exclude manual adjustments from sales count (Fixed)
            NOT: {
                OR: [
                    { reason: { contains: 'Ajuste' } },
                    { reason: { contains: 'Manual' } },
                    { reason: { contains: 'Correction' } }
                ]
            }
        }
    });

    return exits.reduce((sum, movement) => sum + movement.quantity, 0);
}

/**
 * Calculate sales velocity (sales per day)
 */
async function getSalesVelocity(productId: string): Promise<number> {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                movements: {
                    where: {
                        type: 'exit',
                        // Exclude manual adjustments
                        NOT: {
                            OR: [
                                { reason: { contains: 'Ajuste' } },
                                { reason: { contains: 'Manual' } },
                                { reason: { contains: 'Correction' } }
                            ]
                        }
                    },
                    orderBy: { date: 'asc' }
                }
            }
        });

        if (!product || product.movements.length === 0) return 0;

        const firstSaleDate = new Date(product.movements[0].date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstSaleDate.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const totalSales = product.movements.reduce((sum, m) => sum + m.quantity, 0);
        return totalSales / diffDays;
    } catch (error) {
        return 0;
    }
}

/**
 * Determine product status based on analytics
 */
function determineProductStatus(
    totalSales: number,
    daysSinceLastMovement: number,
    salesVelocity: number,
    percentile: number
): ProductAnalytics['status'] {
    // No movement in 7+ days
    if (daysSinceLastMovement >= 7) {
        return 'no-movement';
    }

    // Best seller (top 10%)
    if (percentile >= 90) {
        return 'best-seller';
    }

    // Low sales (bottom 20%)
    if (percentile <= 20 && totalSales > 0) {
        return 'low-sales';
    }

    // Stagnant (very low velocity and some sales)
    if (salesVelocity < 0.5 && totalSales > 0) {
        return 'stagnant';
    }

    return 'normal';
}

/**
 * Get badge configuration for product status
 */
function getBadge(status: ProductAnalytics['status']): ProductAnalytics['badge'] | undefined {
    const badges = {
        'best-seller': {
            type: 'best-seller' as const,
            label: 'Mais Vendido',
            color: 'green'
        },
        'low-sales': {
            type: 'low-sales' as const,
            label: 'Pouca Saída',
            color: 'orange'
        },
        'no-movement': {
            type: 'no-movement' as const,
            label: 'Sem Movimento 7 dias',
            color: 'red'
        },
        'stagnant': {
            type: 'stagnant' as const,
            label: 'Risco de Encalhe',
            color: 'gray'
        }
    };

    return status !== 'normal' ? badges[status] : undefined;
}

/**
 * Analyze all products and return analytics data
 */
export async function analyzeProducts(): Promise<ProductAnalytics[]> {
    console.log('Running analyzeProducts...');
    try {
        // Check cache
        if (analyticsCache && (Date.now() - analyticsCache.timestamp) < CACHE_TTL) {
            console.log('Returning cached analytics');
            return analyticsCache.data;
        }

        const products = await prisma.product.findMany({ where: { isDeleted: false } });
        console.log(`Analyzing ${products.length} products`);

        if (products.length === 0) {
            return [];
        }

        // Calculate metrics for all products
        const productsWithMetricsResults = await Promise.allSettled(
            products.map(async (product) => {
                try {
                    const totalSales = await getTotalSales(product.id);
                    const salesVelocity = await getSalesVelocity(product.id);
                    const daysSinceLastMovement = await getDaysSinceLastMovement(product.id);

                    return {
                        ...product,
                        totalSales,
                        salesVelocity,
                        daysSinceLastMovement
                    };
                } catch (err) {
                    console.error(`Error analyzing product ${product.id} (${product.name}):`, err);
                    // Return a safe fallback for this product so one failure doesn't break everything
                    return {
                        ...product,
                        totalSales: 0,
                        salesVelocity: 0,
                        daysSinceLastMovement: -1
                    };
                }
            })
        );

        const productsWithMetrics = productsWithMetricsResults
            .map(result => result.status === 'fulfilled' ? result.value : null)
            .filter((p): p is NonNullable<typeof p> => p !== null);

        // Calculate percentiles for ranking
        const sortedBySales = [...productsWithMetrics].sort((a, b) => b.totalSales - a.totalSales);

        const analytics: ProductAnalytics[] = productsWithMetrics.map((product) => {
            try {
                const rank = sortedBySales.findIndex(p => p.id === product.id);
                const percentile = sortedBySales.length > 0 ? ((sortedBySales.length - rank) / sortedBySales.length) * 100 : 0;

                const status = determineProductStatus(
                    product.totalSales,
                    product.daysSinceLastMovement,
                    product.salesVelocity,
                    percentile
                );

                return {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    stock: product.stock,
                    price: product.price,
                    totalSales: product.totalSales,
                    salesVelocity: product.salesVelocity,
                    daysSinceLastMovement: product.daysSinceLastMovement,
                    status,
                    badge: getBadge(status)
                };
            } catch (err) {
                console.error(`Error determining status for product ${product.id}:`, err);
                return {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    stock: product.stock,
                    price: product.price,
                    totalSales: 0,
                    salesVelocity: 0,
                    daysSinceLastMovement: -1,
                    status: 'normal'
                };
            }
        });

        // Update cache
        analyticsCache = {
            data: analytics,
            timestamp: Date.now()
        };

        console.log('Analytics calculation complete');
        return analytics;
    } catch (error) {
        console.error('CRITICAL Error in analyzeProducts:', error);
        // Fallback to empty array instead of throwing to avoid frontend crash
        return [];
    }
}

/**
 * Generate analytics summary with insights and recommendations
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const analytics = await analyzeProducts();

    // Top 5 products by sales
    const topProducts = [...analytics]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5)
        .map(p => ({
            id: p.id,
            name: p.name,
            totalSales: p.totalSales,
            revenue: p.totalSales * p.price
        }));

    // Generate alerts
    const alerts: AnalyticsSummary['alerts'] = [];

    analytics.forEach(product => {
        if (product.daysSinceLastMovement === -1) {
            alerts.push({
                type: 'info',
                productId: product.id,
                productName: product.name,
                message: 'Produto novo sem registros de saída',
                action: 'Aguardando primeira venda'
            });
        } else if (product.status === 'no-movement') {
            alerts.push({
                type: 'danger',
                productId: product.id,
                productName: product.name,
                message: `Sem movimento há ${product.daysSinceLastMovement} dias`,
                action: 'Considere fazer promoção ou desconto'
            });
        } else if (product.status === 'stagnant') {
            alerts.push({
                type: 'warning',
                productId: product.id,
                productName: product.name,
                message: 'Baixa rotatividade detectada',
                action: 'Produto em risco de encalhe'
            });
        } else if (product.status === 'low-sales' && product.stock > 10) {
            alerts.push({
                type: 'warning',
                productId: product.id,
                productName: product.name,
                message: 'Pouca saída com estoque alto',
                action: 'Avaliar estratégia de vendas'
            });
        } else if (product.status === 'best-seller' && product.stock < 5) {
            alerts.push({
                type: 'info',
                productId: product.id,
                productName: product.name,
                message: 'Produto popular com estoque baixo',
                action: 'Considere reabastecer urgentemente'
            });
        }
    });

    // Calculate metrics
    const metrics = {
        totalProducts: analytics.length,
        activeProducts: analytics.filter(p => p.stock > 0).length,
        stagnantProducts: analytics.filter(p => p.status === 'stagnant').length,
        noMovementProducts: analytics.filter(p => p.status === 'no-movement').length,
        averageSalesVelocity: analytics.length > 0
            ? analytics.reduce((sum, p) => sum + p.salesVelocity, 0) / analytics.length
            : 0
    };

    return {
        topProducts,
        alerts: alerts.slice(0, 10), // Limit to top 10 alerts
        metrics
    };
}

/**
 * Invalidate analytics cache (call after stock movements)
 */
export function invalidateAnalyticsCache(): void {
    analyticsCache = null;
}
