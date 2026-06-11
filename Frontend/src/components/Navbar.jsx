import React from 'react';
import { Button } from './ui/button';
import { AudioLines } from 'lucide-react';

export default function Navbar({ setPage, user, onLogout }) {
  const isLoggedIn = !!user;

  return (
    <div className="relative z-50 bg-white border-b border-gray-200 w-full">
      <nav className="flex items-center justify-between px-6 py-4 mx-auto w-full">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <div className="w-10 h-10 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-sm shrink-0">
            <AudioLines className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-black dark:text-white tracking-tight transition-colors duration-500">
            Speechify
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <button onClick={() => setPage('dashboard')} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                Dashboard
              </button>
            </>
          ) : null}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={onLogout} className="rounded-md border-gray-200">
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setPage('login')} className="rounded-md border-gray-200 text-sm font-medium text-black hover:bg-gray-50">
                Sign In
              </Button>
              <Button size="sm" onClick={() => setPage('role-selection')} className="rounded-md bg-[oklch(61%_0.09_60.8)] text-white hover:opacity-90 transition-colors text-sm font-medium px-4 py-2 border-none">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
