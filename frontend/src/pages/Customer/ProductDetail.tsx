import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
  category?: string;
  stock: number;
  images?: string[];
  features?: string[];
  specifications?: { [key: string]: string };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      const data = await response.json();
      setProduct(data.product || null);
    } catch (error) {
      console.error('Error fetching product:', error);
      // Set mock data for demo
      const mockProducts = {
        1: {
          id: 1,
          name: 'Wireless Headphones',
          price: 99.99,
          description: 'Premium wireless headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals who demand the best audio experience.',
          category: 'Electronics',
          stock: 25,
          features: [
            'Active Noise Cancellation',
            '30-hour battery life',
            'Bluetooth 5.0 connectivity',
            'Premium build quality',
            'Voice assistant support',
            'Fast charging (15 min = 3 hours)'
          ],
          specifications: {
            'Battery Life': '30 hours',
            'Connectivity': 'Bluetooth 5.0',
            'Weight': '250g',
            'Frequency Response': '20Hz - 20kHz',
            'Charging Time': '2 hours',
            'Warranty': '2 years'
          }
        },
        2: {
          id: 2,
          name: 'Gaming Mouse',
          price: 59.99,
          description: 'High-performance gaming mouse with customizable RGB lighting and precision tracking for competitive gaming.',
          category: 'Electronics',
          stock: 30,
          features: [
            'High-precision sensor',
            'Customizable RGB lighting',
            'Programmable buttons',
            'Ergonomic design',
            'Gaming-grade switches',
            'Adjustable DPI settings'
          ],
          specifications: {
            'DPI': 'Up to 16,000',
            'Buttons': '8 programmable',
            'Connectivity': 'USB-A',
            'Weight': '95g',
            'Polling Rate': '1000Hz',
            'Warranty': '1 year'
          }
        }
      };
      
      setProduct(mockProducts[productId as keyof typeof mockProducts] || {
        id: productId,
        name: `Product ${productId}`,
        price: 49.99,
        description: 'This is a sample product description for demonstration purposes.',
        category: 'General',
        stock: 10,
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        specifications: {
          'Brand': 'ShopHub',
          'Model': `SH-${productId}`,
          'Warranty': '1 year'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Add to cart logic here
      console.log(`Adding ${quantity} of product ${product.id} to cart`);
      // You could dispatch to a cart store/context here
      alert(`Added ${quantity} ${product.name}(s) to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Navigate to checkout with this product
      navigate('/checkout', { state: { product, quantity } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gray-900">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-gray-900">Products</button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-3xl">📦</span>
                      </div>
                      <span className="text-gray-500 text-lg">{product.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail images (if multiple images exist) */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.category && (
                  <p className="text-lg text-gray-600">{product.category}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                <span className={`text-lg ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">{product.description}</p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-gray-600 hover:text-gray-900"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 text-gray-600 hover:text-gray-900"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-6 text-lg font-medium rounded-md transition-colors duration-200 ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-6 text-lg font-medium rounded-md transition-colors duration-200 ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500 text-xl">📦</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Related Product {i}</h3>
                  <p className="text-sm text-gray-500 mb-2">Electronics</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">${(29.99 * i).toFixed(2)}</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
