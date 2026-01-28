import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

function SummaryCard({ title, value, change, icon: Icon }: SummaryCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-[32px] border border-gray-100/50 p-6 hover:border-[#FF4700]/10 hover:shadow-modern-lg transition-all duration-500 group cursor-pointer active:scale-[0.98] animate-slide-up bg-gradient-to-br from-white to-gray-50/30">
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-[#FF4700] group-hover:text-white group-hover:shadow-glow-orange transition-all duration-500 group-hover:-rotate-6">
          <Icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="relative w-14 h-10 overflow-hidden opacity-30 group-hover:opacity-100 transition-all duration-700">
          <svg viewBox="0 0 50 20" className="w-full h-full">
            <path
              d={isPositive ? "M0 15 L8 12 L15 16 L25 8 L35 12 L50 4" : "M0 5 L10 8 L20 4 L30 15 L40 12 L50 18"}
              fill="none"
              stroke={isPositive ? "#22c55e" : "#ef4444"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</span>
        <p className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-[#FF4700] transition-colors duration-500 leading-tight">{value}</p>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100/50">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">vs last period</span>
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  cards: Omit<SummaryCardProps, 'iconBgColor' | 'iconColor'>[];
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <SummaryCard
          key={card.title}
          {...card}
        />
      ))}
    </div>
  );
}
