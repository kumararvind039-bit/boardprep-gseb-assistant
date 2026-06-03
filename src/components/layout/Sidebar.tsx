import { BookOpen, Calendar, LayoutDashboard, Settings, GraduationCap, BrainCircuit, FolderOpen, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsResourcesDrawerOpen: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, setIsResourcesDrawerOpen }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pathway', label: 'Study Pathway', icon: Compass },
    { id: 'notebook', label: 'My Notebooks', icon: BookOpen },
    { id: 'assistant', label: 'AI Assistant', icon: BrainCircuit },
    { id: 'schedule', label: 'Study Schedule', icon: Calendar },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-600 p-2 rounded-lg">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-slate-800">BoardPrep AI</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={cn(
              "w-full justify-start gap-3 h-11 transition-all",
              activeTab === item.id ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 animate-fade-in"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-brand-600" : "text-slate-400")} />
            {item.label}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 transition-all text-slate-600 hover:bg-slate-50 cursor-pointer"
          onClick={() => setIsResourcesDrawerOpen(true)}
        >
          <FolderOpen className="w-5 h-5 text-slate-400" />
          Resources Drawer
        </Button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Button 
          variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
          className={cn(
            "w-full justify-start gap-3 h-11 transition-all",
            activeTab === 'settings' ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-500"
          )}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className={cn("w-5 h-5", activeTab === 'settings' ? "text-brand-600" : "text-slate-400")} />
          Settings
        </Button>
      </div>
    </div>
  );
}
