
"use client";
import Link from 'next/link';
import { FC } from 'react';

type SidebarProps = {
    isOpen: boolean;
    toggleSidebar: () => void;
};

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const handleLogoClick = () => {
        if (isOpen) {
            toggleSidebar(); // Close the sidebar if it's open
        }
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-200 ease-in-out bg-gray-800 text-white w-64 space-y-6 py-7 px-2 md:relative md:translate-x-0 md:block`}
        >
            <nav>
                <Link href="/" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    logo
                </Link>
                <Link href="/create-shop" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Create Shop
                </Link>
                <Link href="/shops" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Shops
                </Link>
                <Link href="/create-product" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Create Product
                </Link>
                <Link href="/products" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Products
                </Link>
                <Link href="/orders" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Orders
                </Link>
                
                {/* <Link href="/users" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Users
                </Link>
                <Link href="/customers" onClick={handleLogoClick} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                    Customers
                </Link> */}
            </nav>
            <button onClick={toggleSidebar} className="md:hidden text-black absolute top-5 right-5 focus:outline-none">
                <svg className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Sidebar;

