import { useState, useEffect } from 'react';
import { Activity, Key, Package, User, Search, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface LogEntry {
    id: string;
    action: string;
    category: string;
    details: string;
    createdAt: string;
    user: {
        name: string;
        role: string;
    };
}

export default function SystemLogs() {
    const { t, smartTranslate } = useLanguage();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await api.logs.list();
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLogs([]); // Prevent crash
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'AUTH': return <Key className="w-5 h-5 text-purple-500" />;
            case 'INVENTORY': return <Package className="w-5 h-5 text-[#FF4700]" />;
            case 'TEAM': return <User className="w-5 h-5 text-blue-500" />;
            case 'FINANCE': return <AlertCircle className="w-5 h-5 text-green-500" />;
            default: return <Activity className="w-5 h-5 text-slate-400" />;
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'AUTH': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'INVENTORY': return 'bg-orange-50 text-[#FF4700] border-orange-100';
            case 'TEAM': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'FINANCE': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-[#FF4700]" />
                        {t('systemHistory')}
                    </h2>
                    <p className="text-slate-500 font-bold text-[11px] lg:text-base">{t('auditFullSubtitle')}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <div className="relative group w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF4700] transition-colors" />
                        <input
                            type="text"
                            placeholder={t('searchLogs')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3.5 lg:py-3 bg-white border border-slate-200 rounded-2xl text-[13px] lg:text-sm font-medium w-full sm:w-64 focus:ring-4 focus:ring-[#FF4700]/5 focus:border-[#FF4700]/20 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto hide-scrollbar">
                        {['ALL', 'AUTH', 'INVENTORY', 'TEAM'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {cat === 'ALL' ? t('all') : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-[#FF4700]/10 border-t-[#FF4700] rounded-full animate-spin" />
                            <Activity className="w-6 h-6 text-[#FF4700] absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-900 font-bold">{t('accessingBlackBox')}</p>
                            <p className="text-slate-400 text-xs mt-1">{t('retrievingAudit')}</p>
                        </div>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase text-sm tracking-widest">{t('noEventsRegistered')}</p>
                        <p className="text-slate-300 text-xs mt-2">{t('adjustFilters')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-4 lg:p-6 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-start gap-3 lg:gap-6">
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${getCategoryStyles(log.category)}`}>
                                        <div className="scale-75 lg:scale-100">
                                            {getIcon(log.category)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 lg:mb-2">
                                            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-wider border ${getCategoryStyles(log.category)}`}>
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                                    <span className="text-[10px] lg:text-xs font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 px-2 py-0.5 lg:px-3 lg:py-1 bg-slate-50 rounded-lg lg:rounded-xl border border-slate-200 w-fit">
                                                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-md lg:rounded-lg bg-white flex items-center justify-center text-[8px] lg:text-[10px] font-black text-slate-400 border border-slate-100">
                                                    {log.user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-[10px] lg:text-xs font-bold text-slate-600 truncate max-w-[80px] lg:max-w-[120px]">{log.user.name.split(' ')[0]}</span>
                                            </div>
                                        </div>

                                        <p className="text-[12px] lg:text-[14px] text-slate-700 font-semibold leading-relaxed">
                                            {smartTranslate(log.details)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredLogs.length > 0 && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('showingRecent').replace('{count}', filteredLogs.length.toString())}</p>
                        <button
                            onClick={fetchLogs}
                            className="text-xs font-black text-[#FF4700] uppercase tracking-widest hover:underline"
                        >
                            {t('syncNow')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
