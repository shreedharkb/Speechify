import React from 'react';
import { Button } from './ui/button';

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
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6L16 30L30 6H2Z" fill="#0f172a" className="dark:fill-white"/>
            <path d="M18 8L11 17H16.5L14 26L23 15H17.5L18 8Z" fill="#ffffff" className="dark:fill-[#0a0a0a]"/>
          </svg>
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
              <Button size="sm" onClick={() => setPage('role-selection')} className="rounded-md bg-black text-white hover:bg-gray-800 text-sm font-medium px-4 py-2">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
