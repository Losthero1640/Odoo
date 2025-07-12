import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Home size={20} className="mr-2" />
            Go to Homepage
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help finding something?</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/browse"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Browse Items
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Contact Support
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link
              to="/help"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;