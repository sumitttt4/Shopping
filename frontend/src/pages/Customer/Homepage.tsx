import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ShoppingBagIcon, TruckIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  rating?: number;
  discount?: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
  color: string;
}

const CustomerHomepage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products from backend
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products?limit=8');
      const data = await response.json();
      setFeaturedProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Set mock data for demo with Indian products
      setFeaturedProducts([
        { id: 1, name: 'Basmati Rice Premium', price: 450, originalPrice: 500, category: 'Groceries', rating: 4.5, discount: 10 },
        { id: 2, name: 'Tata Tea Premium', price: 480, originalPrice: 520, category: 'Groceries', rating: 4.7, discount: 8 },
        { id: 3, name: 'Colgate Toothpaste', price: 85, originalPrice: 95, category: 'Personal Care', rating: 4.3, discount: 11 },
        { id: 4, name: 'Amul Fresh Butter', price: 285, originalPrice: 300, category: 'Groceries', rating: 4.6, discount: 5 },
        { id: 5, name: 'Himalaya Face Wash', price: 195, originalPrice: 220, category: 'Personal Care', rating: 4.4, discount: 11 },
        { id: 6, name: 'Surf Excel Detergent', price: 385, originalPrice: 425, category: 'Household', rating: 4.5, discount: 9 },
        { id: 7, name: 'Britannia Cookies', price: 55, originalPrice: 65, category: 'Snacks', rating: 4.2, discount: 15 },
        { id: 8, name: 'Dove Beauty Soap', price: 135, originalPrice: 150, category: 'Personal Care', rating: 4.6, discount: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories: Category[] = [
    { id: 1, name: 'Groceries', icon: '🛒', count: 1250, color: 'blue-50' },
    { id: 2, name: 'Personal Care', icon: '🧴', count: 850, color: 'blue-50' },
    { id: 3, name: 'Household', icon: '🏠', count: 650, color: 'blue-50' },
    { id: 4, name: 'Snacks', icon: '🍪', count: 450, color: 'blue-50' },
    { id: 5, name: 'Health', icon: '💊', count: 320, color: 'blue-50' },
    { id: 6, name: 'Baby Care', icon: '👶', count: 280, color: 'blue-50' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Minimal Design */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gray-50 opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                🇮🇳 Made for India
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Daily Needs,
              <br />
              <span className="text-blue-600">
                Delivered Fresh
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              From premium groceries to daily essentials - discover authentic Indian products 
              at unbeatable prices with free delivery across India
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/products"
                className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ShoppingBagIcon className="w-6 h-6 mr-2" />
                Start Shopping
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/products"
                className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Browse Categories
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Free delivery above ₹1,500</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">100% authentic products</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of Indian daily essentials and household products
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count}+ items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4 border border-blue-200">
              🔥 Trending Now
            </div>
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      Featured Products
                    </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most loved products by our customers across India
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      -{product.discount}% OFF
                    </div>
                  )}

                  {/* Wishlist Icon */}
                  <button className="absolute top-4 right-4 z-20 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 group-hover:scale-110 shadow-sm">
                    <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>

                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative overflow-hidden bg-gray-50 rounded-t-xl">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-2xl">�</span>
                            </div>
                            <span className="text-gray-600 text-sm font-medium">{product.name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {product.category && (
                        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full mb-2 border border-blue-200">
                          {product.category}
                        </span>
                      )}
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.rating && (
                        <div className="flex items-center mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View All Products
              <ChevronRightIcon className="ml-2 w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DesiMart?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              India's most trusted online marketplace for authentic daily essentials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <TruckIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Same-day delivery in major cities. Free shipping on orders above ₹1,500. 
                Track your order in real-time from our warehouse to your doorstep.
              </p>
              <div className="mt-4 text-sm text-green-600 font-semibold">
                🚚 Average delivery: 2-4 hours in metros
              </div>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">�</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Secure & Authentic</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security for all transactions. Only genuine products from verified sellers. 
                Easy returns and full refund guarantee on all purchases.
              </p>
              <div className="mt-4 text-sm text-blue-600 font-semibold">
                🛡️ SSL encrypted • PCI DSS compliant
              </div>
            </div>

            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gray-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">�</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">24</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Customer Care</h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated support team available round the clock. Chat, call, or email - 
                we're here to help you with any questions or concerns.
              </p>
              <div className="mt-4 text-sm text-gray-600 font-semibold">
                📞 Hindi, English & Regional languages
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Cities Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
              📬 Stay Connected
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Get the Best Deals First!
          </h2>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join 500K+ smart shoppers and get exclusive discounts, early access to sales, 
            and personalized product recommendations delivered to your inbox.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 placeholder-gray-500"
              />
              <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe Now
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center space-x-6 text-gray-400">
            <span className="text-sm">🎁 Weekly deals</span>
            <span className="text-sm">🛒 New arrivals</span>
            <span className="text-sm">💰 Exclusive coupons</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHomepage;
