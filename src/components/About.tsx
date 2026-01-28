import { Info, Cpu, Globe, Terminal, Mail, Phone, Instagram } from 'lucide-react';
import redwallLogo from '../assets/redwall.png';
import { useLanguage } from '../contexts/LanguageContext';


export default function About() {
    const { t } = useLanguage();
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-2.5 lg:p-3 bg-[#FF4700]/10 rounded-2xl shadow-glow-orange">
                    <Info className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF4700]" />
                </div>
                <div className="space-y-0.5 lg:space-y-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t('aboutTitle')}</h1>
                    <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.2em]">{t('aboutSubtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Credits Section */}
                <div className="bg-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group border border-slate-100">
                    {/* Background Logo Decoration - White Background Test */}
                    <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-20 group-hover:opacity-100 transition-all duration-700 -rotate-12 pointer-events-none">
                        <img src={redwallLogo} alt="" className="w-full h-full object-contain" />
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4700]/10 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32 transition-all group-hover:opacity-30" />

                    <div className="relative z-10 space-y-6 lg:space-y-8">
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-50 overflow-hidden rounded-2xl flex items-center justify-center p-2 shadow-sm border border-slate-100">
                                <img src={redwallLogo} alt="Redwall Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-black text-slate-900">{t('developer')}</h2>
                        </div>

                        <div className="space-y-1 lg:space-y-2">
                            <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-widest">{t('developedBy')}</p>
                            <h3 className="text-3xl lg:text-5xl font-black text-[#FF4700] tracking-tighter italic lg:translate-x-[-2px]">Redwall Security</h3>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed max-w-md font-medium">
                            {t('redwallDescription')}
                        </p>

                        <div className="pt-6 lg:pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                                <div className="flex items-center gap-2 text-slate-600 text-[10px] lg:text-xs font-bold tracking-tight">
                                    <Mail className="w-4 h-4 text-[#FF4700]" /> sredwall07@gmail.com
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-[10px] lg:text-xs font-bold tracking-tight">
                                    <Phone className="w-4 h-4 text-[#FF4700]" /> 874311477 / 834796764
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 text-[10px] lg:text-xs font-bold tracking-tight hover:text-[#FF4700] transition-colors">
                                    <Instagram className="w-4 h-4" /> Instagram
                                </a>
                                <a href="https://www.tiktok.com/@redwall.securitys" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 text-[10px] lg:text-xs font-bold tracking-tight hover:text-[#FF4700] transition-colors">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.23-2.74.12-1.57.71-2.51 2.43-2.27 4.14.15 1.06.72 2.05 1.6 2.59 1.4.88 3.41.76 4.67-.3 1.05-.9 1.52-2.27 1.44-3.64-.02-3.77-.02-7.53-.02-11.3z" />
                                    </svg>
                                    @redwall.securitys
                                </a>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6 opacity-60">
                                <div className="flex items-center gap-2 text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                                    <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Global Performance
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                                    <Terminal className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> clean-code-v1
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Cpu className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-black text-slate-900">{t('specifications')}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('version')}</p>
                                <p className="text-sm font-black text-slate-900">1.0.1 PRO</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('build')}</p>
                                <p className="text-sm font-black text-slate-900">2026.01.20</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('status')}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-sm font-black text-slate-900">{t('activated')}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('supportLabel')}</p>
                                <p className="text-sm font-black text-slate-900">{t('specialized')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">{t('systemNote')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            {t('systemNoteDetail')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
