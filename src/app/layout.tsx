'use client';

import React, { useState } from 'react';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ToastProvider } from '@/components/common/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Agent'>('Admin');

  return (
    <html lang="en" className="dark h-full">
      <head>
        <title>Sennova Innovation - AI Voice Calling Platform</title>
        <meta name="description" content="Production-ready AI Voice Calling Platform for Sennova Innovation Pvt Ltd" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
        <ToastProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <Header currentRole={role} onRoleChange={setRole} />
              
              <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
