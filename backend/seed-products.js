const { sequelize, Product, Category, User } = require('./src/models');
const logger = require('./src/utils/logger');
const bcrypt = require('bcryptjs');

// Comprehensive Indian product data with INR pricing
const categories = [
  {
    name: 'Groceries & Staples',
    slug: 'groceries-staples',
    description: 'Daily essentials and food items'
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Health, beauty and personal hygiene products'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Home appliances and kitchen essentials'
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Mobile phones, laptops and electronic gadgets'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear and accessories'
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Healthcare products and wellness items'
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Books, notebooks and office supplies'
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment and fitness accessories'
  }
];

const products = [
  // Groceries & Staples (15 products)
  {
    name: 'Basmati Rice Premium 1kg',
    description: 'Premium quality aged basmati rice, perfect for biryanis and pulao. Aromatic long-grain rice from the foothills of Himalayas.',
    short_description: 'Premium aged basmati rice - 1kg pack',
    sku: 'RICE-BAS-1KG',
    price: 125.00,
    compare_price: 150.00,
    stock_quantity: 200,
    category: 'groceries-staples',
    featured: true,
    tags: ['rice', 'basmati', 'premium', 'cooking'],
    attributes: { brand: 'India Gate', origin: 'Punjab', weight: '1kg' }
  },
  {
    name: 'Tata Salt 1kg',
    description: 'Pure and hygienic iodized salt. Free flow, vacuum evaporated salt that ensures purity and taste.',
    short_description: 'Iodized table salt - 1kg pack',
    sku: 'SALT-TATA-1KG',
    price: 22.00,
    compare_price: 25.00,
    stock_quantity: 500,
    category: 'groceries-staples',
    tags: ['salt', 'iodized', 'tata', 'cooking'],
    attributes: { brand: 'Tata', type: 'Iodized', weight: '1kg' }
  },
  {
    name: 'Amul Pure Ghee 500ml',
    description: 'Pure cow ghee made from fresh cream. Rich in vitamins and perfect for cooking authentic Indian food.',
    short_description: 'Pure cow ghee - 500ml jar',
    sku: 'GHEE-AMUL-500ML',
    price: 285.00,
    compare_price: 320.00,
    stock_quantity: 150,
    category: 'groceries-staples',
    featured: true,
    tags: ['ghee', 'amul', 'pure', 'dairy'],
    attributes: { brand: 'Amul', type: 'Cow Ghee', volume: '500ml' }
  },
  {
    name: 'Maggi 2-Minute Noodles 12 Pack',
    description: 'Instant noodles with masala taste-maker. Ready in just 2 minutes, perfect for quick meals.',
    short_description: 'Instant masala noodles - 12 pack',
    sku: 'NOODLES-MAGGI-12P',
    price: 144.00,
    compare_price: 160.00,
    stock_quantity: 300,
    category: 'groceries-staples',
    tags: ['noodles', 'maggi', 'instant', 'masala'],
    attributes: { brand: 'Maggi', count: '12 pieces', flavor: 'Masala' }
  },
  {
    name: 'Haldiram\'s Bhujia 400g',
    description: 'Crispy and spicy gram flour noodles seasoned with spices. Perfect tea-time snack.',
    short_description: 'Crispy bhujia snack - 400g pack',
    sku: 'BHUJIA-HAL-400G',
    price: 95.00,
    compare_price: 110.00,
    stock_quantity: 180,
    category: 'groceries-staples',
    tags: ['bhujia', 'haldiram', 'snack', 'spicy'],
    attributes: { brand: 'Haldiram\'s', weight: '400g', type: 'Namkeen' }
  },
  {
    name: 'Britannia Good Day Cookies 600g',
    description: 'Butter cookies with a rich taste and crumbly texture. Perfect with tea or coffee.',
    short_description: 'Butter cookies - 600g family pack',
    sku: 'COOKIES-BRI-600G',
    price: 85.00,
    compare_price: 95.00,
    stock_quantity: 220,
    category: 'groceries-staples',
    tags: ['cookies', 'britannia', 'butter', 'sweet'],
    attributes: { brand: 'Britannia', weight: '600g', flavor: 'Butter' }
  },
  {
    name: 'Red Label Tea 1kg',
    description: 'Premium blend black tea with strong flavor and rich aroma. Perfect for making masala chai.',
    short_description: 'Black tea leaves - 1kg pack',
    sku: 'TEA-RED-1KG',
    price: 425.00,
    compare_price: 450.00,
    stock_quantity: 100,
    category: 'groceries-staples',
    tags: ['tea', 'black-tea', 'red-label', 'chai'],
    attributes: { brand: 'Red Label', weight: '1kg', type: 'Black Tea' }
  },
  {
    name: 'Saffola Gold Oil 1L',
    description: 'Blended cooking oil with rice bran and sunflower oil. Heart-healthy and light.',
    short_description: 'Blended cooking oil - 1L bottle',
    sku: 'OIL-SAF-1L',
    price: 165.00,
    compare_price: 180.00,
    stock_quantity: 120,
    category: 'groceries-staples',
    tags: ['oil', 'saffola', 'cooking', 'healthy'],
    attributes: { brand: 'Saffola', volume: '1L', type: 'Blended Oil' }
  },
  {
    name: 'Kissan Mixed Fruit Jam 700g',
    description: 'Delicious mixed fruit jam made with real fruits. Perfect for breakfast bread and toast.',
    short_description: 'Mixed fruit jam - 700g jar',
    sku: 'JAM-KIS-700G',
    price: 145.00,
    compare_price: 160.00,
    stock_quantity: 90,
    category: 'groceries-staples',
    tags: ['jam', 'kissan', 'mixed-fruit', 'breakfast'],
    attributes: { brand: 'Kissan', weight: '700g', flavor: 'Mixed Fruit' }
  },
  {
    name: 'Everyday Dairy Whitener 1kg',
    description: 'Rich and creamy milk powder for tea and coffee. Instant and convenient.',
    short_description: 'Milk powder - 1kg pack',
    sku: 'MILK-EVD-1KG',
    price: 385.00,
    compare_price: 420.00,
    stock_quantity: 80,
    category: 'groceries-staples',
    tags: ['milk-powder', 'everyday', 'dairy', 'instant'],
    attributes: { brand: 'Everyday', weight: '1kg', type: 'Milk Powder' }
  },
  {
    name: 'Ashirvaad Atta 10kg',
    description: 'Whole wheat flour made from 100% MP wheat. Perfect for making soft rotis and parathas.',
    short_description: 'Whole wheat flour - 10kg pack',
    sku: 'ATTA-ASH-10KG',
    price: 465.00,
    compare_price: 500.00,
    stock_quantity: 60,
    category: 'groceries-staples',
    featured: true,
    tags: ['atta', 'ashirvaad', 'wheat-flour', 'cooking'],
    attributes: { brand: 'Ashirvaad', weight: '10kg', type: 'Whole Wheat' }
  },
  {
    name: 'Fortune Soyabean Oil 1L',
    description: 'Pure soyabean oil rich in vitamins. Light and healthy for all cooking needs.',
    short_description: 'Pure soyabean oil - 1L bottle',
    sku: 'OIL-FOR-1L',
    price: 125.00,
    compare_price: 140.00,
    stock_quantity: 150,
    category: 'groceries-staples',
    tags: ['oil', 'fortune', 'soyabean', 'pure'],
    attributes: { brand: 'Fortune', volume: '1L', type: 'Soyabean Oil' }
  },
  {
    name: 'Surf Excel Easy Wash 2kg',
    description: 'Advanced detergent powder with powerful cleaning. Removes tough stains easily.',
    short_description: 'Detergent powder - 2kg pack',
    sku: 'DET-SUR-2KG',
    price: 285.00,
    compare_price: 320.00,
    stock_quantity: 100,
    category: 'groceries-staples',
    tags: ['detergent', 'surf-excel', 'washing', 'cleaning'],
    attributes: { brand: 'Surf Excel', weight: '2kg', type: 'Detergent Powder' }
  },
  {
    name: 'MTR Rava Idli Mix 500g',
    description: 'Instant idli mix made with premium quality rava. Just add water and steam.',
    short_description: 'Instant idli mix - 500g pack',
    sku: 'IDLI-MTR-500G',
    price: 85.00,
    compare_price: 95.00,
    stock_quantity: 120,
    category: 'groceries-staples',
    tags: ['idli-mix', 'mtr', 'instant', 'south-indian'],
    attributes: { brand: 'MTR', weight: '500g', type: 'Ready Mix' }
  },
  {
    name: 'Patanjali Honey 500g',
    description: 'Pure and natural honey with no added sugar. Rich in antioxidants and minerals.',
    short_description: 'Pure honey - 500g bottle',
    sku: 'HONEY-PAT-500G',
    price: 195.00,
    compare_price: 220.00,
    stock_quantity: 75,
    category: 'groceries-staples',
    tags: ['honey', 'patanjali', 'pure', 'natural'],
    attributes: { brand: 'Patanjali', weight: '500g', type: 'Pure Honey' }
  },

  // Personal Care (12 products)
  {
    name: 'Colgate Total Toothpaste 150g',
    description: 'Advanced toothpaste with 12-hour protection against germs. Fights bacteria and freshens breath.',
    short_description: '12-hour protection toothpaste - 150g',
    sku: 'TOOTH-COL-150G',
    price: 85.00,
    compare_price: 95.00,
    stock_quantity: 200,
    category: 'personal-care',
    featured: true,
    tags: ['toothpaste', 'colgate', 'dental-care', 'protection'],
    attributes: { brand: 'Colgate', size: '150g', benefit: '12hr Protection' }
  },
  {
    name: 'Dove Moisturizing Soap 125g',
    description: 'Gentle beauty bar with 1/4 moisturizing cream. Leaves skin soft and smooth.',
    short_description: 'Moisturizing beauty bar - 125g',
    sku: 'SOAP-DOV-125G',
    price: 65.00,
    compare_price: 75.00,
    stock_quantity: 250,
    category: 'personal-care',
    tags: ['soap', 'dove', 'moisturizing', 'beauty'],
    attributes: { brand: 'Dove', weight: '125g', type: 'Beauty Bar' }
  },
  {
    name: 'Head & Shoulders Shampoo 650ml',
    description: 'Anti-dandruff shampoo with zinc pyrithione. Provides up to 100% dandruff protection.',
    short_description: 'Anti-dandruff shampoo - 650ml',
    sku: 'SHAM-HNS-650ML',
    price: 285.00,
    compare_price: 320.00,
    stock_quantity: 100,
    category: 'personal-care',
    tags: ['shampoo', 'head-shoulders', 'anti-dandruff', 'hair-care'],
    attributes: { brand: 'Head & Shoulders', volume: '650ml', benefit: 'Anti-Dandruff' }
  },
  {
    name: 'Lakme Absolute Face Wash 100g',
    description: 'Deep pore cleanser with vitamin E. Removes dirt and oil for clear, glowing skin.',
    short_description: 'Deep pore cleanser - 100g tube',
    sku: 'FACE-LAK-100G',
    price: 175.00,
    compare_price: 200.00,
    stock_quantity: 80,
    category: 'personal-care',
    tags: ['face-wash', 'lakme', 'cleanser', 'skincare'],
    attributes: { brand: 'Lakme', size: '100g', benefit: 'Deep Cleansing' }
  },
  {
    name: 'Gillette Mach3 Razor',
    description: '3-blade razor with precision trimmer. Provides a comfortable and close shave.',
    short_description: '3-blade precision razor',
    sku: 'RAZOR-GIL-M3',
    price: 245.00,
    compare_price: 280.00,
    stock_quantity: 60,
    category: 'personal-care',
    tags: ['razor', 'gillette', 'mach3', 'shaving'],
    attributes: { brand: 'Gillette', blades: '3', type: 'Manual Razor' }
  },
  {
    name: 'Vaseline Petroleum Jelly 100ml',
    description: 'Pure petroleum jelly for dry skin protection. Multi-purpose healing jelly.',
    short_description: 'Petroleum jelly - 100ml jar',
    sku: 'JELLY-VAS-100ML',
    price: 85.00,
    compare_price: 95.00,
    stock_quantity: 150,
    category: 'personal-care',
    tags: ['petroleum-jelly', 'vaseline', 'moisturizer', 'healing'],
    attributes: { brand: 'Vaseline', volume: '100ml', type: 'Petroleum Jelly' }
  },
  {
    name: 'Dettol Antiseptic Liquid 550ml',
    description: 'Disinfectant liquid for cuts, wounds and personal hygiene. Kills 99.9% germs.',
    short_description: 'Antiseptic disinfectant - 550ml',
    sku: 'ANTI-DET-550ML',
    price: 145.00,
    compare_price: 165.00,
    stock_quantity: 90,
    category: 'personal-care',
    tags: ['antiseptic', 'dettol', 'disinfectant', 'hygiene'],
    attributes: { brand: 'Dettol', volume: '550ml', type: 'Antiseptic' }
  },
  {
    name: 'Nivea Soft Moisturizing Cream 200ml',
    description: 'Light moisturizing cream with jojoba oil and vitamin E. For face, hands and body.',
    short_description: 'Moisturizing cream - 200ml tube',
    sku: 'CREAM-NIV-200ML',
    price: 165.00,
    compare_price: 185.00,
    stock_quantity: 120,
    category: 'personal-care',
    tags: ['moisturizer', 'nivea', 'cream', 'vitamin-e'],
    attributes: { brand: 'Nivea', volume: '200ml', benefit: 'Moisturizing' }
  },
  {
    name: 'Oral-B Toothbrush Medium',
    description: 'Multi-action bristles reach deep between teeth. Curved bristles for better cleaning.',
    short_description: 'Multi-action toothbrush - Medium',
    sku: 'BRUSH-ORB-MED',
    price: 45.00,
    compare_price: 55.00,
    stock_quantity: 180,
    category: 'personal-care',
    tags: ['toothbrush', 'oral-b', 'medium', 'dental'],
    attributes: { brand: 'Oral-B', type: 'Medium', bristles: 'Multi-Action' }
  },
  {
    name: 'Johnson\'s Baby Powder 400g',
    description: 'Gentle baby powder with cornstarch. Keeps skin dry and comfortable all day.',
    short_description: 'Baby powder - 400g bottle',
    sku: 'POWDER-JNS-400G',
    price: 185.00,
    compare_price: 210.00,
    stock_quantity: 100,
    category: 'personal-care',
    tags: ['baby-powder', 'johnson', 'gentle', 'cornstarch'],
    attributes: { brand: 'Johnson\'s', weight: '400g', type: 'Baby Powder' }
  },
  {
    name: 'Himalaya Neem Face Wash 150ml',
    description: 'Purifying neem face wash for acne-prone skin. Deep cleanses and prevents pimples.',
    short_description: 'Neem purifying face wash - 150ml',
    sku: 'FACE-HIM-150ML',
    price: 95.00,
    compare_price: 110.00,
    stock_quantity: 140,
    category: 'personal-care',
    tags: ['face-wash', 'himalaya', 'neem', 'acne'],
    attributes: { brand: 'Himalaya', volume: '150ml', ingredient: 'Neem' }
  },
  {
    name: 'Pantene Hair Oil 300ml',
    description: 'Nourishing hair oil with pro-vitamins. Strengthens hair and reduces hair fall.',
    short_description: 'Nourishing hair oil - 300ml',
    sku: 'OIL-PAN-300ML',
    price: 125.00,
    compare_price: 140.00,
    stock_quantity: 85,
    category: 'personal-care',
    tags: ['hair-oil', 'pantene', 'nourishing', 'hair-fall'],
    attributes: { brand: 'Pantene', volume: '300ml', benefit: 'Hair Strengthening' }
  },

  // Home & Kitchen (10 products)
  {
    name: 'Prestige Pressure Cooker 5L',
    description: 'Aluminum pressure cooker with safety valve. Perfect for Indian cooking and saves time.',
    short_description: 'Aluminum pressure cooker - 5L capacity',
    sku: 'COOKER-PRE-5L',
    price: 1850.00,
    compare_price: 2100.00,
    stock_quantity: 25,
    category: 'home-kitchen',
    featured: true,
    tags: ['pressure-cooker', 'prestige', 'aluminum', 'cooking'],
    attributes: { brand: 'Prestige', capacity: '5L', material: 'Aluminum' }
  },
  {
    name: 'Hawkins Whistling Kettle 2L',
    description: 'Stainless steel whistling kettle for boiling water and making tea. Durable and efficient.',
    short_description: 'Stainless steel kettle - 2L',
    sku: 'KETTLE-HAW-2L',
    price: 685.00,
    compare_price: 750.00,
    stock_quantity: 40,
    category: 'home-kitchen',
    tags: ['kettle', 'hawkins', 'whistling', 'stainless-steel'],
    attributes: { brand: 'Hawkins', capacity: '2L', material: 'Stainless Steel' }
  },
  {
    name: 'Milton Casserole 2.5L',
    description: 'Insulated casserole for keeping food hot for hours. Double wall construction.',
    short_description: 'Insulated casserole - 2.5L',
    sku: 'CASE-MIL-2.5L',
    price: 1245.00,
    compare_price: 1400.00,
    stock_quantity: 30,
    category: 'home-kitchen',
    tags: ['casserole', 'milton', 'insulated', 'hot-food'],
    attributes: { brand: 'Milton', capacity: '2.5L', type: 'Insulated' }
  },
  {
    name: 'Cello Water Bottle 1L',
    description: 'BPA-free plastic water bottle with leak-proof cap. Easy to carry and clean.',
    short_description: 'Plastic water bottle - 1L',
    sku: 'BOTTLE-CEL-1L',
    price: 185.00,
    compare_price: 220.00,
    stock_quantity: 150,
    category: 'home-kitchen',
    tags: ['water-bottle', 'cello', 'bpa-free', 'leak-proof'],
    attributes: { brand: 'Cello', capacity: '1L', material: 'BPA-Free Plastic' }
  },
  {
    name: 'Butterfly Gas Stove 2 Burner',
    description: 'Stainless steel gas stove with brass burners. Even heat distribution and easy cleaning.',
    short_description: '2-burner gas stove - Stainless steel',
    sku: 'STOVE-BUT-2B',
    price: 2485.00,
    compare_price: 2800.00,
    stock_quantity: 15,
    category: 'home-kitchen',
    featured: true,
    tags: ['gas-stove', 'butterfly', '2-burner', 'stainless-steel'],
    attributes: { brand: 'Butterfly', burners: '2', material: 'Stainless Steel' }
  },
  {
    name: 'Philips Electric Kettle 1.5L',
    description: 'Electric kettle with automatic shut-off. Boils water quickly and safely.',
    short_description: 'Electric kettle - 1.5L capacity',
    sku: 'EKETTLE-PHI-1.5L',
    price: 1685.00,
    compare_price: 1900.00,
    stock_quantity: 20,
    category: 'home-kitchen',
    tags: ['electric-kettle', 'philips', 'automatic', 'quick-boil'],
    attributes: { brand: 'Philips', capacity: '1.5L', type: 'Electric' }
  },
  {
    name: 'Borosil Mixing Bowl Set',
    description: 'Set of 3 glass mixing bowls in different sizes. Microwave and dishwasher safe.',
    short_description: 'Glass mixing bowl set - 3 pieces',
    sku: 'BOWL-BOR-SET3',
    price: 845.00,
    compare_price: 950.00,
    stock_quantity: 35,
    category: 'home-kitchen',
    tags: ['mixing-bowls', 'borosil', 'glass', 'microwave-safe'],
    attributes: { brand: 'Borosil', pieces: '3', material: 'Borosilicate Glass' }
  },
  {
    name: 'Bajaj Mixer Grinder 750W',
    description: '3-jar mixer grinder with powerful motor. Perfect for grinding spices and making chutneys.',
    short_description: '750W mixer grinder - 3 jars',
    sku: 'MIXER-BAJ-750W',
    price: 3285.00,
    compare_price: 3600.00,
    stock_quantity: 12,
    category: 'home-kitchen',
    featured: true,
    tags: ['mixer-grinder', 'bajaj', '750w', '3-jar'],
    attributes: { brand: 'Bajaj', power: '750W', jars: '3' }
  },
  {
    name: 'Tupperware Container Set 4pc',
    description: 'Airtight food storage containers in 4 different sizes. Keeps food fresh longer.',
    short_description: 'Airtight containers - 4 piece set',
    sku: 'CONTAINER-TUP-4PC',
    price: 985.00,
    compare_price: 1150.00,
    stock_quantity: 45,
    category: 'home-kitchen',
    tags: ['containers', 'tupperware', 'airtight', 'food-storage'],
    attributes: { brand: 'Tupperware', pieces: '4', type: 'Airtight' }
  },
  {
    name: 'Godrej Aer Air Freshener 240ml',
    description: 'Long-lasting room freshener with cool surf blue fragrance. Eliminates odors.',
    short_description: 'Room air freshener - 240ml',
    sku: 'FRESH-GOD-240ML',
    price: 185.00,
    compare_price: 210.00,
    stock_quantity: 100,
    category: 'home-kitchen',
    tags: ['air-freshener', 'godrej', 'room-spray', 'fragrance'],
    attributes: { brand: 'Godrej', volume: '240ml', fragrance: 'Cool Surf Blue' }
  },

  // Electronics (8 products)
  {
    name: 'Mi Power Bank 10000mAh',
    description: 'High-capacity power bank with dual USB output. Fast charging technology and compact design.',
    short_description: '10000mAh power bank - Dual USB',
    sku: 'PBANK-MI-10K',
    price: 1485.00,
    compare_price: 1699.00,
    stock_quantity: 50,
    category: 'electronics',
    featured: true,
    tags: ['power-bank', 'mi', 'fast-charging', 'dual-usb'],
    attributes: { brand: 'Mi', capacity: '10000mAh', ports: 'Dual USB' }
  },
  {
    name: 'JBL Go 3 Bluetooth Speaker',
    description: 'Portable waterproof Bluetooth speaker with rich JBL Pro sound. 5-hour playtime.',
    short_description: 'Waterproof Bluetooth speaker',
    sku: 'SPEAKER-JBL-GO3',
    price: 2485.00,
    compare_price: 2799.00,
    stock_quantity: 25,
    category: 'electronics',
    featured: true,
    tags: ['bluetooth-speaker', 'jbl', 'waterproof', 'portable'],
    attributes: { brand: 'JBL', type: 'Bluetooth', waterproof: 'IP67' }
  },
  {
    name: 'Samsung 32GB Pendrive USB 3.0',
    description: 'High-speed USB 3.0 flash drive with metal casing. Fast data transfer and durable design.',
    short_description: '32GB USB 3.0 pendrive',
    sku: 'USB-SAM-32GB',
    price: 485.00,
    compare_price: 550.00,
    stock_quantity: 80,
    category: 'electronics',
    tags: ['pendrive', 'samsung', 'usb3', '32gb'],
    attributes: { brand: 'Samsung', capacity: '32GB', type: 'USB 3.0' }
  },
  {
    name: 'Boat Lightning Cable 1.5m',
    description: 'Fast charging lightning cable for iPhone. Durable braided design with aluminum connectors.',
    short_description: 'Lightning charging cable - 1.5m',
    sku: 'CABLE-BOAT-LIGHT',
    price: 685.00,
    compare_price: 799.00,
    stock_quantity: 60,
    category: 'electronics',
    tags: ['lightning-cable', 'boat', 'fast-charging', 'braided'],
    attributes: { brand: 'Boat', length: '1.5m', type: 'Lightning' }
  },
  {
    name: 'Realme Buds Q2 TWS Earbuds',
    description: 'True wireless stereo earbuds with 20-hour playback. Bass boost and touch controls.',
    short_description: 'TWS earbuds - 20hr playback',
    sku: 'EARBUDS-RLM-Q2',
    price: 2485.00,
    compare_price: 2799.00,
    stock_quantity: 35,
    category: 'electronics',
    featured: true,
    tags: ['tws-earbuds', 'realme', 'wireless', 'bass-boost'],
    attributes: { brand: 'Realme', playback: '20 hours', type: 'TWS' }
  },
  {
    name: 'Ambrane Fast Charger 18W',
    description: 'Quick charge 3.0 wall charger with Type-C cable. Fast and safe charging for smartphones.',
    short_description: '18W fast charger with cable',
    sku: 'CHARGER-AMB-18W',
    price: 485.00,
    compare_price: 599.00,
    stock_quantity: 75,
    category: 'electronics',
    tags: ['fast-charger', 'ambrane', '18w', 'type-c'],
    attributes: { brand: 'Ambrane', power: '18W', cable: 'Type-C included' }
  },
  {
    name: 'Portronics Wireless Mouse',
    description: '2.4GHz wireless optical mouse with USB receiver. Ergonomic design and precise tracking.',
    short_description: 'Wireless optical mouse',
    sku: 'MOUSE-PORT-WL',
    price: 485.00,
    compare_price: 599.00,
    stock_quantity: 90,
    category: 'electronics',
    tags: ['wireless-mouse', 'portronics', 'optical', 'ergonomic'],
    attributes: { brand: 'Portronics', type: 'Wireless 2.4GHz', tracking: 'Optical' }
  },
  {
    name: 'HP 16GB DDR4 RAM 2666MHz',
    description: 'DDR4 laptop memory module for faster performance. Compatible with most laptops.',
    short_description: '16GB DDR4 laptop RAM',
    sku: 'RAM-HP-16GB',
    price: 4485.00,
    compare_price: 4999.00,
    stock_quantity: 20,
    category: 'electronics',
    tags: ['ram', 'hp', 'ddr4', '16gb'],
    attributes: { brand: 'HP', capacity: '16GB', type: 'DDR4-2666MHz' }
  },

  // Fashion (8 products)
  {
    name: 'Peter England Cotton Shirt',
    description: 'Formal cotton shirt with regular fit. Perfect for office wear and formal occasions.',
    short_description: 'Formal cotton shirt - Regular fit',
    sku: 'SHIRT-PE-COT-REG',
    price: 1285.00,
    compare_price: 1599.00,
    stock_quantity: 40,
    category: 'fashion',
    tags: ['shirt', 'peter-england', 'cotton', 'formal'],
    attributes: { brand: 'Peter England', material: 'Cotton', fit: 'Regular' }
  },
  {
    name: 'Levi\'s Jeans 511 Slim Fit',
    description: 'Slim fit denim jeans with classic 5-pocket styling. Made from premium stretch denim.',
    short_description: 'Slim fit denim jeans',
    sku: 'JEANS-LEV-511-SLIM',
    price: 2485.00,
    compare_price: 2999.00,
    stock_quantity: 25,
    category: 'fashion',
    featured: true,
    tags: ['jeans', 'levis', 'denim', 'slim-fit'],
    attributes: { brand: 'Levi\'s', fit: 'Slim', style: '511' }
  },
  {
    name: 'Nike Air Max Sneakers',
    description: 'Comfortable running shoes with air cushioning. Breathable mesh upper and durable sole.',
    short_description: 'Air cushioned sneakers',
    sku: 'SHOES-NIKE-AIRMAX',
    price: 6485.00,
    compare_price: 7995.00,
    stock_quantity: 15,
    category: 'fashion',
    featured: true,
    tags: ['sneakers', 'nike', 'air-max', 'running'],
    attributes: { brand: 'Nike', type: 'Running Shoes', technology: 'Air Max' }
  },
  {
    name: 'Titan Steel Watch for Men',
    description: 'Stainless steel analog watch with water resistance. Elegant design for everyday wear.',
    short_description: 'Stainless steel analog watch',
    sku: 'WATCH-TIT-STEEL',
    price: 3485.00,
    compare_price: 3999.00,
    stock_quantity: 20,
    category: 'fashion',
    tags: ['watch', 'titan', 'steel', 'analog'],
    attributes: { brand: 'Titan', material: 'Stainless Steel', type: 'Analog' }
  },
  {
    name: 'Woodland Leather Wallet',
    description: 'Genuine leather bi-fold wallet with multiple card slots. RFID blocking technology.',
    short_description: 'Leather bi-fold wallet - RFID block',
    sku: 'WALLET-WOOD-LEATHER',
    price: 1485.00,
    compare_price: 1799.00,
    stock_quantity: 60,
    category: 'fashion',
    tags: ['wallet', 'woodland', 'leather', 'rfid'],
    attributes: { brand: 'Woodland', material: 'Genuine Leather', feature: 'RFID Blocking' }
  },
  {
    name: 'Allen Solly Cotton T-Shirt',
    description: 'Casual cotton t-shirt with crew neck. Soft fabric and comfortable fit for everyday wear.',
    short_description: 'Cotton crew neck t-shirt',
    sku: 'TSHIRT-AS-COTTON',
    price: 685.00,
    compare_price: 799.00,
    stock_quantity: 80,
    category: 'fashion',
    tags: ['t-shirt', 'allen-solly', 'cotton', 'casual'],
    attributes: { brand: 'Allen Solly', material: '100% Cotton', neck: 'Crew Neck' }
  },
  {
    name: 'VIP Suitcase 65cm',
    description: 'Hard-shell luggage with 360° wheels. TSA lock and spacious interior for travel.',
    short_description: 'Hard-shell suitcase - 65cm',
    sku: 'LUGGAGE-VIP-65CM',
    price: 4485.00,
    compare_price: 5499.00,
    stock_quantity: 12,
    category: 'fashion',
    tags: ['suitcase', 'vip', 'hard-shell', 'travel'],
    attributes: { brand: 'VIP', size: '65cm', type: 'Hard Shell', wheels: '360°' }
  },
  {
    name: 'Fastrack Sunglasses UV Protection',
    description: 'Stylish sunglasses with 100% UV protection. Lightweight frame and polarized lenses.',
    short_description: 'UV protection sunglasses',
    sku: 'SUNGLASS-FAST-UV',
    price: 1285.00,
    compare_price: 1599.00,
    stock_quantity: 45,
    category: 'fashion',
    tags: ['sunglasses', 'fastrack', 'uv-protection', 'polarized'],
    attributes: { brand: 'Fastrack', protection: '100% UV', lens: 'Polarized' }
  },

  // Health & Wellness (5 products)
  {
    name: 'Himalaya Ashwagandha Tablets 60s',
    description: 'Natural stress relief supplement with pure ashwagandha extract. Boosts energy and immunity.',
    short_description: 'Ashwagandha tablets - 60 count',
    sku: 'ASHWA-HIM-60T',
    price: 285.00,
    compare_price: 320.00,
    stock_quantity: 100,
    category: 'health-wellness',
    featured: true,
    tags: ['ashwagandha', 'himalaya', 'stress-relief', 'immunity'],
    attributes: { brand: 'Himalaya', count: '60 tablets', ingredient: 'Ashwagandha' }
  },
  {
    name: 'Revital H Multivitamin 60 Caps',
    description: 'Complete multivitamin with minerals and ginseng. Daily health supplement for men and women.',
    short_description: 'Multivitamin capsules - 60 count',
    sku: 'MULTI-REV-60C',
    price: 485.00,
    compare_price: 550.00,
    stock_quantity: 75,
    category: 'health-wellness',
    tags: ['multivitamin', 'revital', 'ginseng', 'health'],
    attributes: { brand: 'Revital', count: '60 capsules', type: 'Multivitamin' }
  },
  {
    name: 'Dabur Chyawanprash 1kg',
    description: 'Traditional Ayurvedic immunity booster with 40+ herbs. Builds natural immunity and strength.',
    short_description: 'Ayurvedic immunity booster - 1kg',
    sku: 'CHYAWAN-DAB-1KG',
    price: 385.00,
    compare_price: 425.00,
    stock_quantity: 60,
    category: 'health-wellness',
    tags: ['chyawanprash', 'dabur', 'immunity', 'ayurvedic'],
    attributes: { brand: 'Dabur', weight: '1kg', type: 'Ayurvedic' }
  },
  {
    name: 'Ensure Nutrition Powder Vanilla 400g',
    description: 'Complete balanced nutrition with 32 nutrients. High protein for strength and energy.',
    short_description: 'Nutrition powder - Vanilla 400g',
    sku: 'ENSURE-VAN-400G',
    price: 685.00,
    compare_price: 750.00,
    stock_quantity: 40,
    category: 'health-wellness',
    tags: ['nutrition', 'ensure', 'protein', 'vanilla'],
    attributes: { brand: 'Ensure', flavor: 'Vanilla', weight: '400g' }
  },
  {
    name: 'Baidyanath Triphala Churna 100g',
    description: 'Natural digestive supplement with three fruits. Helps in digestion and detoxification.',
    short_description: 'Triphala powder - 100g pack',
    sku: 'TRIPH-BAID-100G',
    price: 125.00,
    compare_price: 145.00,
    stock_quantity: 90,
    category: 'health-wellness',
    tags: ['triphala', 'baidyanath', 'digestive', 'ayurvedic'],
    attributes: { brand: 'Baidyanath', weight: '100g', type: 'Churna' }
  },

  // Books & Stationery (5 products)
  {
    name: 'Classmate Notebook 300 Pages',
    description: 'Single line notebook with quality paper. Perfect for students and office use.',
    short_description: 'Single line notebook - 300 pages',
    sku: 'NOTE-CLASS-300P',
    price: 85.00,
    compare_price: 95.00,
    stock_quantity: 200,
    category: 'books-stationery',
    tags: ['notebook', 'classmate', 'single-line', 'student'],
    attributes: { brand: 'Classmate', pages: '300', type: 'Single Line' }
  },
  {
    name: 'Parker Jotter Ballpoint Pen',
    description: 'Classic ballpoint pen with smooth writing experience. Durable stainless steel construction.',
    short_description: 'Ballpoint pen - Stainless steel',
    sku: 'PEN-PARK-JOTTER',
    price: 485.00,
    compare_price: 550.00,
    stock_quantity: 150,
    category: 'books-stationery',
    tags: ['pen', 'parker', 'ballpoint', 'steel'],
    attributes: { brand: 'Parker', type: 'Ballpoint', material: 'Stainless Steel' }
  },
  {
    name: 'Apsara Platinum Pencil Box',
    description: 'Set of 10 HB pencils in a convenient box. High-quality graphite for smooth writing.',
    short_description: 'HB pencils - Box of 10',
    sku: 'PENCIL-APS-10BOX',
    price: 85.00,
    compare_price: 100.00,
    stock_quantity: 120,
    category: 'books-stationery',
    tags: ['pencils', 'apsara', 'hb', 'graphite'],
    attributes: { brand: 'Apsara', count: '10 pencils', grade: 'HB' }
  },
  {
    name: 'Fevicol Stick Glue 40g',
    description: 'Non-toxic glue stick for paper and cardboard. Clean application and strong bonding.',
    short_description: 'Non-toxic glue stick - 40g',
    sku: 'GLUE-FEVI-40G',
    price: 45.00,
    compare_price: 55.00,
    stock_quantity: 180,
    category: 'books-stationery',
    tags: ['glue-stick', 'fevicol', 'non-toxic', 'adhesive'],
    attributes: { brand: 'Fevicol', weight: '40g', type: 'Stick Glue' }
  },
  {
    name: 'Staedtler Eraser & Sharpener Set',
    description: 'High-quality eraser and pencil sharpener combo. Long-lasting and efficient.',
    short_description: 'Eraser & sharpener combo set',
    sku: 'COMBO-STED-ES',
    price: 65.00,
    compare_price: 75.00,
    stock_quantity: 160,
    category: 'books-stationery',
    tags: ['eraser', 'sharpener', 'staedtler', 'combo'],
    attributes: { brand: 'Staedtler', items: 'Eraser + Sharpener', type: 'Combo Set' }
  },

  // Sports & Fitness (5 products)
  {
    name: 'Cosco Cricket Bat Kashmir Willow',
    description: 'Professional cricket bat made from premium Kashmir willow. Perfect weight balance.',
    short_description: 'Kashmir willow cricket bat',
    sku: 'BAT-COSCO-KW',
    price: 1485.00,
    compare_price: 1699.00,
    stock_quantity: 25,
    category: 'sports-fitness',
    featured: true,
    tags: ['cricket-bat', 'cosco', 'kashmir-willow', 'sports'],
    attributes: { brand: 'Cosco', material: 'Kashmir Willow', sport: 'Cricket' }
  },
  {
    name: 'Nivia Basketball Size 7',
    description: 'Official size basketball with excellent grip and bounce. Suitable for outdoor courts.',
    short_description: 'Official basketball - Size 7',
    sku: 'BALL-NIVIA-BB7',
    price: 685.00,
    compare_price: 799.00,
    stock_quantity: 40,
    category: 'sports-fitness',
    tags: ['basketball', 'nivia', 'size-7', 'outdoor'],
    attributes: { brand: 'Nivia', size: '7', type: 'Basketball' }
  },
  {
    name: 'Yonex Badminton Racket',
    description: 'Lightweight aluminum badminton racket with pre-strung strings. Good for beginners.',
    short_description: 'Aluminum badminton racket',
    sku: 'RACKET-YON-ALU',
    price: 1285.00,
    compare_price: 1499.00,
    stock_quantity: 30,
    category: 'sports-fitness',
    tags: ['badminton-racket', 'yonex', 'aluminum', 'pre-strung'],
    attributes: { brand: 'Yonex', material: 'Aluminum', sport: 'Badminton' }
  },
  {
    name: 'Domyos Yoga Mat 6mm',
    description: 'Anti-slip yoga mat with 6mm thickness. Comfortable cushioning for all yoga poses.',
    short_description: 'Anti-slip yoga mat - 6mm thick',
    sku: 'YOGAMAT-DOM-6MM',
    price: 485.00,
    compare_price: 599.00,
    stock_quantity: 60,
    category: 'sports-fitness',
    tags: ['yoga-mat', 'domyos', 'anti-slip', '6mm'],
    attributes: { brand: 'Domyos', thickness: '6mm', type: 'Yoga Mat' }
  },
  {
    name: 'Adidas Football Size 5',
    description: 'Official size football with machine-stitched panels. Durable and weather-resistant.',
    short_description: 'Machine-stitched football - Size 5',
    sku: 'FOOTBALL-ADI-5',
    price: 885.00,
    compare_price: 999.00,
    stock_quantity: 35,
    category: 'sports-fitness',
    tags: ['football', 'adidas', 'size-5', 'machine-stitched'],
    attributes: { brand: 'Adidas', size: '5', type: 'Football' }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Skip sync since tables already exist
    console.log('✅ Using existing database structure');

    // Check if admin user exists
    let adminUser = await User.findOne({ where: { email: 'admin@shopping.com' } });
    
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@shopping.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        email_verified: true
      });
      console.log('✅ Admin user created');
    }

    // Create categories
    console.log('📂 Creating categories...');
    const categoryMap = {};
    
    for (const catData of categories) {
      let category = await Category.findOne({ where: { slug: catData.slug } });
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          status: 'active',
          sort_order: categories.indexOf(catData)
        });
        console.log(`✅ Created category: ${catData.name}`);
      }
      categoryMap[catData.slug] = category.id;
    }

    // Create products
    console.log('🛍️ Creating products...');
    let createdCount = 0;
    
    for (const productData of products) {
      const existingProduct = await Product.findOne({ where: { sku: productData.sku } });
      
      if (!existingProduct) {
        await Product.create({
          name: productData.name,
          description: productData.description,
          short_description: productData.short_description,
          sku: productData.sku,
          category_id: categoryMap[productData.category],
          price: productData.price,
          compare_price: productData.compare_price,
          stock_quantity: productData.stock_quantity,
          low_stock_threshold: 10,
          track_quantity: true,
          status: 'active',
          visibility: 'visible',
          product_type: 'simple',
          featured: productData.featured || false,
          tags: productData.tags,
          attributes: productData.attributes,
          created_by: adminUser.id,
          views_count: Math.floor(Math.random() * 100),
          sales_count: Math.floor(Math.random() * 50),
          rating_average: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          rating_count: Math.floor(Math.random() * 20) + 1
        });
        createdCount++;
        
        if (createdCount % 10 === 0) {
          console.log(`✅ Created ${createdCount} products...`);
        }
      }
    }

    // Update category product counts
    console.log('🔢 Updating category product counts...');
    for (const [slug, categoryId] of Object.entries(categoryMap)) {
      const productCount = await Product.count({ where: { category_id: categoryId } });
      await Category.update({ product_count: productCount }, { where: { id: categoryId } });
    }

    console.log(`🎉 Database seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${createdCount} new products created`);
    console.log(`   - Total products in database: ${await Product.count()}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };