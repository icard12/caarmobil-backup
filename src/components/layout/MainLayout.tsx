import Sidebar from './Sidebar';
import Header from './Header';
import RobotAssistant from '../RobotAssistant';

interface MainLayoutProps {
  children: React.ReactNode;
  activeId: string;
  onNavigate: (id: string) => void;
  title: string;
  onSearch?: (query: string) => void;
}

export default function MainLayout({ children, activeId, onNavigate, title, onSearch }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar activeId={activeId} onNavigate={onNavigate} />
      <Header title={title} onSearch={onSearch} />
      <main className="lg:ml-72 pt-20 lg:pt-24 min-h-screen transition-all duration-500 overflow-x-hidden">
        <div className="p-4 lg:p-12 max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
      <RobotAssistant />
    </div>
  );
}
