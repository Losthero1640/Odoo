import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SwapStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Pending'
    },
    approved: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Approved'
    },
    rejected: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Rejected'
    },
    completed: {
      icon: CheckCircle,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Completed'
    },
    available: {
      icon: AlertCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Available'
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon size={12} className="mr-1" />
      {config.label}
    </span>
  );
};

export default SwapStatusBadge;