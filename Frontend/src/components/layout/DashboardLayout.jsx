import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  FileEdit,
  Library,
  LogOut,
  Settings,
  BookOpen,
  PieChart,
  Users,
  Menu,
  X,
  AudioLines,
  MoreVertical,
  Search,
  Bell,
  Moon,
  User
} from 'lucide-react';
import { clearAuth } from '../../utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export default function DashboardLayout({
  children,
  role,
  userName,
  activeSection,
  onNavigate,
  setPage
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const teacherPlatformItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'create-quiz', label: 'Create Quiz', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'my-quizzes', label: 'My Quizzes', icon: <Library className="w-4 h-4" /> }
  ];

  const teacherProjectItems = [];

  const studentPlatformItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'quizzes', label: 'My Quizzes', icon: <Library className="w-4 h-4" /> }
  ];

  const studentProjectItems = [];

  const platformItems = role === 'teacher' ? teacherPlatformItems : studentPlatformItems;
  const projectItems = role === 'teacher' ? teacherProjectItems : studentProjectItems;

  const handleLogout = () => {
    clearAuth();
    if (setPage) setPage('login');
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard';
      case 'create-quiz': return 'Create Quiz';
      case 'my-quizzes':
      case 'quizzes': return 'My Quizzes';
      case 'analytics': return 'Analytics';
      case 'students': return 'Students';
      case 'history': return 'History';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f9fafb] text-[#111827]">
      {/* Logo Area */}
      <div
        className="flex items-center gap-3 px-6 py-5 cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <div className="w-8 h-8 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-sm shrink-0">
          <AudioLines className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#0f172a] leading-tight tracking-tight">Speechify</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">

        {/* Platform Section */}
        <div>
          <h3 className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</h3>
          <nav className="space-y-0.5">
            {platformItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 text-[13px] font-medium rounded-md transition-colors ${isActive
                    ? 'bg-slate-200/50 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span className={`${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        {projectItems.length > 0 && (
          <div>
            <nav className="space-y-0.5">
              {projectItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // Just navigate or show a dummy state for now
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-1.5 text-[13px] font-medium rounded-md transition-colors ${isActive
                      ? 'bg-slate-200/50 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <span className={`${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

      </div>

      {/* Logout Area */}
      <div className="p-4 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-200/50">
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : (role === 'teacher' ? 'T' : 'S')}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-semibold leading-tight text-slate-900 truncate">
                  {userName || (role === 'teacher' ? 'Teacher' : 'Student')}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight capitalize mt-0.5 truncate">
                  {role} Account
                </span>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar overlay */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-sm shrink-0">
            <AudioLines className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0f172a] tracking-tight text-lg">Speechify</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-64 h-full bg-white flex flex-col shadow-xl">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {/* Top Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-40">

          {/* Left side: Page Title */}
          <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            {getPageTitle()}
          </div>

          {/* Right side: Avatar only */}
          <div className="relative flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs cursor-pointer hover:ring-2 hover:ring-slate-300 transition-all select-none">
                  {userName ? userName.charAt(0).toUpperCase() : (role === 'teacher' ? 'T' : 'S')}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : (role === 'teacher' ? 'T' : 'S')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {userName || (role === 'teacher' ? 'Teacher' : 'Student')}
                    </span>
                    <span className="text-xs text-slate-500 capitalize truncate">{role} Account</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 py-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 lg:p-6 flex-1 flex flex-col">
          <div className="bg-[#f9fafb] rounded-[20px] border border-slate-200/60 flex-1 p-6 md:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
