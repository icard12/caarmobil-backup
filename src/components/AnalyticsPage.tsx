import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Package, ArrowRight, BarChart3, Target, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface AnalyticsSummary {
    topProducts: Array<{
        id: string;
        name: string;
        totalSales: number;
        revenue: number;
    }>;
    alerts: Array<{
        type: 'warning' | 'danger' | 'info';
        productId: string;
        productName: string;
        message: string;
        action: string;
    }>;
    metrics: {
        totalProducts: number;
        activeProducts: number;
        stagnantProducts: number;
        noMovementProducts: number;
        averageSalesVelocity: number;
    };
}

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    async function fetchSummary() {
        try {
            setError(null);
            const data = await api.analytics.getSummary();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            setError('Não foi possível carregar os dados de inteligência no momento.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#FF4700]/20 border-t-[#FF4700] rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center p-8">
                <div className="p-4 bg-rose-50 rounded-full text-rose-500">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Ops! Algo deu errado</h3>
                <p className="text-slate-500 max-w-md">{error || 'Dados indisponíveis'}</p>
                <button
                    onClick={() => { setLoading(true); fetchSummary(); }}
                    className="px-6 py-2 bg-[#FF4700] text-white font-bold rounded-xl shadow-glow-orange hover:bg-[#E64000] transition-all"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#FF4700] rounded-2xl shadow-glow-orange">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight text-white">Inteligência de Vendas</h2>
                    </div>
                    <p className="text-slate-500 font-bold ml-14">Insights auditados para decisão estratégica</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#16222A] p-6 rounded-[32px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4700]/10 rounded-full blur-2xl -mr-8 -mt-8" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Produtos Ativos</p>
                    <h3 className="text-3xl font-black text-white">{summary.metrics?.activeProducts ?? 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[#FF4700] text-xs font-bold">
                        <Package className="w-4 h-4" />
                        <span>de {summary.metrics?.totalProducts ?? 0} cadastrados</span>
                    </div>
                </div>

                <div className="bg-[#16222A] p-6 rounded-[32px] border border-white/5">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Velocidade de Vendas</p>
                    <h3 className="text-3xl font-black text-white">{(summary.metrics?.averageSalesVelocity ?? 0).toFixed(2)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <TrendingUp className="w-4 h-4" />
                        <span>unidades / dia med.</span>
                    </div>
                </div>

                <div className="bg-[#16222A] p-6 rounded-[32px] border border-white/5">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Risco de Encalhe</p>
                    <h3 className="text-3xl font-black text-white">{summary.metrics?.stagnantProducts ?? 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>requerem atenção</span>
                    </div>
                </div>

                <div className="bg-[#16222A] p-6 rounded-[32px] border border-white/5">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Sem Movimento (7d+)</p>
                    <h3 className="text-3xl font-black text-white">{summary.metrics?.noMovementProducts ?? 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <TrendingDown className="w-4 h-4" />
                        <span>estagnados</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Insights & Alerts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-[#FF4700]" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Alertas da Auditoria</h3>
                        </div>

                        <div className="space-y-4">
                            {summary.alerts.map((alert, index) => (
                                <div key={index} className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-[#FF4700]/30 transition-all">
                                    <div className={`p-3 rounded-2xl h-fit ${alert.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                                        alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-slate-900 text-sm">{alert.productName}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${alert.type === 'danger' ? 'bg-rose-500 text-white' :
                                                alert.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                                                }`}>
                                                {alert.type === 'danger' ? 'Crítico' : alert.type === 'warning' ? 'Atenção' : 'Informativo'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-bold">{alert.message}</p>
                                        <div className="mt-3 flex items-center gap-2 text-[#FF4700] text-[10px] font-black uppercase tracking-widest">
                                            <Target className="w-3 h-3" />
                                            Ação: {alert.action}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {summary.alerts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 font-bold">Nenhum alerta crítico no momento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Products Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#16222A] rounded-[40px] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4700]/5 rounded-full blur-3xl" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black tracking-tight">Best Sellers</h3>
                            <TrendingUp className="w-5 h-5 text-[#FF4700]" />
                        </div>

                        <div className="space-y-6">
                            {summary.topProducts.map((p, index) => (
                                <div key={p.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center font-black text-[#FF4700] text-sm group-hover:bg-[#FF4700] group-hover:text-white transition-all">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white/90 truncate max-w-[120px]">{p.name}</p>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{p.totalSales} vendidos</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#FF4700]">MT {p.revenue.toLocaleString('pt-BR')}</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase">Receita</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF4700] hover:border-[#FF4700] transition-all flex items-center justify-center gap-2 group">
                            Exportar Inteligência <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
