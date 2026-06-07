import React from 'react';

export default function DashboardStats() {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">All Orders</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">122,380</span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              ↑ 15.1%
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Vs last month: <span className="font-medium text-gray-900">105,922</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">Order Created</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">1.9M</span>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
              ↓ -2%
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Vs last month: <span className="font-medium text-gray-900">2.0M</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">Organic Sales</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">$98.1M</span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              ↑ 0.4%
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Vs last month: <span className="font-medium text-gray-900">$97.8M</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">Active Users</span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14a2 2 0 100-4 2 2 0 000 4zm-7 0a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">48,210</span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              ↑ 3.7%
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Vs last month: <span className="font-medium text-gray-900">46,480</span>
          </div>
        </div>
      </div>

      {/* Summary Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Summary</h3>
              <p className="text-sm text-gray-500 mt-1">Data from 1-12 Apr, 2024</p>
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            <div 
              className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center"
              style={{ background: 'conic-gradient(#ea580c 0% 48%, #14b8a6 48% 80%, #0f172a 80% 93%, #eab308 93% 100%)' }}
            >
              <div className="w-[140px] h-[140px] bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">$1,125</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                <span className="text-sm text-gray-600">Food & Drink</span>
              </div>
              <span className="text-sm font-bold text-gray-900">48%</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                <span className="text-sm text-gray-600">Grocery</span>
              </div>
              <span className="text-sm font-bold text-gray-900">32%</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-900"></span>
                <span className="text-sm text-gray-600">Shopping</span>
              </div>
              <span className="text-sm font-bold text-gray-900">13%</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Transport</span>
              </div>
              <span className="text-sm font-bold text-gray-900">7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
