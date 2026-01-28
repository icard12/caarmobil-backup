import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, Search, X, Calculator } from 'lucide-react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface PettyCashTransaction {
    id: string;
    type: 'deposit' | 'expense';
    amount: number;
    description: string;
    date: string;
}

export default function PettyCash() {
    const { t, locale } = useLanguage();
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.pettyCash.list();
            setTransactions(data);

            const total = data.reduce((acc: number, curr: PettyCashTransaction) => {
                return curr.type === 'deposit' ? acc + curr.amount : acc - curr.amount;
            }, 0);
            setBalance(total);
        } catch (error) {
            console.error('Error fetching petty cash:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket.io Real-time listener
        const handleUpdate = (data: any) => {
            if (data.type === 'petty-cash' || data.type === 'system') {
                console.log(`[Real-time] Refreshing petty cash due to: ${data.action}`);
                fetchData();
            }
        };

        const socketPromise = import('../lib/api').then(m => m.socket);
        socketPromise.then(s => s.on('data-updated', handleUpdate));

        return () => {
            socketPromise.then(s => s.off('data-updated', handleUpdate));
        };
    }, []);

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const type = formData.get('type') as 'deposit' | 'expense';
        const amount = parseFloat(formData.get('amount') as string);
        const description = formData.get('description') as string;

        try {
            await api.pettyCash.create({ type, amount, description });
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            console.error('Error creating petty cash transaction:', error);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-zoom-fade">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4700] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Wallet className="w-6 h-6 text-[#FF4700]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">{t('internalBalance')}</h3>
                                <p className="text-[10px] font-bold text-[#FF4700] mt-0.5">{t('independentControl')}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <h2 className="text-5xl font-black tracking-tighter">
                                MT {balance.toLocaleString(locale, { minimumFractionDigits: 2 })}
                            </h2>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-4 bg-[#FF4700] hover:bg-[#E64000] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-glow-orange active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> {t('registerMovement')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <History className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('last24h')}</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">{t('todayIncomes')}</span>
                            <span className="text-sm font-black text-emerald-600">+ MT {transactions
                                .filter(t => t.type === 'deposit' && new Date(t.date).toDateString() === new Date().toDateString())
                                .reduce((acc, curr) => acc + curr.amount, 0)
                                .toLocaleString(locale)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">{t('todayExpenses')}</span>
                            <span className="text-sm font-black text-rose-600">- MT {transactions
                                .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === new Date().toDateString())
                                .reduce((acc, curr) => acc + curr.amount, 0)
                                .toLocaleString(locale)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-[#FF4700]" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('cashHistory')}</h2>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF4700] transition-colors" />
                        <input
                            type="text"
                            placeholder={t('searchMovement')}
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF4700]/20 transition-all w-full sm:w-64"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('type')}</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('description')}</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('date')}</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('value')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {transaction.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-900">{transaction.description}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{transaction.type === 'deposit' ? t('depositEntry') : t('paymentExit')}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-600">{format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{format(new Date(transaction.date), 'HH:mm')}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <p className={`text-base font-black ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {transaction.type === 'deposit' ? '+' : '-'} MT {transaction.amount.toLocaleString(locale, { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold">{t('noMovementFound')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="bg-white w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-[#FF4700]" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{t('newMovement')}</h2>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900"><X /></button>
                        </div>

                        <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${'deposit' === 'deposit' ? 'border-[#FF4700] bg-orange-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <input type="radio" name="type" value="deposit" defaultChecked className="hidden" />
                                    <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                                    <span className="text-[10px] font-black uppercase">{t('income')}</span>
                                </label>
                                <label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${'expense' === 'expense' ? 'border-slate-100 hover:border-slate-200' : ''}`}>
                                    <input type="radio" name="type" value="expense" className="hidden" />
                                    <ArrowDownLeft className="w-6 h-6 text-rose-600" />
                                    <span className="text-[10px] font-black uppercase">{t('expense')}</span>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor (MT)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl focus:ring-2 focus:ring-[#FF4700]/20 outline-none"
                                    placeholder="0,00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('description')}</label>
                                <input
                                    name="description"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-[#FF4700]/20 outline-none text-sm"
                                    placeholder={t('pettyDescPlaceholder')}
                                    required
                                />
                            </div>

                            <button className="w-full py-4 bg-[#FF4700] text-white font-black rounded-2xl shadow-glow-orange active:scale-95 transition-all">
                                {t('confirmPost')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
