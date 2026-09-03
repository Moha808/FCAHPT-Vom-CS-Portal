import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard, BookOpen, Bell, LogOut, Settings,
  Users, Megaphone, BookMarked,
  UserCheck, BarChart3, ShieldCheck, ChevronRight,
  Menu, X, MessageSquare
} from 'lucide-react';

const navConfig = {
  student: [
    { label: 'Dashboard',      path: '/student/dashboard',      icon: LayoutDashboard },
    { label: 'My Courses',     path: '/student/courses',         icon: BookOpen },
    { label: 'Announcements',  path: '/student/announcements',   icon: Bell },
    { label: 'My Advisor',     path: '/student/advisor',         icon: UserCheck },
    { label: 'Complaints',     path: '/student/complaints',      icon: MessageSquare },
    { label: 'Settings',       path: '/student/settings',        icon: Settings },
  ],
  advisor: [
    { label: 'Dashboard',      path: '/advisor/dashboard',       icon: LayoutDashboard },
    { label: 'My Students',    path: '/advisor/students',        icon: Users },
    { label: 'Announcements',  path: '/advisor/announcements',   icon: Megaphone },
    { label: 'Settings',       path: '/advisor/settings',        icon: Settings },
  ],
  admin: [
    { label: 'Dashboard',      path: '/admin/dashboard',         icon: LayoutDashboard },
    { label: 'User Management',path: '/admin/users',             icon: Users },
    { label: 'Curricula',      path: '/admin/curricula',         icon: BookMarked },
    { label: 'Announcements',  path: '/admin/announcements',     icon: Megaphone },
    { label: 'Reports',        path: '/admin/reports',           icon: BarChart3 },
    { label: 'Settings',       path: '/admin/settings',          icon: Settings },
  ],
};

const roleColors: Record<string, string> = {
  student: 'bg-blue-500',
  advisor: 'bg-purple-500',
  admin:   'bg-vom-gold',
};

export default function Layout() {
  const { userData } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const links = userData ? navConfig[userData.role] : [];
  const initials = userData?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`w-64 bg-vom-green text-white flex flex-col fixed h-full z-30 shadow-xl transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 bg-black/20 rounded-lg text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 mt-2 md:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-vom-gold rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-vom-green" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">FCAHPT Vom</p>
              <p className="text-xs text-white/60">Academic Portal</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-3 py-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${roleColors[userData?.role || 'student']}`}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{userData?.name}</p>
              <p className="text-xs text-white/60 capitalize">{userData?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest px-6 mb-2">Menu</p>
          <ul className="space-y-0.5 px-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-4.5 h-4.5 mr-3 flex-shrink-0 ${isActive ? 'text-vom-gold' : 'text-white/60 group-hover:text-white'}`} />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-vom-gold" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          
          <div className="flex items-center">
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 mr-3 text-gray-500 hover:text-vom-green hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 flex items-center">
              <span className="capitalize font-medium text-gray-700 hidden sm:inline">{userData?.role} Portal</span>
              <ChevronRight className="w-4 h-4 mx-1 text-gray-300 hidden sm:inline" />
              <span className="text-gray-500 font-medium sm:font-normal">{links.find(l => l.path === location.pathname)?.label || 'Overview'}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link to={`/${userData?.role}/announcements`} className="relative p-2 text-gray-400 hover:text-vom-green hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link to={`/${userData?.role}/settings`} className="hidden sm:block p-2 text-gray-400 hover:text-vom-green hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2 sm:border-l sm:pl-3 sm:ml-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${roleColors[userData?.role || 'student']}`}>
                {initials}
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-semibold text-gray-800 leading-tight">{userData?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{userData?.department || userData?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <Outlet />
        </main>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          © {new Date().getFullYear()} FCAHPT Vom Academic Portal
        </footer>
      </div>
    </div>
  );
}
