import React from 'react';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#f1f5f9] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-lg font-bold text-[#0f172a] tracking-tight">
            Speechify
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-[#64748b]">
            <a href="#" className="hover:text-[#0f172a] transition-colors">About</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Services</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Products</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Contact</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Blog</a>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <a href="#" className="hover:text-[#0f172a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>

        <div className="h-px bg-[#f1f5f9] w-full mb-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#94a3b8]">
            © {new Date().getFullYear()} Speechify. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#94a3b8]">
            <a href="#" className="hover:text-[#0f172a] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#0f172a] transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
