import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { useTeam } from '../contexts/TeamContext';

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentUser, setCurrentUser } = useTeam();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState(currentUser?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && currentUser) {
            setNewEmail(currentUser.email);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError(null);
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        const emailChanged = newEmail !== currentUser?.email;
        const passwordChanged = newPassword.length > 0;

        if (!emailChanged && !passwordChanged) {
            setError('Nenhuma alteração detectada');
            return;
        }

        if (passwordChanged) {
            if (newPassword !== confirmPassword) {
                setError('A confirmação da nova senha não coincide');
                return;
            }
            if (newPassword.length < 4) {
                setError('A nova senha deve ter pelo menos 4 caracteres');
                return;
            }
        }

        setLoading(true);
        try {
            const result = await api.users.updateAccount({
                currentPassword,
                newEmail: emailChanged ? newEmail : undefined,
                newPassword: passwordChanged ? newPassword : undefined
            });

            if (result.success) {
                if (result.user) {
                    setCurrentUser(result.user);
                }
                onSuccess(result.message || 'Conta atualizada com sucesso');
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 lg:p-8 bg-slate-50/50 border-b border-slate-100">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF4700]/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-[#FF4700]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Segurança e Acesso</h2>
                            <p className="text-sm font-bold text-slate-400">Gerencie seu email e senha</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in shake-1">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-black text-rose-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Current Password - REQUIRED for any change */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Atual (Obrigatória)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF4700] transition-colors" />
                                </div>
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] focus:ring-4 focus:ring-[#FF4700]/5 transition-all"
                                    placeholder="Confirme sua senha atual"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                    {currentPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPassword('')}
                                            className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="p-1.5 text-slate-400 hover:text-[#FF4700] transition-colors"
                                    >
                                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 mx-4" />

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Acesso</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF4700] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] focus:ring-4 focus:ring-[#FF4700]/5 transition-all"
                                    placeholder="seu@email.com"
                                />
                                {newEmail && newEmail !== currentUser?.email && (
                                    <button
                                        type="button"
                                        onClick={() => setNewEmail(currentUser?.email || '')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                                        title="Restaurar email original"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* New Password (Optional) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha (Opcional)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF4700] transition-colors" />
                                </div>
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-11 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] focus:ring-4 focus:ring-[#FF4700]/5 transition-all"
                                    placeholder="Deixe vazio para manter"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                    {newPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setNewPassword('')}
                                            className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="p-1.5 text-slate-400 hover:text-[#FF4700] transition-colors"
                                    >
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password (only if newPassword started) */}
                        {newPassword && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF4700] transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required={newPassword.length > 0}
                                        className="w-full pl-11 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] focus:ring-4 focus:ring-[#FF4700]/5 transition-all"
                                        placeholder="Repita a nova senha"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="p-1.5 text-slate-400 hover:text-[#FF4700] transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#FF4700] to-[#FF6B00] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[#FF4700]/20 hover:shadow-[#FF4700]/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Salvando alterações...</span>
                            </>
                        ) : (
                            <span>Atualizar Dados</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
