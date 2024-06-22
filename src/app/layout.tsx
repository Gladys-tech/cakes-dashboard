
"use client";
import { useState, FC, ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

type LayoutProps = {
  children: ReactNode;
};

const RootLayout: FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <UserProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`flex-1 flex flex-col transition-all duration-200 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
              <Navbar toggleSidebar={toggleSidebar} />
              <main className="flex-1 mt-16 p-4 overflow-auto">{children}</main>
            </div>
          </div>
        </body>
      </html>
    </UserProvider>
  );
};

export default RootLayout;

