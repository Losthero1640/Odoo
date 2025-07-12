import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import AdminItemRow from '../components/admin/AdminItemRow';
import { authAPI, adminAPI } from '../services/api';

const AdminPanel = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const currentUser = authAPI.getCurrentUser();
  
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const items = await adminAPI.getPendingItems();
        setPendingItems(items);
      } catch (error) {
        console.error('Error fetching pending items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingItems();
  }, []);
  
  const handleApprove = async (itemId) => {
    setActionLoading(itemId);
    try {
      await adminAPI.approveItem(itemId);
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error approving item:', error);
      alert('Failed to approve item');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleReject = async (itemId) => {
    if (!confirm('Are you sure you want to reject this item? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(itemId);
    try {
      await adminAPI.rejectItem(itemId);
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error rejecting item:', error);
      alert('Failed to reject item');
    } finally {
      setActionLoading(null);
    }
  };
  
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  const breadcrumbItems = [
    { label: 'Admin Panel' }
  ];
  
  const stats = [
    {
      label: 'Pending Items',
      value: pendingItems.length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Items Reviewed',
      value: '24', // This would come from API in real app
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
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
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="text-primary-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Review and moderate community content</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        
        {/* Pending Items */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Items for Review</h2>
            <p className="text-gray-600 text-sm mt-1">
              Review and approve or reject items submitted by users
            </p>
          </div>
          
          {pendingItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingItems.map(item => (
                    <AdminItemRow
                      key={item.id}
                      item={item}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      loading={actionLoading === item.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">There are no pending clothing items to review at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;