import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ItemCard from '../components/common/ItemCard';
import { itemsAPI, CATEGORIES } from '../services/api';

const BrowsePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all'
  });
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const fetchedItems = await itemsAPI.getItems(filters);
        setItems(fetchedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [filters]);
  
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category
    }));
  };
  
  const breadcrumbItems = [
    { label: 'Browse Items' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Clothing</h1>
          <p className="text-gray-600">Discover amazing clothing shared by our community</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clothing..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
                title="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
                title="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${items.length} clothing items`}
          </p>
        </div>
        
        {/* Items Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : items.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {items.map(item => (
              viewMode === 'grid' ? (
                <ItemCard key={item.id} item={item} />
              ) : (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <img
                    src={item.images?.[0] || 'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={item.title}
                    className="w-full sm:w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.points} points
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                        {item.category}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                        {item.condition}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.uploader?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50'}
                          alt={item.uploader?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{item.uploader?.name}</span>
                      </div>
                      <Link
                        to={`/item/${item.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria for clothing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;