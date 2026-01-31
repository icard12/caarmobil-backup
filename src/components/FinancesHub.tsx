import { useState } from 'react';
import {
    DollarSign,
    BarChart3,
    TrendingUp
} from 'lucide-react';
import Financials from './Financials';
import FinancialReports from './FinancialReports';
import AnalyticsPage from './AnalyticsPage';
import PettyCash from './PettyCash';
import { Wallet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'flow' | 'petty_cash' | 'reports' | 'intelligence';

export default function FinancesHub() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('flow');

    const tabs = [
        { id: 'flow' as TabType, label: t('flowTab'), icon: DollarSign, description: t('flowSubtitle') },
        { id: 'petty_cash' as TabType, label: t('pettyCashTab'), icon: Wallet, description: t('pettyCashSubtitle') },
        { id: 'reports' as TabType, label: t('reportsTab'), icon: BarChart3, description: t('reportsSubtitle') },
        { id: 'intelligence' as TabType, label: t('intelligenceTab'), icon: TrendingUp, description: t('intelligenceSubtitle') }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'flow':
                return <Financials />;
            case 'petty_cash':
                return <PettyCash />;
            case 'reports':
                return <FinancialReports />;
            case 'intelligence':
                return <AnalyticsPage />;
            default:
                return <Financials />;
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
            {/* Header Hub */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 bg-slate-900 rounded-2xl shadow-xl shrink-0">
                        <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF4700]" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-1">
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t('financesHubTitle')}</h1>
                        <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.2em]">{t('strategicManagement')}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 lg:gap-2 bg-white p-1.5 rounded-[22px] border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-[18px] text-[10px] lg:text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg lg:scale-105'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${activeTab === tab.id ? 'text-[#FF4700]' : 'text-current'}`} />
                            <span className="inline lg:inline">{tab.label.split(' ')[0]}</span>
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
