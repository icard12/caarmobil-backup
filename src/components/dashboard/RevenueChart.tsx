import { MoreVertical, LayoutGrid } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <LayoutGrid className="w-4 h-4 text-[#FF4700]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">Análise de Receita</h3>
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="relative h-64 w-full">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-gray-50 flex items-center relative">
              <span className="absolute -left-8 text-[9px] font-bold text-gray-300 w-6 text-right uppercase">
                {Math.round((maxVal / 4) * (4 - i) / 1000)}k
              </span>
            </div>
          ))}
        </div>

        {/* Chart Bars */}
        <div className="absolute inset-0 flex items-end justify-between px-8 gap-4">
          {data.map((item, index) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
              <div className="relative w-full flex items-end justify-center gap-1.5 h-full">
                {/* Revenue Bar */}
                <div
                  className="w-full max-w-[12px] bg-[#FF4700] rounded-t-sm transition-all duration-1000 ease-out origin-bottom hover:brightness-110 cursor-pointer shadow-lg shadow-orange-500/10 group-hover:scale-y-105"
                  style={{
                    height: '0%',
                    animation: `growUp${index} 1s ease-out forwards ${index * 0.1}s`
                  }}
                >
                  <style>{`
                    @keyframes growUp${index} {
                      to { height: ${(item.revenue / maxVal) * 100}%; }
                    }
                  `}</style>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded-xl font-bold shadow-xl translate-y-2 group-hover:translate-y-0 z-10 whitespace-nowrap pointer-events-none">
                    MT {item.revenue.toLocaleString('pt-BR')}
                  </div>
                </div>

                {/* Expenses Bar */}
                <div
                  className="w-full max-w-[12px] bg-gray-100 rounded-t-sm transition-all duration-1000 ease-out origin-bottom hover:bg-gray-200 cursor-pointer group-hover:scale-y-105"
                  style={{
                    height: '0%',
                    animation: `growUpExpenses${index} 1s ease-out forwards ${index * 0.1 + 0.2}s`
                  }}
                >
                  <style>{`
                    @keyframes growUpExpenses${index} {
                      to { height: ${(item.expenses / maxVal) * 100}%; }
                    }
                  `}</style>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF4700] rounded-sm ring-4 ring-orange-500/10" />
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Receita</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded-sm ring-4 ring-gray-100/10" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Despesas</span>
        </div>
      </div>
    </div>
  );
}
