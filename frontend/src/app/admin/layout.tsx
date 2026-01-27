"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  DollarSign,
  Settings,
  Search,
  FileText,
  Building,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Gift,
  Users,
  QrCode,
  Receipt,
  Tag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/prices', label: 'Fiyatlar', icon: DollarSign },
  { href: '/admin/price-source', label: 'Fiyat Kaynağı', icon: RefreshCw },
  { href: '/admin/customers', label: 'Müşteriler', icon: Users },
  { href: '/admin/qrcodes', label: 'QR Kodlar', icon: QrCode },
  { href: '/admin/categories', label: 'Puan Kategorileri', icon: Tag },
  { href: '/admin/transactions', label: 'İşlemler', icon: Receipt },
  { href: '/admin/campaigns', label: 'Kampanyalar', icon: Gift },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/articles', label: 'Makaleler', icon: FileText },
  { href: '/admin/branches', label: 'Şubeler', icon: Building },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    api.get('/api/auth/verify')
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/admin/login');
      });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Aka Kuyumculuk</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                  ${isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-amber-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-12"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cikis Yap
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-400">Admin</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-gray-700 font-medium">
                  {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Siteyi Görüntüle</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
