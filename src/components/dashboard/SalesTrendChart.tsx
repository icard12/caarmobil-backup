import { TrendingUp } from 'lucide-react';

interface SalesData {
    day: string;
    sales: number;
}

const data: SalesData[] = [
    { day: 'Seg', sales: 4200 },
    { day: 'Ter', sales: 3800 },
    { day: 'Qua', sales: 5100 },
    { day: 'Qui', sales: 4800 },
    { day: 'Sex', sales: 6200 },
    { day: 'Sáb', sales: 7500 },
    { day: 'Dom', sales: 6900 },
];

interface SalesTrendChartProps {
    data?: SalesData[];
}

export default function SalesTrendChart({ data: propData }: SalesTrendChartProps) {
    const displayData = propData && propData.length > 0 ? propData : data;
    const maxSales = Math.max(...displayData.map(d => d.sales), 1);
    const minSales = Math.min(...displayData.map(d => d.sales), 0);
    const range = maxSales - minSales || 1;

    // Chart dimensions
    const width = 400;
    const height = 200;
    const padding = 20;

    // Map data to points
    const points = displayData.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (displayData.length - 1 || 1);
        const y = height - padding - ((d.sales - minSales) * (height - 2 * padding)) / range;
        return { x, y, sales: d.sales, day: d.day };
    });

    // Create SVG path string
    const pathD = `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div className="bg-white rounded-[32px] shadow-pro border border-gray-100/30 p-8 flex flex-col h-full animate-slide-up group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors duration-1000" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-[#FF4700]" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">Tendência de Vendas</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full">
                    < TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold">+14.2%</span>
                </div>
            </div>

            <div className="flex-1 relative cursor-crosshair">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF4700" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#FF4700" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area under line */}
                    <path
                        d={areaD}
                        fill="url(#areaGradient)"
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Main Line */}
                    <path
                        d={pathD}
                        fill="transparent"
                        stroke="#FF4700"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-path"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 1000,
                            animation: 'drawPath 2s ease-out forwards'
                        }}
                    />

                    {/* Points Hooks */}
                    {points.map((p, i) => (
                        <g key={i} className="group/point">
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                className="fill-white stroke-[#FF4700] stroke-[2] transition-all duration-300 group-hover/point:r-6 scale-0"
                                style={{ animation: `popIn 0.3s ease-out forwards ${i * 0.1 + 1}s` }}
                            />
                            {/* Tooltip on hover */}
                            <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <rect x={p.x - 30} y={p.y - 45} width="60" height="30" rx="8" fill="#1A1A1A" />
                                <text x={p.x} y={p.y - 25} textAnchor="middle" fill="white" className="text-[10px] font-bold">
                                    MT {p.sales}
                                </text>
                            </g>
                        </g>
                    ))}
                </svg>

                {/* CSS Animations */}
                <style>{`
          @keyframes drawPath {
            to { strokeDashoffset: 0; }
          }
          @keyframes popIn {
            to { scale: 1; }
          }
        `}</style>
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 relative z-10">
                {displayData.map(d => (
                    <span key={d.day}>{d.day}</span>
                ))}
            </div>
        </div>
    );
}
