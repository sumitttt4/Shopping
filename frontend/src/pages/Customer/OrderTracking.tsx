import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderDetails {
  orderNumber: string;
  orderDate: string;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  estimatedDelivery: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
  };
  statusHistory: OrderStatus[];
}

const OrderTracking: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock order data - in a real app, this would be fetched from the backend
    const mockOrder: OrderDetails = {
      orderNumber: orderNumber || 'ORD-123456789',
      orderDate: '2024-01-25',
      total: 565,
      status: 'shipped',
      trackingNumber: 'TRK789012345',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items: [
        {
          id: 1,
          name: 'Tata Tea Premium',
          price: 480,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1597318024663-6958371654e9?w=200&h=200&fit=crop'
        },
        {
          id: 2,
          name: 'Colgate Toothpaste',
          price: 85,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop'
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'New York',
        zipCode: '10001'
      },
      statusHistory: [
        {
          id: '1',
          status: 'pending',
          timestamp: '2024-01-25T10:00:00Z',
          description: 'Order placed successfully',
          location: 'Online'
        },
        {
          id: '2',
          status: 'confirmed',
          timestamp: '2024-01-25T11:30:00Z',
          description: 'Order confirmed and payment processed',
          location: 'Processing Center'
        },
        {
          id: '3',
          status: 'processing',
          timestamp: '2024-01-25T14:00:00Z',
          description: 'Items being prepared for shipment',
          location: 'Fulfillment Center - NYC'
        },
        {
          id: '4',
          status: 'shipped',
          timestamp: '2024-01-26T09:00:00Z',
          description: 'Package shipped and on its way',
          location: 'Distribution Center - NYC'
        }
      ]
    };

    setTimeout(() => {
      setOrderDetails(mockOrder);
      setLoading(false);
    }, 1000);
  }, [orderNumber]);

  const getStatusColor = (status: string, isActive: boolean = false) => {
    if (!isActive) return 'bg-gray-200 text-gray-500';
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, isActive: boolean = false) => {
    switch (status) {
      case 'pending':
        return <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-gray-300'}`} />;
      case 'confirmed':
        return <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} />;
      case 'processing':
        return <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`} />;
      case 'shipped':
        return <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-purple-500' : 'bg-gray-300'}`} />;
      case 'delivered':
        return <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-300" />;
    }
  };

  const isStatusActive = (statusIndex: number, currentStatus: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(currentStatus);
    return statusIndex <= currentStatusIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find an order with that number.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/profile" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
            ← Back to Order History
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600">Order #{orderDetails.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status, true)}`}>
                  {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                </span>
              </div>
              
              {orderDetails.trackingNumber && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono text-lg font-medium">{orderDetails.trackingNumber}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="text-lg font-medium">{orderDetails.estimatedDelivery}</p>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h3>
              
              <div className="relative">
                {orderDetails.statusHistory.map((status, index) => {
                  const isActive = isStatusActive(index, orderDetails.status);
                  return (
                    <div key={status.id} className="relative flex items-start mb-6 last:mb-0">
                      {/* Timeline line */}
                      {index < orderDetails.statusHistory.length - 1 && (
                        <div className={`absolute left-1.5 top-6 w-0.5 h-12 ${isActive ? 'bg-blue-200' : 'bg-gray-200'}`} />
                      )}
                      
                      {/* Status icon */}
                      <div className="relative z-10 mr-4">
                        {getStatusIcon(status.status, isActive)}
                      </div>
                      
                      {/* Status details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {status.description}
                          </h4>
                          <span className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {new Date(status.timestamp).toLocaleDateString()} {new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {status.location && (
                          <p className={`text-xs mt-1 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {status.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">₹{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                </p>
                <p>{orderDetails.shippingAddress.address}</p>
                <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.zipCode}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                  Contact Support
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                  Return/Exchange
                </button>
                <Link
                  to="/products"
                  className="block w-full text-center px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Shop Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;