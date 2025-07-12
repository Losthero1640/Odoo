import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, MessageCircle } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import SwapStatusBadge from '../components/common/SwapStatusBadge';
import { authAPI, swapsAPI, itemsAPI } from '../services/api';

const SwapsPage = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const currentUser = authAPI.getCurrentUser();
  
  useEffect(() => {
    const fetchSwaps = async () => {
      if (!currentUser) return;
      
      try {
        const userSwaps = await swapsAPI.getUserSwaps(currentUser.id);
        setSwaps(userSwaps);
      } catch (error) {
        console.error('Error fetching swaps:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSwaps();
  }, [currentUser]);
  
  const filteredSwaps = swaps.filter(swap => {
    if (activeTab === 'all') return true;
    return swap.status === activeTab;
  });
  
  const breadcrumbItems = [
    { label: 'My Swaps' }
  ];
  
  const tabs = [
    { id: 'all', label: 'All', count: swaps.length },
    { id: 'pending', label: 'Pending', count: swaps.filter(s => s.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: swaps.filter(s => s.status === 'approved').length },
    { id: 'completed', label: 'Completed', count: swaps.filter(s => s.status === 'completed').length }
  ];
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your swaps</h2>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Swaps</h1>
          <p className="text-gray-600">Track your swap requests and manage ongoing exchanges</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Swaps List */}
        {filteredSwaps.length > 0 ? (
          <div className="space-y-4">
            {filteredSwaps.map(swap => (
              <div key={swap.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Swap Request #{swap.id}
                      </h3>
                      <SwapStatusBadge status={swap.status} />
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      Requested on {new Date(swap.createdAt).toLocaleDateString()}
                    </p>
                    
                    {swap.message && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700 italic">"{swap.message}"</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        Item ID: {swap.itemId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <MessageCircle size={16} className="mr-1" />
                      Message
                    </button>
                    
                    {swap.status === 'pending' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <RefreshCw className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No exchanges yet' : `No ${activeTab} exchanges`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? 'Start browsing clothing to make your first exchange request'
                : `You don't have any ${activeTab} exchanges at the moment`
              }
            </p>
            {activeTab === 'all' && (
              <Link
                to="/browse"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Package className="mr-2 h-4 w-4" />
                Browse Clothing
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapsPage;