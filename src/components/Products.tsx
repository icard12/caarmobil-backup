import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Plus, Tag, DollarSign, Layers, X, Pencil, Image as ImageIcon, ArrowUpRight, ArrowDownRight, AlertTriangle, Trash2, ShoppingCart, Check, Clock } from 'lucide-react';
import ImageUpload from './ui/ImageUpload';
import DataTable, { TableColumn } from './dashboard/DataTable';
import { Product } from '../lib/supabase';
import { api } from '../lib/api';
import { useTeam } from '../contexts/TeamContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTransactions } from '../contexts/TransactionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductBadge from './ui/ProductBadge';
import { searchProducts } from '../lib/search';

interface ProductAnalytics extends Product {
    totalSales?: number;
    salesVelocity?: number;
    daysSinceLastMovement?: number;
    status: any;
}

interface ProductsProps {
    searchQuery?: string;
}

export default function Products({ searchQuery = '' }: ProductsProps) {
    const { currentUser } = useTeam();
    const { addNotification } = useNotifications();
    const { t, locale } = useLanguage();
    const { products, pendingRequests, loading, refreshData, updatePermissionRequestStatus } = useTransactions();

    // We still keep a small local state for optimistic updates during the current session
    // but we initialize it from the global products.
    const [localProducts, setLocalProducts] = useState<ProductAnalytics[]>([]);

    useEffect(() => {
        setLocalProducts(products);
    }, [products]);
    const [showForm, setShowForm] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustData, setAdjustData] = useState({ type: 'entry' as 'entry' | 'exit', quantity: '', reason: '', isFinancial: false });
    const [isQuickSell, setIsQuickSell] = useState(false);
    const [isSellingId, setIsSellingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Smartphones & Tablets',
        price: '',
        costPrice: '',
        stock: '',
        minStock: '5',
        image_url: ''
    });

    const isAdmin = currentUser?.role === 'admin';

    const handleApproveRequest = async (id: string) => {
        try {
            await updatePermissionRequestStatus(id, 'approved');
            addNotification(t('requestApproved') || 'Registado com sucesso!', 'success');
        } catch (error) {
            addNotification(t('errorApproving') || 'Erro ao aprovar solicitação', 'error');
        }
    };

    const handleRejectRequest = async (id: string) => {
        try {
            await updatePermissionRequestStatus(id, 'rejected');
            addNotification(t('requestRejected') || 'Solicitação rejeitada', 'info');
        } catch (error) {
            addNotification(t('errorRejecting') || 'Erro ao rejeitar solicitação', 'error');
        }
    };


    // refreshData is already available via destructuring at line 30

    async function handleAdjustStock() {
        if (!selectedProduct || !adjustData.quantity || !currentUser) return;

        const qty = parseInt(adjustData.quantity);
        if (adjustData.type === 'exit' && selectedProduct.stock < qty) {
            addNotification(t('insufficientStock'), 'error');
            return;
        }
        if (adjustData.type === 'exit' && (selectedProduct.stock - qty) < 0) {
            addNotification(t('negativeStockError'), 'error');
            return;
        }

        if (!isAdmin && !isQuickSell) {
            try {
                await api.permissionRequests.create({
                    type: 'UPDATE_PRODUCT',
                    details: {
                        ...selectedProduct,
                        stock: selectedProduct.stock + (adjustData.type === 'entry' ? qty : -qty),
                        // Add reason to details so admin can see why
                        _reason: adjustData.reason || (adjustData.type === 'entry' ? 'Entrada Manual' : 'Saída Manual')
                    },
                    targetId: selectedProduct.id
                });
                addNotification(t('requestSent') || 'Solicitação de ajuste enviada ao administrador', 'info');
                setShowAdjustModal(false);
                return;
            } catch (error) {
                addNotification(t('errorSendingRequest') || 'Erro ao enviar solicitação', 'error');
                return;
            }
        }

        try {
            await api.products.adjustStock({
                productId: selectedProduct.id,
                userId: currentUser.id,
                type: adjustData.type,
                quantity: qty,
                reason: adjustData.reason,
                isFinancial: isQuickSell || adjustData.isFinancial
            });

            if (adjustData.type === 'exit') {
                addNotification(t('itemsRemoved').replace('{count}', qty.toString()), 'success');
            } else {
                addNotification(t('productUpdated'), 'success');
            }

            // Optimistic update
            const newStock = selectedProduct.stock + (adjustData.type === 'entry' ? qty : -qty);
            const adjustedProduct = {
                ...selectedProduct,
                stock: newStock,
                status: newStock > 0 ? 'active' : 'out_of_stock'
            };
            setLocalProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...adjustedProduct } : p));

            setShowAdjustModal(false);
            setAdjustData({ type: 'entry', quantity: '', reason: '', isFinancial: false });

            // Global refresh for real-time totals
            refreshData();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || t('errorSavingProduct');
            addNotification(errorMsg, 'error');
        }
    }

    async function handleSaveProduct() {
        if (!formData.name || !formData.price || !formData.stock) return;

        const productData = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            costPrice: parseFloat(formData.costPrice || '0'),
            stock: parseInt(formData.stock),
            minStock: parseInt(formData.minStock),
            image_url: formData.image_url,
        };

        if (!isAdmin) {
            try {
                await api.permissionRequests.create({
                    type: isEditing ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
                    details: productData,
                    targetId: editId || undefined
                });
                addNotification(t('requestSent') || 'Solicitação enviada ao administrador', 'info');
                setShowForm(false);
                setIsEditing(false);
                setEditId(null);
                setFormData({ name: '', category: 'Smartphones & Tablets', price: '', costPrice: '', stock: '', minStock: '5', image_url: '' });
                return;
            } catch (error) {
                addNotification(t('errorSendingRequest') || 'Erro ao enviar solicitação', 'error');
                return;
            }
        }

        if (isSaving) return;
        setIsSaving(true);
        try {
            if (isEditing && editId) {
                // Optimistic update for edit
                const updatedProduct = {
                    ...productData,
                    id: editId,
                    status: productData.stock > 0 ? 'active' : 'out_of_stock'
                };
                setLocalProducts(prev => prev.map(p => p.id === editId ? {
                    ...p,
                    ...updatedProduct,
                    totalSales: p.totalSales,
                    salesVelocity: p.salesVelocity,
                    daysSinceLastMovement: p.daysSinceLastMovement
                } : p));

                await api.products.update(editId, productData);
                addNotification(t('productUpdated'), 'success');
            } else {
                const data = await api.products.create(productData);
                const newProduct: ProductAnalytics = {
                    ...data,
                    totalSales: 0,
                    salesVelocity: 0,
                    daysSinceLastMovement: -1,
                    status: 'no-movement',
                    badge: { type: 'no-movement', label: 'Novo', color: 'blue' }
                };
                setLocalProducts(prev => [newProduct, ...prev]);
                addNotification(t('productCreated'), 'success');
            }

            // Sync global stats immediately
            refreshData();

            setShowForm(false);
            setIsEditing(false);
            setEditId(null);
            setFormData({ name: '', category: 'Smartphones & Tablets', price: '', costPrice: '', stock: '', minStock: '5', image_url: '' });
        } catch (error: any) {
            console.error('Error saving product:', error);
            const errorMsg = error.response?.data?.error || t('errorSavingProduct');
            addNotification(errorMsg, 'error');
        } finally {
            setIsSaving(false);
        }
    }

    function handleEdit(product: Product) {
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            costPrice: (product.costPrice || 0).toString(),
            stock: product.stock.toString(),
            minStock: (product.minStock || 0).toString(),
            image_url: product.image_url || ''
        });
        setEditId(product.id);
        setIsEditing(true);
        setShowForm(true);
    }

    const [confirmToDelete, setConfirmToDelete] = useState<string | null>(null);

    function handleDeleteProduct(id: string) {
        setConfirmToDelete(id);
    }

    async function executeDeleteProduct() {
        if (!confirmToDelete) return;
        const id = confirmToDelete;
        setConfirmToDelete(null);

        if (!isAdmin) {
            try {
                await api.permissionRequests.create({
                    type: 'DELETE_PRODUCT',
                    details: { id },
                    targetId: id
                });
                addNotification(t('requestSent') || 'Solicitação de exclusão enviada', 'info');
                return;
            } catch (error) {
                addNotification(t('errorSendingRequest') || 'Erro ao enviar solicitação', 'error');
                return;
            }
        }

        try {
            await api.products.delete([id]);
            setLocalProducts(prev => prev.filter(p => p.id !== id));
            addNotification(t('productDeleted'), 'warning');
        } catch (error) {
            console.error('Error deleting product:', error);
            addNotification(t('errorDeletingProduct'), 'error');
        }
    }

    const [confirmQuickSell, setConfirmQuickSell] = useState<Product | null>(null);

    async function handleQuickSell(product: Product) {
        if (!currentUser || isSellingId) return;
        if (product.stock < 1) {
            addNotification(t('insufficientStock'), 'error');
            return;
        }

        setConfirmQuickSell(product);
    }

    async function executeQuickSell(product: Product) {
        if (!currentUser) return;
        setConfirmQuickSell(null);

        if (!isAdmin) {
            // Check if it's a quick sell (decreasing stock by 1)
            // Normal users and managers are allowed to SELL without admin permission
            // but manual adjustments still require requests.
            if (!isQuickSell) {
                try {
                    await api.permissionRequests.create({
                        type: 'UPDATE_PRODUCT',
                        details: {
                            ...product,
                            stock: product.stock - 1,
                            _reason: t('quickSell')
                        },
                        targetId: product.id
                    });
                    addNotification(t('requestSent') || 'Solicitação de venda enviada ao administrador', 'info');
                    return;
                } catch (error) {
                    addNotification(t('errorSendingRequest') || 'Erro ao enviar solicitação', 'error');
                    return;
                }
            }
        }

        setIsSellingId(product.id);
        try {
            await api.products.adjustStock({
                productId: product.id,
                userId: currentUser.id,
                type: 'exit',
                quantity: 1,
                reason: t('quickSell'),
                isFinancial: true
            });

            // Optimistic update for immediate feedback
            setLocalProducts(prev => prev.map(p =>
                p.id === product.id ? {
                    ...p,
                    stock: p.stock - 1,
                    status: (p.stock - 1) > 0 ? 'active' : 'out_of_stock'
                } : p
            ));

            addNotification(t('quickSellSuccess'), 'success');

            // Global refresh for dashboard and financial hubs
            await refreshData();
        } catch (error) {
            console.error('Error in instant sale:', error);
            addNotification(t('quickSellError'), 'error');
        } finally {
            setIsSellingId(null);
        }
    }

    const filteredProducts = searchProducts(localProducts, searchQuery);

    const columns: TableColumn[] = [
        {
            header: t('image'),
            accessor: 'image_url',
            render: (url: string) => (
                <div className="w-10 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                    <img src={url || logo} alt="Produto" className="w-full h-full object-cover grayscale" />
                </div>
            )
        },
        {
            header: t('title'),
            accessor: 'name',
            render: (value: any, row: ProductAnalytics) => (
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#FF4700] group-hover:underline cursor-pointer">{value as string}</span>
                    {row.status && row.status !== 'normal' && Object.keys({ 'best-seller': 1, 'low-sales': 1, 'no-movement': 1, 'stagnant': 1 }).includes(row.status) && (
                        <ProductBadge type={row.status} />
                    )}
                </div>
            )
        },
        {
            header: t('category'),
            accessor: 'category',
            render: (value: any) => (
                <span className="text-[12px] text-slate-500 uppercase font-bold tracking-wider">
                    {value as string}
                </span>
            )
        },
        {
            header: t('price'),
            accessor: 'price',
            render: (value: any) => (
                <span className="font-bold text-slate-800">MT {(Number(value) || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
            )
        },
        {
            header: t('qty'),
            accessor: 'stock',
            render: (value: any, row: Product) => {
                const stock = value as number;
                const minStock = row.minStock || 0;
                const isLow = stock <= minStock;
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${stock === 0 ? 'bg-red-600' : isLow ? 'bg-orange-500 animate-pulse' : 'bg-[#FF4700]'}`} />
                        <div className="flex flex-col">
                            <span className={`font-bold ${stock === 0 ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-slate-600'}`}>
                                {stock} un
                            </span>
                            {isLow && stock > 0 && <span className="text-[9px] font-black text-orange-400 uppercase tracking-tighter">{t('lowStock')}</span>}
                            {stock === 0 && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">{t('outOfStock')}</span>}
                        </div>
                    </div>
                );
            }
        },
        {
            header: t('actions'),
            accessor: 'id',
            render: (value: any, row: Product) => {
                const isPending = pendingRequests.some(r => r.targetId === row.id);
                return (
                    <div className="flex gap-1.5 lg:gap-2">
                        <button
                            onClick={() => {
                                if (isPending && !isAdmin) {
                                    addNotification('Já existe uma solicitação pendente para este produto', 'info');
                                    return;
                                }
                                setSelectedProduct(row);
                                setIsQuickSell(false);
                                setAdjustData(prev => ({ ...prev, quantity: '' })); // Reset quantity for normal adjust
                                setShowAdjustModal(true);
                            }}
                            disabled={isPending && !isAdmin}
                            className={`p-1 px-2 lg:px-3 lg:py-1 text-[9px] lg:text-[11px] font-black rounded-lg transition-all uppercase flex items-center gap-1 border ${isPending && !isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 border-slate-100'}`}
                        >
                            {isPending && !isAdmin ? <Clock className="w-3 h-3" /> : null}
                            {t('qty')}
                        </button>
                        <button
                            onClick={() => handleQuickSell(row)}
                            disabled={isSellingId === row.id || row.stock <= 0 || (isPending && !isAdmin)}
                            className={`p-1 px-2 lg:px-3 lg:py-1 text-[9px] lg:text-[11px] font-black rounded-lg transition-all uppercase flex items-center gap-1 border ${(isSellingId === row.id || (isPending && !isAdmin))
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                                }`}
                            title={isPending && !isAdmin ? 'Solicitação Pendente' : t('quickSell')}
                        >
                            <ShoppingCart className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                            <span className="hidden lg:inline">{isSellingId === row.id ? t('selling') : t('sell')}</span>
                        </button>
                        <button
                            onClick={() => handleEdit(row)}
                            disabled={isPending && !isAdmin}
                            className={`p-1 px-2 lg:px-3 lg:py-1 text-[9px] lg:text-[11px] font-black border rounded-lg transition-all uppercase flex items-center gap-1 ${isPending && !isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'text-[#FF4700] border-orange-100 hover:bg-[#FF4700]/10'}`}
                        >
                            <Pencil className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> <span className="hidden lg:inline">{t('edit')}</span>
                        </button>
                        <button
                            onClick={() => handleDeleteProduct(value as string)}
                            disabled={isPending && !isAdmin}
                            className={`p-1 transition-colors ${isPending && !isAdmin ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500'}`}
                        >
                            <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                    </div>
                );
            }
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#FF4700]/20 border-t-[#FF4700] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto transition-all duration-500">
            {isAdmin && pendingRequests.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 mb-6 animate-slide-up">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-orange-900 uppercase tracking-tight">Solicitações Pendentes ({pendingRequests.length})</h3>
                            <p className="text-xs font-bold text-orange-700/60 uppercase">Outros usuários solicitaram alterações no estoque</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingRequests.map(req => {
                            const details = JSON.parse(req.details);
                            return (
                                <div key={req.id} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full uppercase">
                                                {req.type === 'CREATE_PRODUCT' ? 'Novo Produto' : req.type === 'UPDATE_PRODUCT' ? 'Edição' : 'Exclusão'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800 mb-1">{details.name || 'Produto ID: ' + (req.targetId || 'Novo')}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Solicitante: <span className="text-orange-600">{req.user.name}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <button
                                            onClick={() => handleApproveRequest(req.id)}
                                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                                        >
                                            <Check className="w-3 h-3" /> Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                                        >
                                            <X className="w-3 h-3" /> Rejeitar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8 animate-slide-up">
                <div className="space-y-0.5 lg:space-y-1">
                    <h1 className="text-xl lg:text-4xl font-black text-[var(--text-main)] tracking-tighter">{t('inventoryMotor')}</h1>
                    <p className="text-[var(--text-muted)] font-black text-[7px] lg:text-[10px] uppercase tracking-[0.15em] lg:tracking-[0.3em]">{t('precisionCatalog')}</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setIsEditing(false);
                        setEditId(null);
                        setFormData({ name: '', category: 'Smartphones & Tablets', price: '', costPrice: '', stock: '', minStock: '5', image_url: '' });
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 lg:py-3 bg-[#FF4700] text-white text-xs lg:text-sm font-bold rounded-xl shadow-glow-orange hover:bg-[#E64000] transition-all active:scale-95 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    <span>{isAdmin ? t('addProduct') : 'Solicitar Adição'}</span>
                </button>
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
                            className="bg-[var(--bg-panel)] w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] p-3 sm:p-6 shadow-2xl relative custom-scrollbar touch-none sm:touch-auto"
                        >
                            {/* Drag Handle for Mobile */}
                            <div className="w-12 h-1.5 bg-[var(--border-subtle)] rounded-full mx-auto mb-4 sm:hidden" />
                            {/* Glow effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center justify-between mb-1 sm:mb-4">
                                <h2 className="text-sm sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
                                    {isAdmin ? (isEditing ? 'Editar' : 'Novo') : 'Enviar'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1 sm:space-y-3">
                                <div className="space-y-0 group">
                                    <label className="text-[7px] sm:text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 group-focus-within:text-[#FF4700]">
                                        <Tag className="w-2 h-2" /> {t('title')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nome"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-2 py-1 sm:py-2 bg-[var(--bg-canvas)] border border-transparent rounded-lg text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:bg-[var(--bg-panel)] focus:border-[#FF4700]/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-0">
                                    <label className="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <ImageIcon className="w-2 h-2" /> Foto
                                    </label>
                                    <ImageUpload
                                        onUpload={(url) => setFormData({ ...formData, image_url: url })}
                                        initialUrl={formData.image_url}
                                        bucket="products"
                                        compact={true}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <div className="space-y-0 group">
                                        <label className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tight flex items-center gap-1">
                                            <Layers className="w-2 h-2" /> QTD
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-2 py-1 sm:py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-lg text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-[#FF4700]/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-0 group">
                                        <label className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tight flex items-center gap-1">
                                            <AlertTriangle className="w-2 h-2" /> Min
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="5"
                                            value={formData.minStock}
                                            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                            className="w-full px-2 py-1 sm:py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-lg text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-orange-400/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-0 group">
                                        <label className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tight flex items-center gap-1">
                                            <DollarSign className="w-2 h-2" /> Venda
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-2 py-1 sm:py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-lg text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-[#FF4700]/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-0 group">
                                        <label className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tight flex items-center gap-1">
                                            <DollarSign className="w-2 h-2" /> Custo
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                            className="w-full px-2 py-1 sm:py-2 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-lg text-xs sm:text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-blue-400/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 flex items-center justify-end gap-2 pb-safe">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    disabled={isSaving}
                                    className="px-5 py-2 sm:py-2.5 bg-[#FF4700] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Plus className="w-3 h-3" />
                                    )}
                                    <span>{isAdmin ? (isEditing ? t('save') : 'Adicionar') : 'Enviar'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAdjustModal && selectedProduct && (
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
                                if (info.offset.y > 100) setShowAdjustModal(false);
                            }}
                            className="bg-[var(--bg-panel)] w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-8 shadow-2xl relative custom-scrollbar touch-none sm:touch-auto"
                        >
                            <div className="w-12 h-1 bg-[var(--border-subtle)] rounded-full mx-auto mb-4 sm:hidden" />
                            <div className="flex items-center justify-between mb-3 sm:mb-6">
                                <h2 className="text-base sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
                                    {isQuickSell ? t('quickSell') : t('stockAdjust')}
                                </h2>
                                <button onClick={() => setShowAdjustModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-6">
                                <div className="p-3 sm:p-4 bg-[var(--bg-canvas)] rounded-2xl border border-[var(--border-subtle)]">
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">{t('title')}</p>
                                    <p className="text-xs sm:text-sm font-black text-[var(--text-main)]">{selectedProduct.name}</p>
                                    <p className="text-[9px] sm:text-xs text-[var(--text-muted)] mt-1">{t('currentStock')}: {selectedProduct.stock} un</p>
                                </div>

                                <div className={`grid ${isQuickSell ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                                    {!isQuickSell && (
                                        <button
                                            onClick={() => setAdjustData({ ...adjustData, type: 'entry' })}
                                            className={`flex items-center justify-center gap-2 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase text-[10px] sm:text-xs tracking-wider transition-all border-2 ${adjustData.type === 'entry' ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-[var(--bg-panel)] text-green-600 border-green-100/50 hover:border-green-300'}`}
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('income')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => !isQuickSell && setAdjustData({ ...adjustData, type: 'exit' })}
                                        className={`flex items-center justify-center gap-2 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase text-[10px] sm:text-xs tracking-wider transition-all border-2 ${adjustData.type === 'exit' ? (isQuickSell ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-500 text-white border-red-500 shadow-lg') : 'bg-[var(--bg-panel)] text-red-600 border-red-100/50 hover:border-red-300'} ${isQuickSell ? 'cursor-default pointer-events-none' : ''}`}
                                    >
                                        {isQuickSell ? <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        {isQuickSell ? t('sell') : t('expense')}
                                    </button>
                                </div>

                                <div>
                                    <label className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1 block">{t('qty')}</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-4 py-2 sm:py-4 bg-[var(--bg-canvas)] rounded-xl sm:rounded-2xl border-none focus:ring-2 focus:ring-[#FF4700]/20 font-bold text-lg sm:text-xl text-[var(--text-main)]"
                                        value={adjustData.quantity}
                                        onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">{t('reason')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('reasonPlaceholder')}
                                        className="w-full px-4 py-3 bg-[var(--bg-canvas)] rounded-xl border-none focus:ring-2 focus:ring-[#FF4700]/20 font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                                        value={adjustData.reason}
                                        onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                    />
                                </div>

                                {!isQuickSell && (
                                    <button
                                        onClick={() => setAdjustData({ ...adjustData, isFinancial: !adjustData.isFinancial })}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${adjustData.isFinancial ? 'bg-[#FF4700]/5 border-[#FF4700]/30' : 'bg-[var(--bg-panel)] border-[var(--border-subtle)] hover:border-[#FF4700]/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${adjustData.isFinancial ? 'bg-[#FF4700] text-white' : 'bg-[var(--bg-canvas)] text-[var(--text-muted)]'}`}>
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight">{t('registerFinance')}</p>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                                                    {adjustData.type === 'entry' ? t('countAsExpense') : t('countAsIncome')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${adjustData.isFinancial ? 'bg-[#FF4700]' : 'bg-[var(--border-subtle)]'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${adjustData.isFinancial ? 'left-6' : 'left-1'}`} />
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={handleAdjustStock}
                                    className="w-full py-4 bg-[#FF4700] text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-glow-orange hover:bg-[#E64000] transition-all active:scale-95"
                                >
                                    {t('confirmMovement')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmQuickSell && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--bg-panel)] w-full max-w-[280px] sm:max-w-sm rounded-[32px] p-4 sm:p-8 shadow-2xl border border-[var(--border-subtle)]"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 text-[#FF4700]">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <h3 className="text-base sm:text-xl font-black text-[var(--text-main)] mb-1">{t('confirmSell')}</h3>
                                <p className="text-[var(--text-muted)] text-[11px] sm:text-sm font-bold mb-6">
                                    {t('sureToSell').replace('{name}', confirmQuickSell.name).replace('{price}', `MT ${confirmQuickSell.price.toLocaleString(locale)}`)}
                                </p>

                                <div className="flex flex-col w-full gap-2">
                                    <button
                                        onClick={() => executeQuickSell(confirmQuickSell)}
                                        className="w-full py-2.5 bg-[#FF4700] text-white font-black uppercase text-[10px] tracking-wider rounded-xl shadow-md active:scale-95 transition-all"
                                    >
                                        {t('yesSellNow')}
                                    </button>
                                    <button
                                        onClick={() => setConfirmQuickSell(null)}
                                        className="w-full py-2.5 bg-[var(--bg-canvas)] text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-wider rounded-xl hover:bg-[var(--bg-panel)] transition-all border border-[var(--border-subtle)]"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-1 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--bg-panel)] w-full max-w-[280px] sm:max-w-sm rounded-[32px] p-4 sm:p-8 shadow-2xl border border-[var(--border-subtle)]"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-3 text-red-600">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-base sm:text-xl font-black text-[var(--text-main)] mb-1">{t('deleteProductConfirm')}</h3>
                                <p className="text-[var(--text-muted)] text-[11px] sm:text-sm font-bold mb-6">
                                    Esta ação não pode ser desfeita. O produto será removido permanentemente.
                                </p>

                                <div className="flex flex-col w-full gap-2">
                                    <button
                                        onClick={executeDeleteProduct}
                                        className="w-full py-2.5 bg-red-600 text-white font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg active:scale-95 transition-all"
                                    >
                                        {t('delete')}
                                    </button>
                                    <button
                                        onClick={() => setConfirmToDelete(null)}
                                        className="w-full py-2.5 bg-[var(--bg-canvas)] text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-wider rounded-xl hover:bg-[var(--bg-panel)] transition-all border border-[var(--border-subtle)]"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="relative animate-zoom-fade delay-200">
                <DataTable title={t('assetRegistry')} columns={columns} data={filteredProducts} />
                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl" />
            </div>

            <div className="flex justify-end pt-4">
                <div className="bg-[var(--bg-canvas)]/50 px-6 py-3 rounded-2xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] lg:text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mr-2">
                        Total units available:
                    </span>
                    <span className="text-base lg:text-xl font-black text-[#FF4700]">
                        {localProducts.reduce((sum, p) => sum + (p.stock || 0), 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}
