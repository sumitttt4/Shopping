// Quick test script to verify our API endpoints
const { Product, Category } = require('./src/models');

async function testDatabase() {
  try {
    console.log('🔍 Testing database content...\n');
    
    // Count products
    const productCount = await Product.count();
    console.log(`📦 Total products: ${productCount}`);
    
    // Count categories
    const categoryCount = await Category.count();
    console.log(`📂 Total categories: ${categoryCount}\n`);
    
    // Get first 5 products with categories
    const products = await Product.findAll({
      limit: 5,
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('🛍️ Sample products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category?.name || 'No category'})`);
    });
    
    // Get products by category with counts
    console.log('\n📊 Products by category:');
    const categories = await Category.findAll({
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id']
      }]
    });
    
    categories.forEach(category => {
      console.log(`• ${category.name}: ${category.products?.length || 0} products`);
    });
    
    console.log('\n✅ API test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();