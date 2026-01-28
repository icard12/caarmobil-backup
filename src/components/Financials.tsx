import { useState, useMemo } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    TrendingUp,
    Receipt,
    Wallet,
    CreditCard,
    RotateCw,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronDown,
    Search,
    User,
    Package,
    Banknote
} from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export default function Financials() {
    const { transactions, refreshData, stats } = useTransactions();
    const { t, locale, smartTranslate } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const { addTransaction } = useTransactions();



    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [transactions, searchTerm, filterType, filterStatus]);


    const getStatusBadge = (status: string, dueDate?: string) => {
        if (status === 'paid') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> {t('paid')}
                </span>
            );
        }

        const isOverdue = dueDate && isBefore(parseISO(dueDate), startOfDay(new Date()));
        if (isOverdue || status === 'overdue') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <AlertCircle className="w-3 h-3" /> {t('overdue')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                <Clock className="w-3 h-3" /> {t('pending')}
            </span>
        );
    };

    const getPaymentIcon = (method?: string) => {
        switch (method?.toLowerCase()) {
            case 'card': return <CreditCard className="w-4 h-4" />;
            case 'transfer': return <Banknote className="w-4 h-4" />;
            default: return <Wallet className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header com Glassmorphism */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
                <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-2.5 bg-[#FF4700] rounded-2xl shadow-glow-orange">
                            <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">{t('cashFlow')}</h2>
                    </div>
                    <p className="text-slate-500 font-bold text-[11px] lg:text-base ml-12 lg:ml-14">{t('proFinancialManagement')}</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={async () => {
                            setIsRefreshing(true);
                            await refreshData();
                            setTimeout(() => setIsRefreshing(false), 1000);
                        }}
                        disabled={isRefreshing}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-white border border-slate-200 text-slate-900 text-[11px] lg:text-sm font-black rounded-2xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all duration-300 uppercase tracking-widest disabled:opacity-50"
                        title={t('refresh')}
                    >
                        <RotateCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{t('sync')}</span>
                    </button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 lg:px-10 py-3.5 lg:py-4 bg-[#FF4700] text-white text-[11px] lg:text-sm font-black rounded-2xl shadow-glow-orange hover:bg-[#FF5710] active:scale-95 transition-all duration-300 uppercase tracking-widest"
                    >
                        <Receipt className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span>{t('newRecord')}</span>
                    </button>
                </div>
            </div>

            {/* Modal de Nova Transação Manual */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-white animate-in zoom-in-95 duration-300 custom-scrollbar">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('manualRecord')}</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">&times;</button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const { description, amount, type, category, paymentMethod, clientName } = (e.target as any).elements;
                            await addTransaction({
                                description: description.value,
                                clientName: clientName.value,
                                amount: parseFloat(amount.value),
                                type: type.value,
                                category: category.value,
                                status: 'paid',
                                dueDate: new Date().toISOString(),
                                paymentMethod: paymentMethod.value
                            });
                            setShowAddModal(false);
                            await refreshData();
                        }} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('type')}</label>
                                    <select name="type" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none">
                                        <option value="income">{t('income')} (+)</option>
                                        <option value="expense">{t('expense')} (-)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</label>
                                    <input name="category" placeholder={t('categoryExample')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('description')}</label>
                                    <input name="description" placeholder={t('descPlaceholder')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('clientNameOpt')}</label>
                                    <input name="clientName" placeholder={t('clientExample')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('value')} (MT)</label>
                                    <input name="amount" type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('method')}</label>
                                    <select name="paymentMethod" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none">
                                        <option value="cash">{t('cash')}</option>
                                        <option value="transfer">{t('transfer')}</option>
                                        <option value="card">{t('card')}</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl uppercase tracking-widest mt-4">{t('confirmRecord')}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Metric Grid - Automated Focus */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {/* Saldo Disponível (Saldo Total) */}
                <div className="relative group overflow-hidden bg-slate-900 p-4 lg:p-8 rounded-2xl lg:rounded-[32px] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-glow-orange/20 col-span-2 sm:col-span-1">
                    <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-[#FF4700]/20 rounded-full blur-2xl lg:blur-3xl -mr-8 lg:-mr-16 -mt-8 lg:-mt-16 group-hover:bg-[#FF4700]/30 transition-all" />
                    <p className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2">(=) {t('availableBalance')}</p>
                    <h3 className="text-lg lg:text-4xl font-black text-white mb-2 lg:mb-4 tracking-tighter">
                        <span className="text-[#FF4700] mr-1 lg:mr-2">MT</span>
                        {stats?.totalBalance?.toLocaleString(locale, { minimumFractionDigits: 2 }) ?? '0,00'}
                    </h3>
                    <div className="flex items-center gap-1.5 lg:gap-2 text-emerald-400 text-[8px] lg:text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{t('totalFlow')}</span>
                    </div>
                </div>

                {/* Receita de Loja (Total) */}
                <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all duration-500">
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-6 p-1.5 lg:p-3 bg-emerald-50 rounded-lg lg:rounded-2xl text-emerald-600">
                        <ArrowUpRight className="w-4 h-4 lg:w-6 lg:h-6" />
                    </div>
                    <p className="text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2">(+) {t('revenue')}</p>
                    <h3 className="text-lg lg:text-3xl font-black text-slate-900 mb-2 lg:mb-6 tracking-tighter">
                        MT {stats?.todayIncome?.toLocaleString(locale, { minimumFractionDigits: 2 }) ?? '0,00'}
                    </h3>
                    <div className="pt-2 lg:pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[7px] lg:text-[10px] font-black text-slate-400 uppercase">{t('today')}</span>
                        <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                {/* Vendas de Produtos (Hoje) */}
                <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all duration-500">
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-6 p-1.5 lg:p-3 bg-orange-50 rounded-lg lg:rounded-2xl text-orange-600">
                        <Package className="w-4 h-4 lg:w-6 lg:h-6" />
                    </div>
                    <p className="text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2">{t('salesToday')}</p>
                    <h3 className="text-lg lg:text-3xl font-black text-slate-900 mb-2 lg:mb-6 tracking-tighter">
                        MT {stats?.todayProductRevenue?.toLocaleString(locale, { minimumFractionDigits: 2 }) ?? '0,00'}
                    </h3>
                    <div className="pt-2 lg:pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[7px] lg:text-[10px] font-black text-slate-400 uppercase">{t('items')}</span>
                        <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-orange-500" />
                    </div>
                </div>

                {/* Lucros de Serviços */}
                <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all duration-500">
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-6 p-1.5 lg:p-3 bg-blue-50 rounded-lg lg:rounded-2xl text-blue-600">
                        <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6" />
                    </div>
                    <p className="text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2">(+) {t('services')}</p>
                    <h3 className="text-lg lg:text-3xl font-black text-slate-900 mb-2 lg:mb-6 tracking-tighter">
                        MT {stats?.todayServiceRevenue?.toLocaleString(locale, { minimumFractionDigits: 2 }) ?? '0,00'}
                    </h3>
                    <div className="pt-2 lg:pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[7px] lg:text-[10px] font-black text-slate-400 uppercase">{t('today')}</span>
                        <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-blue-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl lg:rounded-[40px] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
                {/* Control Bar */}
                <div className="p-4 lg:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                        <div className="flex bg-white p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-slate-200">
                            {(['all', 'income', 'expense'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 lg:px-6 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider transition-all duration-300 ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {type === 'all' ? t('viewAll') : type === 'income' ? t('income') : t('expense')}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

                        <div className="relative group">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="appearance-none pl-3 lg:pl-4 pr-8 lg:pr-10 py-2.5 lg:py-3 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-[#FF4700]/20 outline-none cursor-pointer"
                            >
                                <option value="all">{t('allStatus')}</option>
                                <option value="paid">{t('paid')}</option>
                                <option value="pending">{t('pending')}</option>
                                <option value="overdue">{t('overdue')}</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative flex-1 lg:max-w-md">
                        <Search className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholderFin')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-3.5 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF4700]/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Transaction Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 italic">
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-left text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('dateStatus')}</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-left text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('description')}</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-left text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('category')}</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-left text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('method')}</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-right text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('value')}</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.map((t_item) => (
                                <tr key={t_item.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="text-[12px] lg:text-sm font-black text-slate-900">
                                                {format(parseISO(t_item.date), "dd/MM")}
                                            </div>
                                            <div className="scale-75 lg:scale-100 origin-left">
                                                {getStatusBadge(t_item.status, t_item.dueDate)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <div className={`p-1.5 lg:p-2.5 rounded-lg lg:rounded-xl ${t_item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {t_item.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <ArrowDownLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12px] lg:text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                                                    {t_item.clientName ? (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3 text-[#FF4700] shrink-0" />
                                                            {smartTranslate(t_item.description)}
                                                        </span>
                                                    ) : (
                                                        smartTranslate(t_item.description)
                                                    )}
                                                </p>
                                                <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                    {t_item.id.split('-')[0].toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 hidden sm:table-cell">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-lg">
                                            {t_item.category}
                                        </span>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] lg:text-xs font-bold">
                                            {getPaymentIcon(t_item.paymentMethod)}
                                            {t_item.paymentMethod ? t(t_item.paymentMethod.toLowerCase()) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                                        <p className={`text-[13px] lg:text-base font-black ${t_item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t_item.type === 'income' ? '+' : '-'} {t_item.amount.toLocaleString(locale, { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTransactions.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Receipt className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">{t('noTransactions')}</h4>
                            <p className="text-slate-400 font-bold text-sm">{t('noRecentOps')}</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
