import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, RefreshCw, TrendingUp, Eye } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ItemCard from '../components/common/ItemCard';
import SwapStatusBadge from '../components/common/SwapStatusBadge';
import { authAPI, itemsAPI, swapsAPI } from '../services/api';

const Dashboard = () => {
  const [userItems, setUserItems] = useState([]);
  const [userSwaps, setUserSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authAPI.getCurrentUser();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        const [items, swaps] = await Promise.all([
          itemsAPI.getUserItems(currentUser.id),
          swapsAPI.getUserSwaps(currentUser.id)
        ]);
        
        setUserItems(items);
        setUserSwaps(swaps);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h2>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  const breadcrumbItems = [
    { label: 'Dashboard' }
  ];
  
  const stats = [
    {
      label: 'Total Points',
      value: currentUser.points,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Listed Items',
      value: userItems.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Swaps',
      value: userSwaps.filter(swap => swap.status === 'pending').length,
      icon: RefreshCw,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];
  
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser.name}!</h1>
              <p className="mt-2 text-gray-600">Manage your items and track your swaps</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/add-item"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                List New Item
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`${stat.color}`} size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Items */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Items</h2>
                <Link 
                  to="/browse" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {userItems.length > 0 ? (
                <div className="space-y-4">
                  {userItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <img
                        src={item.images?.[0] || 'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <SwapStatusBadge status={item.approved ? 'available' : 'pending'} />
                          <span className="text-xs text-gray-500">{item.points} points</span>
                        </div>
                      </div>
                      <Link
                        to={`/item/${item.id}`}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Eye size={20} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by listing your first item</p>
                  <div className="mt-6">
                    <Link
                      to="/add-item"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" />
                      List Item
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Swaps */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Swaps</h2>
                <Link 
                  to="/swaps" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {userSwaps.length > 0 ? (
                <div className="space-y-4">
                  {userSwaps.slice(0, 3).map(swap => (
                    <div key={swap.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Swap Request #{swap.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <SwapStatusBadge status={swap.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No exchanges yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start browsing clothing to make your first exchange</p>
                  <div className="mt-6">
                    <Link
                      to="/browse"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Browse Clothing
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;