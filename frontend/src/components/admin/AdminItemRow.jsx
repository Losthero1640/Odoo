import React from 'react';
import { Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminItemRow = ({ item, onApprove, onReject }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={item.images?.[0] || 'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={item.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
              {item.title}
            </div>
            <div className="text-sm text-gray-500">{item.category}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={item.uploader?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50'}
            alt={item.uploader?.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {item.uploader?.name}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(item.createdAt).toLocaleDateString()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
          {item.points} points
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Link
            to={`/item/${item.id}`}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Details"
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => onApprove(item.id)}
            className="text-green-600 hover:text-green-900 p-1"
            title="Approve"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onReject(item.id)}
            className="text-red-600 hover:text-red-900 p-1"
            title="Reject"
          >
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminItemRow;