import { useState, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    FileSpreadsheet
} from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO, differenceInDays } from 'date-fns';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';

export default function FinancialReports() {
    const { transactions } = useTransactions();

    // Period selection
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });


    // Generate previous period automatically for comparison
    const previousPeriod = useMemo(() => {
        const start = parseISO(dateRange.start);
        const end = parseISO(dateRange.end);
        const days = differenceInDays(end, start) + 1;

        return {
            start: format(subDays(start, days), 'yyyy-MM-dd'),
            end: format(subDays(end, days), 'yyyy-MM-dd')
        };
    }, [dateRange]);

    const calculateMetrics = (start: string, end: string) => {
        const interval = {
            start: startOfDay(parseISO(start)),
            end: endOfDay(parseISO(end))
        };

        const periodTransactions = transactions.filter(t =>
            isWithinInterval(parseISO(t.date), interval)
        );

        const productIncome = periodTransactions
            .filter(t => t.type === 'income' && t.category === 'Venda de Produto')
            .reduce((acc, t) => acc + t.amount, 0);

        const serviceIncome = periodTransactions
            .filter(t => t.type === 'income' && t.category === 'Serviço de Reparo')
            .reduce((acc, t) => acc + t.amount, 0);

        const otherIncome = periodTransactions
            .filter(t => t.type === 'income' && !['Venda de Produto', 'Serviço de Reparo'].includes(t.category))
            .reduce((acc, t) => acc + t.amount, 0);

        const income = productIncome + serviceIncome + otherIncome;

        const expenses = periodTransactions
            .filter(t => t.type === 'expense' && t.category !== 'Compra de Estoque')
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            income,
            productIncome,
            serviceIncome,
            otherIncome,
            expenses,
            profit: income - expenses,
            count: periodTransactions.length,
            transactions: periodTransactions
        };
    };

    const currentMetrics = useMemo(() =>
        calculateMetrics(dateRange.start, dateRange.end),
        [transactions, dateRange]);

    const prevMetrics = useMemo(() =>
        calculateMetrics(previousPeriod.start, previousPeriod.end),
        [transactions, previousPeriod]);

    const calculateChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const handleExportPDF = () => {
        const headers = ['Data', 'Descrição', 'Tipo', 'Valor'];
        const rows = currentMetrics.transactions.map(t => [
            format(parseISO(t.date), 'dd/MM/yyyy HH:mm'),
            t.description,
            t.type === 'income' ? 'Entrada' : 'Saída',
            `MT ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        ]);

        exportToPDF(
            'Relatório Financeiro Detalhado',
            headers,
            rows,
            `relatorio-financeiro-${dateRange.start}-a-${dateRange.end}`
        );
    };

    const handleExportExcel = () => {
        const data = currentMetrics.transactions.map(t => ({
            Data: format(parseISO(t.date), 'dd/MM/yyyy HH:mm'),
            Descrição: t.description,
            Tipo: t.type === 'income' ? 'Entrada' : 'Saída',
            Valor: t.amount
        }));
        exportToExcel(data, `relatorio-financeiro-${dateRange.start}-a-${dateRange.end}`);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header with Date Selectors */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Relatórios Financeiros</h2>
                    <p className="text-slate-500 font-bold text-[11px] lg:text-base">Análise e comparação de performance por períodos</p>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-white p-4 lg:p-4 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto hide-scrollbar">
                        {[
                            { label: 'Hoje', days: 0 },
                            { label: '7D', days: 7 },
                            { label: '30D', days: 30 },
                            { label: 'Ano', days: 365 },
                        ].map((btn) => (
                            <button
                                key={btn.label}
                                onClick={() => setDateRange({
                                    start: format(subDays(new Date(), btn.days), 'yyyy-MM-dd'),
                                    end: format(new Date(), 'yyyy-MM-dd')
                                })}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 rounded-xl transition-all hover:bg-white active:scale-95 whitespace-nowrap flex-1 lg:flex-none"
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto px-2 lg:px-0">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="text-[12px] lg:text-sm font-bold text-slate-600 bg-slate-50 border-none rounded-lg p-2 lg:p-1 outline-none flex-1 lg:flex-none"
                        />
                        <span className="text-slate-300 font-bold">à</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="text-[12px] lg:text-sm font-bold text-slate-600 bg-slate-50 border-none rounded-lg p-2 lg:p-1 outline-none flex-1 lg:flex-none"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-2" />

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 lg:py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            <FileText className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 lg:py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Comparison Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Receita Total"
                    value={currentMetrics.income}
                    prevValue={prevMetrics.income}
                    icon={ArrowUpRight}
                    color="green"
                    details={[
                        { label: 'Loja', value: currentMetrics.productIncome },
                        { label: 'Serviços', value: currentMetrics.serviceIncome },
                        { label: 'Outros', value: currentMetrics.otherIncome }
                    ]}
                />
                <MetricCard
                    title="Despesas"
                    value={currentMetrics.expenses}
                    prevValue={prevMetrics.expenses}
                    icon={ArrowDownLeft}
                    color="red"
                />
                <MetricCard
                    title="Lucro Líquido"
                    value={currentMetrics.profit}
                    prevValue={prevMetrics.profit}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Desempenho Financeiro Card */}
                <div className="bg-white p-6 lg:p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:border-[#FF4700]/10 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4700]/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-[#FF4700]/10 transition-all duration-700" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#FF4700] to-[#FF6A00] rounded-2xl flex items-center justify-center shadow-glow-orange animate-pulse-subtle">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Desempenho Financeiro</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Volume de Movimentação</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Receita
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 border-l border-slate-200">
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Despesa
                            </div>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-around px-2 lg:px-6 gap-4 lg:gap-12 relative z-10">
                        {/* Current Period Column */}
                        <div className="flex flex-col items-center gap-4 w-28 group/bar">
                            <div className="relative w-full flex items-end justify-center gap-2 h-56 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50">
                                <div
                                    className="w-10 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xl transition-all duration-1000 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 cursor-pointer"
                                    style={{ height: `${Math.max(10, Math.min(100, (currentMetrics.income / Math.max(currentMetrics.income, currentMetrics.expenses || 1)) * 100))}%` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-lg">
                                        MT {currentMetrics.income.toLocaleString()}
                                    </div>
                                </div>
                                <div
                                    className="w-10 bg-gradient-to-t from-rose-600 to-rose-400 rounded-xl transition-all duration-1000 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/30 cursor-pointer"
                                    style={{ height: `${Math.max(10, Math.min(100, (currentMetrics.expenses / Math.max(currentMetrics.income, currentMetrics.expenses || 1)) * 100))}%` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded-lg">
                                        MT {currentMetrics.expenses.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg">Período Atual</span>
                        </div>

                        {/* Prev Period Column */}
                        <div className="flex flex-col items-center gap-4 w-28 opacity-40 hover:opacity-100 transition-all duration-500 group/bar">
                            <div className="relative w-full flex items-end justify-center gap-2 h-56 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50">
                                <div
                                    className="w-10 bg-slate-400 rounded-xl transition-all duration-1000"
                                    style={{ height: `${Math.max(10, Math.min(100, (prevMetrics.income / Math.max(prevMetrics.income, prevMetrics.expenses || 1)) * 100))}%` }}
                                />
                                <div
                                    className="w-10 bg-slate-300 rounded-xl transition-all duration-1000"
                                    style={{ height: `${Math.max(10, Math.min(100, (prevMetrics.expenses / Math.max(prevMetrics.income, prevMetrics.expenses || 1)) * 100))}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em]">Período Anterior</span>
                        </div>
                    </div>
                </div>

                {/* Análise de Lucratividade Card */}
                <div className="bg-white p-6 lg:p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 group hover:border-blue-500/10 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-blue-100/50 transition-all duration-700" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Análise de Lucratividade</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.2em]">Margens e Crescimento</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <ProfitProgress
                            label="Período Atual"
                            income={currentMetrics.income}
                            expenses={currentMetrics.expenses}
                            color="blue"
                        />
                        <ProfitProgress
                            label="Período Anterior"
                            income={prevMetrics.income}
                            expenses={prevMetrics.expenses}
                            color="slate"
                        />

                        <div className="pt-8 border-t-2 border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Crescimento de Lucro</span>
                                    <p className="text-[10px] font-bold text-slate-400">Relação direta entre períodos</p>
                                </div>
                                <div className={`flex flex-col items-end ${calculateChange(currentMetrics.profit, prevMetrics.profit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    <span className="text-2xl font-black tracking-tight">
                                        {calculateChange(currentMetrics.profit, prevMetrics.profit) >= 0 ? '+' : ''}{calculateChange(currentMetrics.profit, prevMetrics.profit).toFixed(1)}%
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Percentual Delta</span>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${calculateChange(currentMetrics.profit, prevMetrics.profit) >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                                    style={{ width: `${Math.min(100, Math.abs(calculateChange(currentMetrics.profit, prevMetrics.profit)))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, prevValue, icon: Icon, color, details }: any) {
    const change = ((value - prevValue) / (prevValue || 1)) * 100;
    const isPositive = change >= 0;

    const colors: any = {
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100 from-emerald-600 to-emerald-400',
        red: 'bg-rose-50 text-rose-600 border-rose-100 from-rose-600 to-rose-400',
        blue: 'bg-blue-50 text-blue-600 border-blue-100 from-blue-600 to-blue-400',
    };

    return (
        <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors[color].split(' ')[0]} rounded-full blur-[80px] opacity-30 -mr-16 -mt-16 group-hover:opacity-50 transition-all`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
                        <p className="text-[9px] font-bold text-slate-400">Total do Período</p>
                    </div>
                </div>
            </div>

            <div className="text-4xl font-black text-slate-900 tracking-tight mb-6 relative z-10">
                <span className="text-sm font-bold text-slate-400 mr-2">MT</span>
                {value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0,00'}
            </div>

            {details && (
                <div className="mt-6 pt-6 border-t border-slate-50 space-y-3 relative z-10">
                    {details.map((d: any, i: number) => (
                        <div key={i} className="flex justify-between items-center group/item">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-slate-600 transition-colors">{d.label}</span>
                            <span className="text-xs font-bold text-slate-700">MT {d.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0,00'}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50 relative z-10">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">vs período anterior</span>
            </div>
        </div>
    );
}

function ProfitProgress({ label, income, expenses, color }: any) {
    const margin = income === 0 ? 0 : ((income - expenses) / income) * 100;
    const colors: any = {
        blue: 'from-blue-600 to-blue-400 shadow-blue-500/20',
        slate: 'from-slate-500 to-slate-400 shadow-slate-500/10'
    };

    return (
        <div className="space-y-3 group/progress">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                    <p className="text-[9px] font-bold text-slate-400">Eficiência Operacional</p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-slate-900 tracking-tight">{margin.toFixed(1)}%</span>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Margem</p>
                </div>
            </div>
            <div className="w-full h-5 bg-slate-50 rounded-2xl p-1 border border-slate-100 group-hover/progress:border-slate-200 transition-all">
                <div
                    className={`h-full rounded-xl transition-all duration-1000 bg-gradient-to-r shadow-lg ${colors[color]}`}
                    style={{ width: `${Math.max(5, Math.min(100, margin))}%` }}
                />
            </div>
        </div>
    );
}

