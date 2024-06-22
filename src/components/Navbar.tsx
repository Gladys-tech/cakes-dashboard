
"use client";
import { useState, FC } from 'react';
import Link from 'next/link';
import { AccountCircle } from '@mui/icons-material';
import { useUser } from '@/context/UserContext';

type NavbarProps = {
    toggleSidebar: () => void;
};

const Navbar: FC<NavbarProps> = ({ toggleSidebar }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user } = useUser();



    const handleLinkClick = () => {
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setDropdownOpen(false); 
        window.location.href = '/login'; // Redirect to login or home page after logout
    };

    return (
        <nav className="bg-white shadow p-2 flex justify-between items-center fixed top-0 left-0 right-0 z-20 md:ml-64">
            <button onClick={toggleSidebar} className="md:hidden focus:outline-none">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
            </button>
            <div className="relative text-gray-600">
                <input
                    type="search"
                    name="search"
                    placeholder="Search"
                    className="bg-gray-200 h-8 px-5 pr-10 rounded-full text-sm focus:outline-none"
                />
                <button type="submit" className="absolute right-0 top-0 mt-2 mr-4">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-6-8a6 6 0 1 0 12 0 6 6 0 0 0-12 0zm18 10.5l-5-5"></path>
                    </svg>
                </button>
            </div>
            <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
                    <AccountCircle style={{ fontSize: 32, color: 'gray' }} />
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <Link href="/profile" legacyBehavior>
                            <a onClick={handleLinkClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                        </Link>
                        {user ? (
                            <span className="block px-4 py-2 text-sm text-gray-700">{user.firstName}</span>
                        ) : (
                            <Link href="/signup" legacyBehavior>
                                <a onClick={handleLinkClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign-up</a>
                            </Link>
                        )}
                        <Link href="/login" legacyBehavior>
                            <a  onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

