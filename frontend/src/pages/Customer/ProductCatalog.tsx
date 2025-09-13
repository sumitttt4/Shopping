import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../../components/UI/StarRating';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

interface Category {
  id: number;
  name: string;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set mock data for demo
      setProducts([
        { id: 1, name: 'Basmati Rice (5kg)', price: 450, category: 'Groceries', stock: 25, rating: 4.5, reviewCount: 127 },
        { id: 2, name: 'Tata Tea Gold (1kg)', price: 480, category: 'Groceries', stock: 30, rating: 4.2, reviewCount: 89 },
        { id: 3, name: 'Colgate Toothpaste', price: 85, category: 'Personal Care', stock: 50, rating: 4.1, reviewCount: 203 },
        { id: 4, name: 'Dettol Hand Wash (200ml)', price: 95, category: 'Personal Care', stock: 40, rating: 4.3, reviewCount: 156 },
        { id: 5, name: 'Amul Butter (500g)', price: 285, category: 'Dairy', stock: 20, rating: 4.4, reviewCount: 94 },
        { id: 6, name: 'Fortune Sunflower Oil (1L)', price: 135, category: 'Cooking', stock: 15, rating: 4.0, reviewCount: 67 },
        { id: 7, name: 'Parle-G Biscuits (1kg)', price: 120, category: 'Snacks', stock: 12, rating: 4.6, reviewCount: 143 },
        { id: 8, name: 'Himalaya Face Cream', price: 175, category: 'Personal Care', stock: 18, rating: 3.9, reviewCount: 52 },
        { id: 9, name: 'Maggi Noodles (12 pack)', price: 144, category: 'Instant Food', stock: 35, rating: 4.2, reviewCount: 118 },
        { id: 10, name: 'Surf Excel Detergent (1kg)', price: 285, category: 'Household', stock: 10, rating: 4.1, reviewCount: 73 },
        { id: 11, name: 'Cadbury Dairy Milk (165g)', price: 95, category: 'Snacks', stock: 28, rating: 4.0, reviewCount: 91 },
        { id: 12, name: 'Red Label Tea (500g)', price: 240, category: 'Groceries', stock: 22, rating: 4.3, reviewCount: 85 },
        { id: 13, name: 'Britannia Good Day Cookies', price: 55, category: 'Snacks', stock: 45, rating: 4.2, reviewCount: 112 },
        { id: 14, name: 'Clinic Plus Shampoo (340ml)', price: 125, category: 'Personal Care', stock: 32, rating: 3.8, reviewCount: 76 },
        { id: 15, name: 'Aashirvaad Atta (10kg)', price: 520, category: 'Groceries', stock: 18, rating: 4.4, reviewCount: 158 },
        { id: 16, name: 'Nescafe Coffee (50g)', price: 165, category: 'Beverages', stock: 38, rating: 4.1, reviewCount: 93 },
        { id: 17, name: 'Patanjali Honey (500g)', price: 295, category: 'Health', stock: 24, rating: 4.3, reviewCount: 67 },
        { id: 18, name: 'Vim Dishwash Gel (500ml)', price: 85, category: 'Household', stock: 41, rating: 4.0, reviewCount: 124 },
        { id: 19, name: 'Kissan Mixed Fruit Jam', price: 145, category: 'Spreads', stock: 27, rating: 3.9, reviewCount: 55 },
        { id: 20, name: 'Ariel Washing Powder (1kg)', price: 275, category: 'Household', stock: 33, rating: 4.2, reviewCount: 98 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set mock data for demo
      setCategories([
        { id: 1, name: 'Groceries' },
        { id: 2, name: 'Personal Care' },
        { id: 3, name: 'Household' },
        { id: 4, name: 'Snacks' },
        { id: 5, name: 'Cooking' },
        { id: 6, name: 'Dairy' },
        { id: 7, name: 'Beverages' },
        { id: 8, name: 'Health' },
        { id: 9, name: 'Instant Food' },
        { id: 10, name: 'Spreads' },
      ]);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-lg text-gray-600">Discover our wide range of quality products</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {currentProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-xl">📦</span>
                            </div>
                            <span className="text-gray-500 text-sm">{product.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      {product.category && (
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      )}
                      {product.rating && (
                        <div className="flex items-center space-x-1 mb-2">
                          <StarRating rating={product.rating} size="sm" />
                          <span className="text-xs text-gray-600">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-bold text-blue-600">₹{product.price.toFixed(2)}</span>
                        {product.stock !== undefined && (
                          <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        )}
                      </div>
                      <button 
                        className={`w-full py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                          product.stock === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* No products found */}
            {currentProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-gray-400">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
