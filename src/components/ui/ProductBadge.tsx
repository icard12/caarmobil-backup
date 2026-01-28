import React from 'react';

export type BadgeType = 'best-seller' | 'low-sales' | 'no-movement' | 'stagnant' | 'normal';

interface ProductBadgeProps {
    type: BadgeType;
    label?: string;
    className?: string;
}

const ProductBadge: React.FC<ProductBadgeProps> = ({ type, label, className = '' }) => {
    if (type === 'normal') return null;

    const config = {
        'best-seller': {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            dot: 'bg-emerald-500',
            defaultLabel: 'Mais Vendido'
        },
        'low-sales': {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            dot: 'bg-amber-500',
            defaultLabel: 'Pouca Saída'
        },
        'no-movement': {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            border: 'border-rose-100',
            dot: 'bg-rose-500',
            defaultLabel: 'Sem Movimento 7 dias'
        },
        'stagnant': {
            bg: 'bg-slate-50',
            text: 'text-slate-500',
            border: 'border-slate-100',
            dot: 'bg-slate-400',
            defaultLabel: 'Risco de Encalhe'
        }
    }[type];

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${className}`}>
            <span className={`w-1 h-1 rounded-full ${config.dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
                {label || config.defaultLabel}
            </span>
        </div>
    );
};

export default ProductBadge;
