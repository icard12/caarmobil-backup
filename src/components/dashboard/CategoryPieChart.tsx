import { PieChart } from 'lucide-react';

interface CategoryData {
    label: string;
    value: number;
    color: string;
}

const categories: CategoryData[] = [
    { label: 'Smartphones', value: 45, color: '#FF4700' },
    { label: 'Audio Gear', value: 25, color: '#FF8A00' },
    { label: 'Wearables', value: 20, color: '#FFD600' },
    { label: 'Gadgets', value: 10, color: '#1A1A1A' },
];

interface CategoryPieChartProps {
    data?: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
    const displayData = data && data.length > 0 ? data : categories;
    const total = displayData.reduce((sum, cat) => sum + cat.value, 0);
    let currentOffset = 0;

    return (
        <div className="bg-white rounded-[32px] shadow-pro border border-gray-100/30 p-8 flex flex-col h-full animate-slide-up relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors duration-1000" />
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <PieChart className="w-4 h-4 text-[#FF4700]" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">Distribuição de Categorias</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-8 group">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {displayData.map((cat, index) => {
                            const dashLength = (cat.value / total) * 100;
                            const spacing = 1; // Gap between segments
                            const strokeDasharray = `${dashLength - spacing} ${100 - (dashLength - spacing)}`;
                            const strokeDashoffset = -currentOffset;
                            currentOffset += dashLength;

                            return (
                                <circle
                                    key={cat.label}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke={cat.color}
                                    strokeWidth="12"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000 ease-out hover:stroke-[14] cursor-pointer"
                                    style={{
                                        transitionDelay: `${index * 150}ms`,
                                    }}
                                >
                                    <animate
                                        attributeName="stroke-dasharray"
                                        from="0 100"
                                        to={strokeDasharray}
                                        dur="1.5s"
                                        begin={`${index * 0.2}s`}
                                        calcMode="spline"
                                        keySplines="0.4 0 0.2 1"
                                        fill="freeze"
                                    />
                                </circle>
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{total}%</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-4 mt-1">Saturação</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                    {displayData.map((cat) => (
                        <div key={cat.label} className="flex items-center gap-3 group cursor-pointer p-2.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                            <div
                                className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-150"
                                style={{ backgroundColor: cat.color }}
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight group-hover:text-[#FF4700] transition-colors">{cat.label}</span>
                                <span className="text-[11px] font-bold text-gray-400">{cat.value}% units</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
