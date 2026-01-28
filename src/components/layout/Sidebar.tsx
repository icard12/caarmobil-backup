import { useState } from 'react';
import { LayoutDashboard, Box, ClipboardList, Settings, Activity, Sparkles, LogOut, ChevronLeft, History, DollarSign, Info } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTeam } from '../../contexts/TeamContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, logout } = useTeam();
  const { t } = useLanguage();

  const navSections: NavSection[] = [
    {
      title: t('dashboard'),
      items: [
        { icon: LayoutDashboard, label: t('dashboard'), id: 'dashboard' },
        { icon: Box, label: t('inventory'), id: 'inventory' },
        { icon: ClipboardList, label: t('services'), id: 'services' },
        { icon: DollarSign, label: t('financesHub'), id: 'finances_hub' },
        { icon: History, label: t('movementsAudit'), id: 'audit_hub' },
      ]
    },
    {
      title: t('support'),
      items: [
        { icon: Settings, label: t('settings'), id: 'settings' },
        { icon: Activity, label: t('team'), id: 'team' },
        { icon: Sparkles, label: t('whatsNew'), id: 'whats-new' },
        { icon: Info, label: t('about'), id: 'about' },
        { icon: LogOut, label: t('logout'), id: 'logout' },
      ]
    }
  ];

  const handleNavigate = (id: string) => {
    if (id === 'logout') {
      logout();
    } else {
      onNavigate(id);
    }
  };

  const isVisible = (itemId: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    // Restrictions for Manager
    if (currentUser.role === 'manager') {
      return !['team', 'settings'].includes(itemId);
    }

    // Restrictions for Employee
    if (currentUser.role === 'employee') {
      return ['dashboard', 'inventory', 'services', 'logout'].includes(itemId);
    }

    return false;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-[110] p-2.5 bg-[var(--bg-panel)] rounded-xl shadow-lg border border-[var(--border-subtle)] text-[#FF4700] active:scale-95 transition-all"
        >
          <div className="w-5 h-5 flex flex-col justify-center gap-1">
            <div className="w-full h-0.5 bg-current rounded-full" />
            <div className="w-full h-0.5 bg-current rounded-full" />
            <div className="w-2/3 h-0.5 bg-current rounded-full" />
          </div>
        </button>
      )}

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[105] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`w-72 bg-[var(--bg-sidebar)] text-[var(--text-main)] flex flex-col h-screen fixed left-0 top-0 z-[110] border-r border-[var(--border-subtle)] shadow-2xl transition-all duration-500 ease-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pb-8">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3" onClick={() => { onNavigate('dashboard'); setIsSidebarOpen(false); }}>
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-panel)] flex items-center justify-center p-1 shadow-sm border border-[var(--border-subtle)] animate-float">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-[17px] font-black tracking-tighter text-[var(--text-main)] italic leading-none uppercase">CAAR MOBIL</h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all border border-transparent active:border-[var(--border-subtle)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-8 pb-8">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{section.title}</p>
              <div className="space-y-1">
                {section.items.filter(item => isVisible(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { handleNavigate(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 group relative ${activeId === item.id
                      ? 'bg-[#FF4700] text-white shadow-xl shadow-orange-500/20 translate-x-1'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-canvas)]'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 transition-all duration-500 ${activeId === item.id ? 'text-white' : 'text-current group-hover:scale-110'}`} />
                    <span className={`text-[14px] font-bold tracking-tight`}>{item.label}</span>
                    {activeId === item.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow-orange animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>


        <div className="p-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-[var(--bg-canvas)] transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-sidebar)] flex items-center justify-center p-0.5 border border-[var(--border-subtle)] group-hover:border-[#FF4700]/30 transition-colors">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#FF4700] to-[#E64000] flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <span className="text-xs font-black text-white">{currentUser?.name?.substring(0, 2).toUpperCase() || 'US'}</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-[var(--text-main)] truncate">{currentUser?.name || t('userLabel')}</p>
              <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mt-1">
                {currentUser?.role === 'admin' ? t('admin') : currentUser?.role === 'manager' ? t('manager') : t('employee')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
