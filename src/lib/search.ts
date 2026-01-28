/**
 * Utility for precise product searching.
 * Supports normalization, multi-term search (AND logic), and field prioritization.
 */

export interface SearchableProduct {
    id: string;
    name: string;
    category?: string;
    [key: string]: any;
}

/**
 * Normalizes text by removing accents/diacritics and converting to lowercase.
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculates a score for how well a product matches a query.
 * Higher score means better match.
 * Returns 0 if no match.
 */
function calculateMatchScore(product: SearchableProduct, queryTerms: string[]): number {
    if (queryTerms.length === 0) return 1;

    const productName = normalizeText(product.name || '');
    const productCategory = normalizeText(product.category || '');
    const productId = normalizeText(product.id || '');

    const searchableText = `${productName} ${productCategory} ${productId}`;

    // All terms must be present for a match (AND logic)
    const matchesAll = queryTerms.every(term => searchableText.includes(term));
    if (!matchesAll) return 0;

    let score = 0;

    queryTerms.forEach(term => {
        // Priority 1: Exact ID match (very high priority)
        if (productId === term) score += 1000;

        // Priority 2: Exact Name match
        if (productName === term) score += 500;

        // Priority 3: Name starts with term
        if (productName.startsWith(term)) score += 100;

        // Priority 4: Category starts with term
        if (productCategory.startsWith(term)) score += 50;

        // Priority 5: Word in Name starts with term
        if (productName.includes(` ${term}`)) score += 30;

        // Priority 6: Contains match (base score)
        score += 10;
    });

    return score;
}

/**
 * Filters and sorts products based on a search query.
 */
export function searchProducts<T extends SearchableProduct>(products: T[], query: string): T[] {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return products;

    const queryTerms = normalizeText(trimmedQuery)
        .split(/\s+/)
        .filter(term => term.length > 0);

    if (queryTerms.length === 0) return products;

    return products
        .map(product => ({
            product,
            score: calculateMatchScore(product, queryTerms)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
}
