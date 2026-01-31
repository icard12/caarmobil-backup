import React, { useState } from 'react';
import { X, Mail, AlertCircle, Loader2, Key, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const isElectron = window.location.protocol === 'file:' || /Electron/.test(navigator.userAgent);
        const url = isElectron ? 'http://localhost:3000/api/auth/forgot-password' : '/api/auth/forgot-password';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao enviar e-mail');

            setStep('code');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (newPassword.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres');
            return;
        }

        setLoading(true);
        setError(null);

        const isElectron = window.location.protocol === 'file:' || /Electron/.test(navigator.userAgent);
        const url = isElectron ? 'http://localhost:3000/api/auth/reset-password' : '/api/auth/reset-password';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Código inválido ou expirado');

            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 lg:p-8 bg-slate-50/50 border-b border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 rounded-2xl bg-[#FF4700]/10 flex items-center justify-center mx-auto mb-4">
                        <Key className="w-8 h-8 text-[#FF4700]" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recuperar Senha</h2>
                    <p className="text-sm font-bold text-slate-400">
                        {step === 'email' ? 'Insira seu e-mail cadastrado' :
                            step === 'code' ? 'Verifique seu e-mail' :
                                'Tudo pronto!'}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 lg:p-8">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-6 animate-in shake-1">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-black text-rose-600">{error}</p>
                        </div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={handleSendEmail} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Cadastro</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] focus:ring-4 focus:ring-[#FF4700]/5 transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4.5 bg-[#FF4700] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[#FF4700]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Enviar Código</span>}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    )}

                    {step === 'code' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6 flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Mail className="w-4 h-4 text-indigo-500" />
                                </div>
                                <p className="text-xs font-bold text-indigo-700">Enviamos um código para <span className="underline">{email}</span></p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de 8 dígitos</label>
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                                        required
                                        maxLength={8}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-black text-slate-900 tracking-[0.5em] focus:outline-none focus:bg-white focus:border-[#FF4700] transition-all"
                                        placeholder="XXXXXXXX"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] transition-all"
                                        placeholder="Mínimo 4 caracteres"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF4700] transition-all"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4.5 bg-[#FF4700] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[#FF4700]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Redefinir Minha Senha</span>}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                            >
                                Reenviar código ou mudar e-mail
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase">Senha Alterada!</h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed">Sua nova senha foi salva. Você já pode entrar no sistema normalmente.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-4.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                Voltar para o Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
