import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import SwapStatusBadge from '../components/common/SwapStatusBadge';
import { itemsAPI, authAPI, swapsAPI } from '../services/api';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);
  const currentUser = authAPI.getCurrentUser();
  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await itemsAPI.getItem(id);
        setItem(fetchedItem);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  const nextImage = () => {
    if (item?.images && currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  const handleSwapRequest = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setSwapLoading(true);
    try {
      await swapsAPI.createSwap({
        itemId: item.id,
        requesterId: currentUser.id,
        message: swapMessage
      });
      setShowSwapModal(false);
      setSwapMessage('');
      // In a real app, you might want to show a success message
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error creating swap:', error);
      alert('Failed to send swap request');
    } finally {
      setSwapLoading(false);
    }
  };
  
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
  
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
            <button
              onClick={() => navigate('/browse')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const breadcrumbItems = [
    { label: 'Browse', href: '/browse' },
    { label: item.category, href: `/browse?category=${item.category}` },
    { label: item.title }
  ];
  
  const isOwnItem = currentUser?.id === item.uploader?.id;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="p-6">
              <div className="relative mb-4">
                <img
                  src={item.images?.[currentImageIndex] || 'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                
                {item.images && item.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === item.images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                
                {/* Image indicator */}
                {item.images && item.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {item.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {item.images && item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-primary-600' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Item Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                  <div className="flex items-center space-x-3">
                    <SwapStatusBadge status={item.status} />
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {item.points} points
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                    <Flag size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Category</span>
                    <span className="text-gray-900">{item.category}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Type</span>
                    <span className="text-gray-900">{item.type}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Condition</span>
                    <span className="text-gray-900">{item.condition}</span>
                  </div>
                  {item.size && (
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Size</span>
                      <span className="text-gray-900">{item.size}</span>
                    </div>
                  )}
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Uploader Info */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Listed by</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={item.uploader?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={item.uploader?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.uploader?.name}</p>
                    <p className="text-sm text-gray-500">
                      Listed on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {!isOwnItem && currentUser && item.status === 'available' && (
                  <>
                    <button
                      onClick={() => setShowSwapModal(true)}
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Request Swap
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <MessageCircle size={20} className="mr-2" />
                      Contact Seller
                    </button>
                  </>
                )}
                
                {!currentUser && (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Login to Swap
                  </button>
                )}
                
                {isOwnItem && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-center">This is your item</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Exchange</h3>
            <p className="text-gray-600 mb-4">
              Send a message to {item.uploader?.name} about exchanging for this clothing item.
            </p>
            
            <textarea
              value={swapMessage}
              onChange={(e) => setSwapMessage(e.target.value)}
              placeholder="Hi! I'm interested in exchanging for your clothing item..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSwapRequest}
                disabled={swapLoading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {swapLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowSwapModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailPage;