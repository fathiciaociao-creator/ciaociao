'use client';
import { LayoutDashboard, History, Users, BarChart3, Package, Ticket, MapPin, LogOut, LucideIcon, ShieldCheck } from 'lucide-react';
import { AdminTab } from '@/types/admin';
import { BRANDING } from '@/constants/branding';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingCount: number;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingCount,
  onLogout
}: AdminSidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: LucideIcon; badge?: number | null }[] = [
    { id: 'ORDERS', label: 'الطلبات الحالية', icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'HISTORY', label: 'سجل الطلبات', icon: History },
    { id: 'CUSTOMERS', label: 'الزبائن', icon: Users },
    { id: 'REPORTS', label: 'التقارير والمبيعات', icon: BarChart3 },
    { id: 'PRODUCTS', label: 'إدارة المنيو', icon: Package },
    { id: 'COUPONS', label: 'الكوبونات', icon: Ticket },
    { id: 'ZONES', label: 'مناطق التوصيل', icon: MapPin },
    { id: 'SUPPORT', label: 'الدعم التقني', icon: ShieldCheck },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 lg:relative lg:w-80 bg-brand-black/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-r border-white/5 z-50 flex flex-col shadow-2xl">
      {/* Brand Header - Desktop Only */}
      <div className="hidden lg:flex flex-col p-10 border-b border-white/5">
        <h1 className="text-3xl font-black text-white font-serif tracking-tighter leading-none">
          {BRANDING.nameEn}
        </h1>
        <span className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 animate-pulse">ADMIN CONTROL</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto no-scrollbar p-2 lg:p-6 lg:flex-1">
        <div className="flex lg:flex-col gap-1 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 whitespace-nowrap
                  ${isActive 
                    ? 'bg-brand-cream text-brand-red shadow-xl shadow-black/20 scale-[1.02]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <div className={`relative ${isActive ? 'animate-tada' : 'group-hover:scale-110 transition-transform'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
                
                {/* Active Indicator Bar - Desktop Only */}
                {isActive && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-red rounded-l-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="hidden lg:flex flex-col p-6 border-t border-white/5 bg-black/20">
        <button
          onClick={onLogout}
          className="group flex items-center gap-4 px-6 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-500 w-full"
        >
          <div className="group-hover:rotate-12 transition-transform">
            <LogOut size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
