

interface Activity {
  id: string | number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getTypeStyles = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
      case 'warning':
        return 'bg-[#FF4700] shadow-[0_0_10px_rgba(255,71,0,0.4)]';
      case 'info':
      default:
        return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 px-8 py-10 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors duration-1000" />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#FF4700] rounded-full" />
          <h3 className="text-[12px] font-black text-gray-900 tracking-[0.2em] uppercase">Monitor de Atividade</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Flow</span>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-5 group/item">
            <div className="relative pt-1">
              <div className={`w-3 h-3 rounded-full z-10 relative border-4 border-white ${getTypeStyles(activity.type)} transition-transform duration-500 group-hover/item:scale-125`}></div>
              <div className="absolute top-4 left-[5.5px] bottom-[-32px] w-[1px] bg-gray-100 group-last/item:hidden"></div>
            </div>
            <div className="flex-1 pb-2">
              <p className="text-[13px] text-gray-500 font-bold leading-tight tracking-tight">
                <span className="text-gray-900 group-hover/item:text-[#FF4700] transition-colors">{activity.user}</span>
                <span className="mx-1 opacity-50">{activity.action}</span>
                <span className="text-gray-900">{activity.target}</span>
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em]">{activity.time}</p>
                <div className="h-px flex-1 bg-gray-50" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-10 py-4 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 transition-all uppercase tracking-[0.2em] relative z-10 group/btn overflow-hidden">
        <span className="relative z-10 group-hover/btn:tracking-[0.3em] transition-all">Ver Histórico Completo</span>
      </button>
    </div>
  );
}
