import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, Smartphone, User, FileText, DollarSign, X, Image as ImageIcon, Search, Package, Trash2, Trash, Pencil } from 'lucide-react';
import ImageUpload from './ui/ImageUpload';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useTeam } from '../contexts/TeamContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTransactions } from '../contexts/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceOrder {
    id: string;
    clientName: string;
    clientPhone?: string;
    deviceModel: string;
    description: string;
    status: 'pending' | 'in_progress' | 'finished' | 'delivered';
    price: number;
    createdAt: string;
    deliveredAt?: string | null;
    imageUrl?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    parts?: Array<{
        id: string;
        productId: string;
        quantity: number;
        unitPrice: number;
        product: { name: string };
    }>;
}

export default function ServiceOrders() {
    const { t, locale } = useLanguage();
    const { currentUser } = useTeam();
    const { addNotification } = useNotifications();
    const { services, pendingRequests, refreshData } = useTransactions();
    const isAdmin = currentUser?.role === 'admin';
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        deviceModel: '',
        description: '',
        price: '',
        imageUrl: '',
        frontImageUrl: '',
        backImageUrl: ''
    });
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [selectedParts, setSelectedParts] = useState<any[]>([]);
    const [partSearch, setPartSearch] = useState('');
    const [showPartSearch, setShowPartSearch] = useState(false);

    useEffect(() => {
        if (showForm) {
            api.products.list().then(setAvailableProducts).catch(console.error);
        }
    }, [showForm]);

    useEffect(() => {
        if (showForm) {
            api.products.list().then(setAvailableProducts).catch(console.error);
        }
    }, [showForm]);

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!isAdmin) {
            try {
                await api.permissionRequests.create({
                    type: 'UPDATE_SERVICE_STATUS',
                    details: { status },
                    targetId: id
                });
                addNotification?.(t('requestSent') || 'Solicitação enviada ao administrador', 'info');
                return;
            } catch (error) {
                console.error('Error sending request:', error);
                return;
            }
        }
        try {
            await api.services.update(id, { status });
            await refreshData();
        } catch (error) {
            console.error('Error updating service status:', error);
        }
    };

    const [confirmToDelete, setConfirmToDelete] = useState<string | null>(null);

    const handleDeleteService = (id: string) => {
        setConfirmToDelete(id);
    };

    const executeDeleteService = async () => {
        if (!confirmToDelete) return;
        const id = confirmToDelete;
        setConfirmToDelete(null);

        if (!isAdmin) {
            try {
                await api.permissionRequests.create({
                    type: 'DELETE_SERVICE',
                    details: { id },
                    targetId: id
                });
                addNotification?.(t('requestSent') || 'Solicitação de exclusão enviada', 'info');
                return;
            } catch (error) {
                console.error('Error sending request:', error);
                return;
            }
        }

        try {
            await api.services.delete(id);
            await refreshData();
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };


    const handleSaveService = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const servicePrice = parseFloat(formData.price) || 0;
            const serviceParts = selectedParts.map(p => ({ productId: p.id, quantity: p.qty }));

            if (!isAdmin) {
                await api.permissionRequests.create({
                    type: editingId ? 'UPDATE_SERVICE' : 'CREATE_SERVICE',
                    details: {
                        ...formData,
                        price: servicePrice,
                        parts: serviceParts
                    },
                    targetId: editingId || undefined
                });
                addNotification?.(t('requestSent') || 'Solicitação enviada ao administrador', 'info');
                setShowForm(false);
                setEditingId(null);
                setFormData({ clientName: '', clientPhone: '', deviceModel: '', description: '', price: '', imageUrl: '', frontImageUrl: '', backImageUrl: '' });
                setSelectedParts([]);
                return;
            }

            if (editingId) {
                await api.services.update(editingId, {
                    ...formData,
                    price: servicePrice
                });
            } else {
                await api.services.create({
                    ...formData,
                    status: 'pending',
                    price: servicePrice,
                    parts: serviceParts
                });
            }
            await refreshData();
            setShowForm(false);
            setEditingId(null);
            setFormData({ clientName: '', clientPhone: '', deviceModel: '', description: '', price: '', imageUrl: '', frontImageUrl: '', backImageUrl: '' });
            setSelectedParts([]);
        } catch (error) {
            console.error('Error saving service:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditService = (service: ServiceOrder) => {
        setFormData({
            clientName: service.clientName,
            clientPhone: service.clientPhone || '',
            deviceModel: service.deviceModel,
            description: service.description,
            price: service.price.toString(),
            imageUrl: service.imageUrl || '',
            frontImageUrl: service.frontImageUrl || '',
            backImageUrl: service.backImageUrl || ''
        });
        setEditingId(service.id);
        setShowForm(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'finished': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'delivered': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return t('pending');
            case 'in_progress': return t('inProgress');
            case 'finished': return t('finished');
            case 'delivered': return t('delivered');
            default: return status;
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                <div className="space-y-0.5 lg:space-y-1">
                    <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">{t('serviceManagement')}</h2>
                    <p className="text-slate-500 font-bold text-[9px] lg:text-base uppercase tracking-wider">{t('repairControl')}</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ clientName: '', clientPhone: '', deviceModel: '', description: '', price: '', imageUrl: '', frontImageUrl: '', backImageUrl: '' });
                        setSelectedParts([]);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 lg:py-3.5 bg-[#FF4700] text-white text-[11px] lg:text-sm font-bold rounded-xl shadow-glow-orange hover:bg-[#E64000] transition-all active:scale-95 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5 lg:w-4 lg:h-4" />
                    <span>{isAdmin ? t('newService') : 'Solicitar Serviço'}</span>
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                {['pending', 'in_progress', 'finished', 'delivered'].map(status => (
                    <div key={status} className="bg-white p-2.5 lg:p-6 rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 lg:w-16 lg:h-16 bg-slate-50 rounded-full -mr-6 -mt-6 lg:-mr-8 lg:-mt-8 group-hover:bg-slate-100 transition-colors" />
                        <div className="flex justify-between items-start relative z-10 mb-2 lg:mb-4">
                            <h3 className="text-[7px] lg:text-xs font-black text-slate-400 uppercase tracking-wider">{getStatusLabel(status)}</h3>
                            {status === 'pending' && <Clock className="w-3 h-3 text-yellow-500" />}
                            {status === 'in_progress' && <Clock className="w-3 h-3 text-blue-500 animate-spin-slow" />}
                            {status === 'finished' && <CheckCircle2 className="w-3 h-3 text-orange-500" />}
                            {status === 'delivered' && <Package className="w-3 h-3 text-slate-400" />}
                        </div>
                        <div className="flex flex-col relative z-10">
                            <div className="text-base lg:text-2xl font-black text-slate-900 leading-none">
                                {Array.isArray(services) ? services.filter((s: ServiceOrder) => s.status === status).length : 0}
                                <span className="text-[8px] lg:text-[10px] text-slate-400 ml-1 uppercase">{t('items')}</span>
                            </div>
                            <div className="text-[10px] lg:text-sm font-bold text-[#FF4700] mt-1 lg:mt-2">
                                MT {(Array.isArray(services) ? services.filter((s: ServiceOrder) => s.status === status).reduce((acc, curr) => acc + (curr.price || 0), 0) : 0).toLocaleString(locale, { minimumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4">
                {!Array.isArray(services) || services.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Clock className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{t('noServiceFound')}</h3>
                        <p className="text-slate-500">{t('clickToStart')}</p>
                    </div>
                ) : services.map((service) => (
                    <div key={service.id} className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-baseline md:items-center justify-between gap-3 lg:gap-6">
                        <div className="flex-1 w-full space-y-2 lg:space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                                <span className={`px-1.5 py-0.5 lg:px-3 lg:py-1 rounded-md lg:rounded-lg text-[7px] lg:text-[10px] font-black uppercase tracking-wider border ${getStatusColor(service.status)}`}>
                                    {getStatusLabel(service.status)}
                                </span>
                                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {service.createdAt ? (
                                        <>
                                            {new Date(service.createdAt).toLocaleDateString(locale)}
                                            <span className="opacity-50 mx-1">|</span>
                                            {new Date(service.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                        </>
                                    ) : '---'}
                                </span>
                                {service.deliveredAt && (
                                    <span className="text-green-500 text-[7px] lg:text-[10px] font-black flex items-center gap-0.5 lg:gap-1 uppercase tracking-wider">
                                        <CheckCircle2 className="w-2 h-2 lg:w-2.5 lg:h-2.5" />
                                        {t('delivered')}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 lg:gap-3">
                                {service.imageUrl && (
                                    <div
                                        className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden border border-slate-100 shrink-0 cursor-zoom-in group/img relative"
                                        onClick={() => setViewImage(service.imageUrl || null)}
                                    >
                                        <img src={service.imageUrl} alt={t('device')} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <Search className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}
                                {service.frontImageUrl && (
                                    <div
                                        className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden border border-slate-100 shrink-0 cursor-zoom-in group/img relative"
                                        onClick={() => setViewImage(service.frontImageUrl || null)}
                                    >
                                        <img src={service.frontImageUrl} alt="Front" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-black uppercase">
                                            {t('frontPhoto')}
                                        </div>
                                    </div>
                                )}
                                {service.backImageUrl && (
                                    <div
                                        className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden border border-slate-100 shrink-0 cursor-zoom-in group/img relative"
                                        onClick={() => setViewImage(service.backImageUrl || null)}
                                    >
                                        <img src={service.backImageUrl} alt="Back" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-black uppercase">
                                            {t('backPhoto')}
                                        </div>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="text-xs lg:text-lg font-black text-slate-900 truncate leading-tight">{service.deviceModel}</h3>
                                    <div className="flex flex-col gap-0.5 mt-0.5 lg:mt-1 overflow-hidden">
                                        <span className="flex items-center gap-1 text-[9px] lg:text-sm text-slate-500 font-bold truncate">
                                            <User className="w-2.5 h-2.5 text-slate-400" /> {service.clientName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] lg:text-sm text-slate-400 truncate italic">
                                            <FileText className="w-2.5 h-2.5 text-slate-400" /> {service.description}
                                        </span>
                                        {service.parts && service.parts.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {service.parts.map((p: any, i: number) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-bold rounded uppercase">
                                                        {p.quantity}x {p.product?.name || t('part')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-2 lg:pt-0">
                            <div className="text-left md:text-right">
                                <p className="text-[7px] lg:text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5 lg:mb-1">{t('value')}</p>
                                <p className="text-base lg:text-xl font-black text-[#FF4700]">MT {(service.price || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const isPending = Array.isArray(pendingRequests) && pendingRequests.some((r: any) => r.targetId === service.id);
                                    return (
                                        <>
                                            {service.status === 'pending' && (
                                                <button
                                                    onClick={() => !isPending && handleUpdateStatus(service.id, 'in_progress')}
                                                    disabled={isPending && !isAdmin}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider border ${isPending && !isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100'}`}
                                                >
                                                    {isPending && !isAdmin ? <Clock className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {isAdmin ? t('start') : (isPending ? 'Pendente' : 'Soli. Início')}
                                                </button>
                                            )}
                                            {service.status === 'in_progress' && (
                                                <button
                                                    onClick={() => !isPending && handleUpdateStatus(service.id, 'finished')}
                                                    disabled={isPending && !isAdmin}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider border ${isPending && !isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100'}`}
                                                >
                                                    {isPending && !isAdmin ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    {isAdmin ? t('finish') : (isPending ? 'Pendente' : 'Soli. Término')}
                                                </button>
                                            )}
                                            {service.status === 'finished' && (
                                                <button
                                                    onClick={() => !isPending && handleUpdateStatus(service.id, 'delivered')}
                                                    disabled={isPending && !isAdmin}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider border ${isPending && !isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100'}`}
                                                >
                                                    {isPending && !isAdmin ? <Clock className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                                                    {isAdmin ? t('deliver') : (isPending ? 'Pendente' : 'Soli. Entrega')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => !isPending && handleEditService(service)}
                                                disabled={isPending && !isAdmin}
                                                className={`p-2.5 rounded-xl border transition-all ${isPending && !isAdmin ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100'}`}
                                                title={isAdmin ? t('edit') : (isPending ? 'Solicitação Pendente' : 'Solicitar Edição')}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => !isPending && handleDeleteService(service.id)}
                                                disabled={isPending && !isAdmin}
                                                className={`p-2.5 rounded-xl border transition-all ${isPending && !isAdmin ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100'}`}
                                                title={isAdmin ? t('delete') : (isPending ? 'Solicitação Pendente' : 'Solicitar Exclusão')}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            drag="y"
                            dragDirectionLock
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) setShowForm(false);
                            }}
                            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar pb-safe touch-none sm:touch-auto"
                        >
                            {/* Drag Handle for Mobile */}
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
                            <div className="flex items-center justify-between mb-2 sm:mb-4 sticky top-0 bg-white z-10 pb-1">
                                <div>
                                    <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">{editingId ? (isAdmin ? 'Editar' : 'Pedir Edição') : (isAdmin ? 'Novo' : 'Enviar Pedido')}</h2>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{editingId ? 'Atualizar' : 'Novo Registro'}</p>
                                </div>
                                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                    <div className="space-y-0.5">
                                        <label className="text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-wider block">{t('client')}</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border-none font-bold text-xs transition-all"
                                                value={formData.clientName}
                                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <label className="text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-wider block">{t('phone')}</label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border-none font-bold text-xs transition-all"
                                                value={formData.clientPhone}
                                                onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-0.5">
                                        <label className="text-[8px] sm:text-xs font-black text-slate-500 uppercase block">{t('device')}</label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border-none font-bold text-xs"
                                                value={formData.deviceModel}
                                                onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <label className="text-[8px] sm:text-xs font-black text-slate-500 uppercase block">{t('value')}</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border-none font-black text-xs text-emerald-600"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] sm:text-xs font-black text-slate-500 uppercase block">{t('problemDescription')}</label>
                                    <textarea
                                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border-none font-bold h-16 sm:h-28 text-xs resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5 text-[#FF4700]" /> {t('appliedParts')}
                                    </h3>

                                    <div className="space-y-2">
                                        {selectedParts.map((part) => (
                                            <div key={part.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-900 truncate">{part.name}</p>
                                                    <p className="text-[9px] text-slate-500">MT {part.price.toFixed(2)} un</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                        <button onClick={() => setSelectedParts(prev => prev.map(p => p.id === part.id ? { ...p, qty: Math.max(1, p.qty - 1) } : p))} className="text-slate-400 hover:text-slate-600 font-bold">-</button>
                                                        <span className="text-xs font-black min-w-[20px] text-center">{part.qty}</span>
                                                        <button onClick={() => setSelectedParts(prev => prev.map(p => p.id === part.id ? { ...p, qty: Math.min(part.stock, p.qty + 1) } : p))} className="text-slate-400 hover:text-slate-600 font-bold">+</button>
                                                    </div>
                                                    <button onClick={() => setSelectedParts(prev => prev.filter(p => p.id !== part.id))} className="text-rose-500 hover:text-rose-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder={t('addPart')}
                                                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-[#FF4700]/20"
                                                    value={partSearch}
                                                    onChange={(e) => {
                                                        setPartSearch(e.target.value);
                                                        setShowPartSearch(true);
                                                    }}
                                                    onFocus={() => setShowPartSearch(true)}
                                                />
                                            </div>

                                            {showPartSearch && partSearch.length > 0 && (
                                                <div className="absolute z-60 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                                    {availableProducts
                                                        .filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase()) && p.stock > 0 && !selectedParts.some(sp => sp.id === p.id))
                                                        .map(product => (
                                                            <button
                                                                key={product.id}
                                                                onClick={() => {
                                                                    setSelectedParts([...selectedParts, { ...product, qty: 1 }]);
                                                                    setPartSearch('');
                                                                    setShowPartSearch(false);
                                                                }}
                                                                className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                                            >
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800 tracking-tight">{product.name}</p>
                                                                    <p className="text-[10px] text-slate-400 uppercase font-black">{t('stockLabel')} {product.stock} un</p>
                                                                </div>
                                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-[#FF4700]" />
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pb-1.5 pt-1.5 border-t border-slate-100">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Foto Frontal
                                        </label>
                                        <ImageUpload
                                            onUpload={(url) => setFormData({ ...formData, frontImageUrl: url })}
                                            initialUrl={formData.frontImageUrl}
                                            bucket="service-orders"
                                            compact={true}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Foto Traseira
                                        </label>
                                        <ImageUpload
                                            onUpload={(url) => setFormData({ ...formData, backImageUrl: url })}
                                            initialUrl={formData.backImageUrl}
                                            bucket="service-orders"
                                            compact={true}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveService}
                                    disabled={isSaving}
                                    className="w-full py-3 sm:py-5 bg-gradient-to-r from-[#FF4700] to-[#FF6A00] text-white font-black uppercase text-xs lg:text-sm tracking-[0.2em] rounded-24 lg:rounded-2xl shadow-glow-orange hover:brightness-110 active:scale-[0.98] transition-all mt-2 mb-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {editingId ? (isAdmin ? t('save') : 'Solicitar Alteração') : (isAdmin ? t('newService') : 'Enviar Solicitação')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-[280px] sm:max-w-sm rounded-[32px] p-4 sm:p-8 shadow-2xl border border-slate-200"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-3 text-red-600">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-base sm:text-xl font-black text-slate-900 mb-1">Eliminar Serviço</h3>
                                <p className="text-slate-500 text-[11px] sm:text-sm font-bold mb-6">
                                    Tem certeza que deseja {isAdmin ? 'remover este serviço?' : 'solicitar a remoção deste serviço?'}
                                </p>

                                <div className="flex flex-col w-full gap-2">
                                    <button
                                        onClick={executeDeleteService}
                                        className="w-full py-2.5 bg-red-600 text-white font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg active:scale-95 transition-all"
                                    >
                                        {isAdmin ? t('delete') : 'Solicitar'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmToDelete(null)}
                                        className="w-full py-2.5 bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Full Image Viewer - Optimized for Mobile & iOS */}
            <AnimatePresence>
                {viewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
                        onClick={() => setViewImage(null)}
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        <button
                            className="absolute top-safe-4 right-6 lg:top-8 lg:right-8 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[210] active:scale-90"
                            onClick={() => setViewImage(null)}
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={viewImage}
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                                alt="Visualização"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
