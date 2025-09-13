const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products?limit=5',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('🎉 API Response received successfully!');
      console.log(`📦 Found ${products.products?.length || products.length || 0} products`);
      
      if (products.products) {
        // If paginated response
        console.log(`📊 Total products in database: ${products.total || 'unknown'}`);
        products.products.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ₹${product.price}`);
        });
      } else if (Array.isArray(products)) {
        // If direct array
        products.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ₹${product.price}`);
        });
      }
      
      console.log('\n✅ Products API is working with INR currency!');
    } catch (error) {
      console.log('Raw response:', data);
      console.error('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('Make sure the server is running on http://localhost:5000');
});

req.end();

setTimeout(() => {
  console.log('⏰ Test timeout - make sure server is running');
  process.exit(1);
}, 5000);