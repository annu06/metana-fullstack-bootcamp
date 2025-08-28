import React from 'react';
import Navigation from './Navigation';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-primary-600">My</span> Portfolio
              </h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome to my digital space
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Component */}
      <Navigation />
    </header>
  );
};

export default Header;