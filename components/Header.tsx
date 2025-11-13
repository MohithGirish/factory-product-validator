import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import { ValidatorIcon } from './icons/ValidatorIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { AdminIcon } from './icons/AdminIcon';

interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItemClasses = (page: Page) => 
    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      currentPage === page 
      ? 'bg-blue-100 text-blue-700' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="ml-3 text-xl font-bold text-gray-800">Validator</span>
            </div>
            <nav className="hidden md:flex items-center ml-10 space-x-4">
              <button onClick={() => setCurrentPage(Page.VALIDATOR)} className={navItemClasses(Page.VALIDATOR)}>
                <ValidatorIcon />
                <span className="ml-2">Validator</span>
              </button>
              <button onClick={() => setCurrentPage(Page.DATABASE)} className={navItemClasses(Page.DATABASE)}>
                <DatabaseIcon />
                <span className="ml-2">Database</span>
              </button>
              <button onClick={() => setCurrentPage(Page.HISTORY)} className={navItemClasses(Page.HISTORY)}>
                <HistoryIcon />
                <span className="ml-2">History</span>
              </button>
              {isAdmin && (
                <button onClick={() => setCurrentPage(Page.ADMIN)} className={navItemClasses(Page.ADMIN)}>
                  <AdminIcon />
                  <span className="ml-2">Admin Log</span>
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} Access</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full text-gray-400 bg-white hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="Logout"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile navigation */}
       <div className="md:hidden border-t border-gray-200">
         <div className="flex justify-around p-2">
            <button onClick={() => setCurrentPage(Page.VALIDATOR)} className={navItemClasses(Page.VALIDATOR) + ' flex-1 justify-center'}>
              <ValidatorIcon />
              <span className="ml-2">Validator</span>
            </button>
            <button onClick={() => setCurrentPage(Page.DATABASE)} className={navItemClasses(Page.DATABASE) + ' flex-1 justify-center'}>
              <DatabaseIcon />
              <span className="ml-2">Database</span>
            </button>
            <button onClick={() => setCurrentPage(Page.HISTORY)} className={navItemClasses(Page.HISTORY) + ' flex-1 justify-center'}>
              <HistoryIcon />
              <span className="ml-2">History</span>
            </button>
            {isAdmin && (
                <button onClick={() => setCurrentPage(Page.ADMIN)} className={navItemClasses(Page.ADMIN) + ' flex-1 justify-center'}>
                  <AdminIcon />
                  <span className="ml-2">Admin</span>
                </button>
            )}
         </div>
       </div>
    </header>
  );
};

export default Header;