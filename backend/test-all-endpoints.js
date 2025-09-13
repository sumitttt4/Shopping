const http = require('http');

// Test multiple endpoints
const endpoints = [
  '/api/products',
  '/api/categories',
  '/api/products?category=groceries-staples',
];

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
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
          const response = JSON.parse(data);
          resolve({ path, response, status: res.statusCode });
        } catch (error) {
          resolve({ path, error: error.message, data });
        }
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    req.end();
  });
}

async function testAll() {
  console.log('🧪 Testing API endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      console.log(`✅ ${endpoint}`);
      
      if (result.response) {
        if (result.response.products) {
          console.log(`   📦 Found ${result.response.products.length} products (Total: ${result.response.total})`);
          if (result.response.products[0]) {
            console.log(`   💰 Sample: ${result.response.products[0].name} - ₹${result.response.products[0].price}`);
          }
        } else if (Array.isArray(result.response)) {
          console.log(`   📂 Found ${result.response.length} items`);
          if (result.response[0]) {
            console.log(`   🏷️  Sample: ${result.response[0].name}`);
          }
        }
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.error}\n`);
    }
  }
  
  console.log('🎉 All tests completed!');
  process.exit(0);
}

testAll().catch(console.error);