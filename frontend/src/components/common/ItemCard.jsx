import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';

const ItemCard = ({ item, showActions = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={item.images?.[0] || 'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {item.points} points
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
            {item.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {item.category}
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            {item.condition}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={item.uploader?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50'}
              alt={item.uploader?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600">{item.uploader?.name}</span>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart size={16} />
              </button>
              <Link
                to={`/item/${item.id}`}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Eye size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;