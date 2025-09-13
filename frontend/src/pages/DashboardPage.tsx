import React, { useState } from 'react';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
  revenueChange: number;
  ordersChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
}

const DashboardPage: React.FC = () => {
  const [stats] = useState<DashboardStats>({
    totalProducts: 1234,
    totalOrders: 567,
    totalCustomers: 89,
    revenue: 52430,
    revenueChange: 12.5,
    ordersChange: -2.3
  });

  const [recentOrders] = useState<RecentOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      status: 'delivered',
      total: 299.99,
      createdAt: '2 minutes ago'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      status: 'processing',
      total: 159.50,
      createdAt: '15 minutes ago'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Johnson',
      status: 'shipped',
      total: 89.99,
      createdAt: '1 hour ago'
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      customerName: 'Sarah Wilson',
      status: 'pending',
      total: 425.00,
      createdAt: '2 hours ago'
    }
  ]);

  const [lowStockProducts] = useState<LowStockProduct[]>([
    { id: '1', name: 'Wireless Headphones', sku: 'WH-001', currentStock: 3, lowStockThreshold: 10 },
    { id: '2', name: 'Gaming Mouse', sku: 'GM-001', currentStock: 5, lowStockThreshold: 15 },
    { id: '3', name: 'USB Cable', sku: 'UC-001', currentStock: 2, lowStockThreshold: 20 },
    { id: '4', name: 'Phone Case', sku: 'PC-001', currentStock: 1, lowStockThreshold: 25 }
  ]);

  const getStatusBadge = (status: RecentOrder['status']) => {
    const statusConfig = {
      pending: 'badge-warning',
      processing: 'badge-primary',
      shipped: 'badge-secondary',
      delivered: 'badge-success',
      cancelled: 'badge-error'
    };
    return statusConfig[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            View Reports
          </button>
          <button className="btn btn-primary">
            <ShoppingBagIcon className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                  <ShoppingBagIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.totalProducts)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-500 rounded-md flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {formatNumber(stats.totalOrders)}
                    <span className={`ml-2 flex items-center text-sm ${stats.ordersChange > 0 ? 'text-success-600' : 'text-error-600'}`}>
                      {stats.ordersChange > 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats.ordersChange)}%
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-500 rounded-md flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.totalCustomers)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-error-500 rounded-md flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {formatCurrency(stats.revenue)}
                    <span className={`ml-2 flex items-center text-sm ${stats.revenueChange > 0 ? 'text-success-600' : 'text-error-600'}`}>
                      {stats.revenueChange > 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats.revenueChange)}%
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customerName} • {order.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</span>
                    <span className={`badge ${getStatusBadge(order.status)} capitalize`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-500 mr-2" />
                Low Stock Alert
              </h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {product.currentStock} / {product.lowStockThreshold}
                    </span>
                    <span className="badge badge-warning">Low Stock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="text-center">
                <ShoppingBagIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Add Product</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="text-center">
                <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Process Orders</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="text-center">
                <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Manage Customers</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="text-center">
                <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">View Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;