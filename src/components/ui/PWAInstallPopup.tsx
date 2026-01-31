import { useState, useEffect } from 'react';
import { usePWA } from '../../contexts/PWAContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Download, Smartphone, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

export default function PWAInstallPopup() {
    const { installable, installApp } = usePWA();
    const { } = useLanguage();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Verifica se o usuário já fechou este popup nesta sessão
        const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');

        if (installable && !dismissed) {
            setShowPopup(true);
        }
    }, [installable]);

    const handleDismiss = () => {
        setShowPopup(false);
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!installable) return null;

    return (
        <AnimatePresence>
            {showPopup && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-6">
                    {/* Backdrop com desfoque profundo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[400px] bg-white rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden"
                    >
                        {/* Background Efeito */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF4700]/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                        <div className="p-8 lg:p-10 relative z-10">
                            {/* Header com Botão Fechar */}
                            <div className="flex justify-end absolute top-6 right-6">
                                <button
                                    onClick={handleDismiss}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                {/* Logo Flutuante Premium */}
                                <div className="relative mb-8 mt-4">
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-28 h-28 bg-white rounded-[38px] flex items-center justify-center p-5 shadow-[0_20px_50px_rgba(255,71,0,0.15)] border border-slate-100 relative z-20"
                                    >
                                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                    </motion.div>

                                    {/* Elementos Decorativos */}
                                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce duration-700">
                                        <Star className="w-4 h-4 fill-current" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FF4700] rounded-2xl flex items-center justify-center text-white shadow-glow-orange animate-pulse">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Texto */}
                                <div className="space-y-3 mb-10">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                        Versão Mobile <br /> <span className="text-[#FF4700]">CAAR MOBIL</span>
                                    </h3>
                                    <p className="text-base font-bold text-slate-500/80 leading-relaxed px-4">
                                        Instale agora para ter o sistema na sua tela inicial como um aplicativo nativo.
                                    </p>
                                </div>

                                {/* Botões */}
                                <div className="flex flex-col w-full gap-4">
                                    <button
                                        onClick={() => {
                                            installApp();
                                            handleDismiss();
                                        }}
                                        className="w-full py-5 lg:py-6 bg-[#FF4700] text-white font-black uppercase text-sm tracking-[0.2em] rounded-[28px] shadow-glow-orange hover:bg-[#E64000] active:scale-95 transition-all flex items-center justify-center gap-3 relative group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[20deg]" />
                                        <Download className="w-5 h-5" />
                                        Instalar App
                                    </button>

                                    <button
                                        onClick={handleDismiss}
                                        className="w-full py-4 text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors uppercase"
                                    >
                                        Agora Não
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Detail */}
                        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Smartphone className="w-3 h-3" />
                                Disponível para iOS & Android
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
