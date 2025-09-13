import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface OrderDetails {
  orderNumber: string;
  total: number;
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
  paymentMethod: string;
  estimatedDelivery: string;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // In a real app, this would come from the backend
    // For demo purposes, we'll create mock data or use location state
    const mockOrder: OrderDetails = {
      orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      total: 565,
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
      paymentMethod: '**** **** **** 1234',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    setOrderDetails(mockOrder);

    // Clear cart after successful order
    localStorage.removeItem('cart');
  }, []);

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <span className="text-sm text-gray-500">#{orderDetails.orderNumber}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                <p>{orderDetails.shippingAddress.address}</p>
                <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.zipCode}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600">{orderDetails.paymentMethod}</p>
              
              <h3 className="font-medium text-gray-900 mb-2 mt-4">Estimated Delivery</h3>
              <p className="text-sm text-gray-600">{orderDetails.estimatedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">₹{orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/orders/${orderDetails.orderNumber}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Track Your Order
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-gray-100 text-gray-900 text-center py-3 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-4 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• We'll send shipping updates as your order progresses</li>
            <li>• Expected delivery: {orderDetails.estimatedDelivery}</li>
            <li>• Questions? Contact our support team anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;