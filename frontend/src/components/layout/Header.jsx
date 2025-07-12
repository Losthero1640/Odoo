import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Search, Menu, X, LogOut, Plus } from 'lucide-react';
import { authAPI } from '../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authAPI.getCurrentUser();
  
  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
    setIsProfileOpen(false);
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ReWear</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/browse" 
              className={`text-sm font-medium transition-colors ${
                isActive('/browse') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Browse Clothing
            </Link>
            {currentUser && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/swaps" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/swaps') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Swaps
                </Link>
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`text-sm font-medium transition-colors ${
                      isActive('/admin') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/add-item"
                  className="hidden md:flex items-center space-x-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  <span>List Clothing</span>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden md:block text-sm font-medium">{currentUser.name}</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.points} points</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/browse" 
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Clothing
              </Link>
              {currentUser && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/swaps" 
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Swaps
                  </Link>
                  <Link 
                    to="/add-item" 
                    className="text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    List Clothing
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;