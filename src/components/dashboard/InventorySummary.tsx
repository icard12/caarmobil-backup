import { TrendingUp, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InventorySummaryProps {
    summary: {
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
        };
    } | null;
}

const InventorySummary: React.FC<InventorySummaryProps> = ({ summary }) => {
    const { t } = useLanguage();
    if (!summary) return null;

    return (
        <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-subtle)] p-8 h-fit animate-zoom-fade">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#FF4700]/10 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-[#FF4700]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight">{t('smartSummary')}</h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('performanceAnalysis')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Top 3 Ranking */}
                <div>
                    <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" /> {t('topRanking')}
                    </h4>
                    <div className="space-y-3">
                        {summary.topProducts.slice(0, 3).map((product, index) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 bg-[var(--bg-canvas)] rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF4700]/30 transition-all group">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                    index === 1 ? 'bg-slate-200 text-slate-600' :
                                        'bg-orange-100 text-orange-600'
                                    }`}>
                                    #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[var(--text-main)] truncate">{product.name}</p>
                                    <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase">{product.totalSales} {t('unitsSold')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-[var(--text-main)]">MT {product.revenue.toFixed(0)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Critical Alerts */}
                {summary.alerts.length > 0 && (
                    <div>
                        <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> {t('attentionNeeded')}
                        </h4>
                        <div className="space-y-2">
                            {summary.alerts.slice(0, 3).map((alert, index) => (
                                <div key={index} className={`p-3 rounded-2xl border flex gap-3 ${alert.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                    alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                        'bg-blue-50 border-blue-100 text-blue-700'
                                    }`}>
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-black leading-tight uppercase mb-1">{alert.productName}</p>
                                        <p className="text-[10px] font-bold opacity-80 leading-snug">{alert.message}</p>
                                        <p className="text-[9px] font-black uppercase mt-1.5 underline cursor-pointer hover:opacity-100 opacity-60">
                                            {alert.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Metrics */}
                <div className="pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase">{t('stagnant')}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-[var(--text-main)]">{summary.metrics.stagnantProducts}</span>
                            <Package className="w-3 h-3 text-[var(--text-muted)]" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase">{t('noMovement7d')}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-[var(--text-main)]">{summary.metrics.noMovementProducts}</span>
                            <AlertCircle className="w-3 h-3 text-rose-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventorySummary;
