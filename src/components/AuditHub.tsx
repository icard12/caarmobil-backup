import { useState } from 'react';
import {
    History,
    ShieldCheck,
    SearchCode
} from 'lucide-react';
import StockHistory from './StockHistory';
import SystemLogs from './SystemLogs';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'movements' | 'system';

export default function AuditHub() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('movements');

    const tabs = [
        { id: 'movements' as TabType, label: t('stockMovementTab'), icon: History, description: t('movementsSubtitle') },
        { id: 'system' as TabType, label: t('systemLogsTab'), icon: SearchCode, description: t('systemLogsSubtitle') }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'movements':
                return <StockHistory />;
            case 'system':
                return <SystemLogs />;
            default:
                return <StockHistory />;
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
            {/* Header Hub */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 bg-slate-900 rounded-2xl shadow-xl shrink-0">
                        <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF4700]" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-1">
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t('movementsAudit')}</h1>
                        <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.2em]">{t('totalTraceability')}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 lg:gap-2 bg-white p-1.5 rounded-[22px] border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-[18px] text-[10px] lg:text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg lg:scale-105'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${activeTab === tab.id ? 'text-[#FF4700]' : 'text-current'}`} />
                            <span className="inline lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative group transition-all duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4700]/5 to-transparent rounded-[40px] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
