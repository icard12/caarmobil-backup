import { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface StockLog {
    id: string;
    productId: string;
    type: 'entry' | 'exit';
    quantity: number;
    reason: string;
    date: string;
    product: { name: string };
    user: { name: string };
}

export default function StockHistory() {
    const { t, smartTranslate } = useLanguage();
    const [logs, setLogs] = useState<StockLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await api.stockMovements.list();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        (log.product?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (log.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (log.reason?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t('auditRecord')}</h2>
                    <p className="text-slate-500 font-bold text-[11px] lg:text-base">{t('auditControlSubtitle')}</p>
                </div>

                <div className="relative w-full md:max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={t('searchAuditPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 lg:py-3 bg-white border border-slate-200 rounded-2xl text-[13px] lg:text-sm font-medium focus:ring-2 focus:ring-[#FF4700]/10 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#FF4700]" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('loadingHistory')}</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-20 text-center">
                            <p className="text-slate-400 font-medium">{t('noMovementsFound')}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 italic">
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">{t('date')}</th>
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('op')}</th>
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('product')}</th>
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">{t('quant')}</th>
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">{t('reason')}</th>
                                    <th className="p-3 lg:p-6 text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">{t('responsible')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 lg:p-6 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] lg:text-[13px] font-black text-slate-900 leading-none">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-[8px] lg:text-[11px] font-bold text-slate-400 mt-0.5">
                                                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-6">
                                            <div className="scale-75 lg:scale-100 origin-left">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${log.type === 'entry'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {log.type === 'entry' ? t('entryShort') : t('exitShort')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 lg:p-6 min-w-[100px]">
                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 truncate leading-tight">{log.product.name}</p>
                                            <p className="sm:hidden text-[10px] font-bold text-[#FF4700] mt-0.5">{log.quantity} {t('items').toLowerCase()}</p>
                                        </td>
                                        <td className="p-3 lg:p-6 text-[11px] lg:text-sm font-black text-[#FF4700] whitespace-nowrap hidden sm:table-cell">{log.quantity} {t('items').toLowerCase()}</td>
                                        <td className="p-3 lg:p-6 text-[11px] lg:text-sm italic text-slate-400 min-w-[150px] max-w-[200px] truncate hidden md:table-cell">{smartTranslate(log.reason) || t('noObs')}</td>
                                        <td className="p-3 lg:p-6 text-right">
                                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                                <span className="text-[10px] lg:text-sm font-black text-slate-700 truncate max-w-[60px] lg:max-w-none">{log.user.name.split(' ')[0]}</span>
                                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] lg:text-[10px] font-black border border-slate-200">
                                                    {log.user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
