const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// File paths
const FILES = {
  products: path.join(DATA_DIR, 'products.json'),
  users: path.join(DATA_DIR, 'users.json'),
  administrators: path.join(DATA_DIR, 'administrators.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  brands: path.join(DATA_DIR, 'brands.json'),
  sales: path.join(DATA_DIR, 'sales.json'),
  purchases: path.join(DATA_DIR, 'purchases.json'),
  returns: path.join(DATA_DIR, 'returns.json')
};

// Initialize default data files
const initializeFiles = async () => {
  // Initialize products.json with default products
  if (!await fs.pathExists(FILES.products)) {
    const defaultProducts = [
      {
        id: 'IT2025-RTR001',
        name: 'TP-Link Archer C6 AC1200 Wireless Router',
        brand: 'TP-Link',
        supplier: 'TP-Link Bangladesh',
        addedDate: '2024-01-15',
        pricePerUnit: 3500,
        stock: 25,
        unit: 'piece',
        category: 'Networking',
        rating: 4.7,
        image: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'High-speed dual-band wireless router with 4 Gigabit LAN ports and advanced security features.',
        specifications: {
          'Wireless Standard': '802.11ac',
          'Speed': '1200 Mbps',
          'Frequency': '2.4GHz + 5GHz',
          'Antennas': '4 External',
          'Ports': '4 x Gigabit LAN'
        }
      },
      {
        id: 'IT2025-SSD001',
        name: 'WD Blue 500GB SATA SSD',
        brand: 'Western Digital',
        supplier: 'WD Bangladesh',
        addedDate: '2024-01-20',
        pricePerUnit: 4200,
        stock: 40,
        unit: 'piece',
        category: 'Storage',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Fast and reliable 500GB SATA SSD for improved system performance and faster boot times.',
        specifications: {
          'Capacity': '500GB',
          'Interface': 'SATA 6Gb/s',
          'Read Speed': '560 MB/s',
          'Write Speed': '530 MB/s',
          'Form Factor': '2.5 inch'
        }
      }
    ];
    await fs.writeJSON(FILES.products, defaultProducts, { spaces: 2 });
  }

  // Initialize administrators.json
  if (!await fs.pathExists(FILES.administrators)) {
    const defaultAdmins = [
      {
        id: 'admin-001',
        email: 'admin@friendsitzone.com',
        password: 'admin123',
        role: 'admin',
        points: 0,
        purchaseHistory: [],
        name: 'System Administrator'
      }
    ];
    await fs.writeJSON(FILES.administrators, defaultAdmins, { spaces: 2 });
  }

  // Initialize users.json
  if (!await fs.pathExists(FILES.users)) {
    await fs.writeJSON(FILES.users, [], { spaces: 2 });
  }

  // Initialize categories.json
  if (!await fs.pathExists(FILES.categories)) {
    const defaultCategories = [
      {
        id: 'cat-001',
        name: 'Networking',
        description: 'Network equipment and accessories',
        createdDate: '2024-01-01'
      },
      {
        id: 'cat-002',
        name: 'Storage',
        description: 'Storage devices and solutions',
        createdDate: '2024-01-01'
      },
      {
        id: 'cat-003',
        name: 'Computing',
        description: 'Computers and related hardware',
        createdDate: '2024-01-01'
      }
    ];
    await fs.writeJSON(FILES.categories, defaultCategories, { spaces: 2 });
  }

  // Initialize brands.json
  if (!await fs.pathExists(FILES.brands)) {
    const defaultBrands = [
      {
        id: 'brand-001',
        name: 'TP-Link',
        description: 'Leading networking equipment manufacturer',
        createdDate: '2024-01-01'
      },
      {
        id: 'brand-002',
        name: 'Western Digital',
        description: 'Reliable storage solutions provider',
        createdDate: '2024-01-01'
      },
      {
        id: 'brand-003',
        name: 'Samsung',
        description: 'Premium electronics and storage manufacturer',
        createdDate: '2024-01-01'
      }
    ];
    await fs.writeJSON(FILES.brands, defaultBrands, { spaces: 2 });
  }

  // Initialize other files
  const emptyArrayFiles = ['sales', 'purchases', 'returns'];
  for (const file of emptyArrayFiles) {
    if (!await fs.pathExists(FILES[file])) {
      await fs.writeJSON(FILES[file], [], { spaces: 2 });
    }
  }
};

// Helper functions
const readJsonFile = async (filePath) => {
  try {
    return await fs.readJSON(filePath);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeJSON(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Products API
app.get('/api/products', async (req, res) => {
  const products = await readJsonFile(FILES.products);
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const products = await readJsonFile(FILES.products);
  const newProduct = { ...req.body, id: `IT2025-${Date.now()}` };
  products.push(newProduct);
  
  if (await writeJsonFile(FILES.products, products)) {
    res.json({ success: true, product: newProduct });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const products = await readJsonFile(FILES.products);
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    if (await writeJsonFile(FILES.products, products)) {
      res.json({ success: true, product: products[index] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  } else {
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const products = await readJsonFile(FILES.products);
  const filteredProducts = products.filter(p => p.id !== req.params.id);
  
  if (await writeJsonFile(FILES.products, filteredProducts)) {
    res.json({ success: true, message: 'Product deleted successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  const categories = await readJsonFile(FILES.categories);
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const categories = await readJsonFile(FILES.categories);
  const newCategory = { ...req.body, id: `cat-${Date.now()}` };
  categories.push(newCategory);
  
  if (await writeJsonFile(FILES.categories, categories)) {
    res.json({ success: true, category: newCategory });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const categories = await readJsonFile(FILES.categories);
  const filteredCategories = categories.filter(c => c.id !== req.params.id);
  
  if (await writeJsonFile(FILES.categories, filteredCategories)) {
    res.json({ success: true, message: 'Category deleted successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// Brands API
app.get('/api/brands', async (req, res) => {
  const brands = await readJsonFile(FILES.brands);
  res.json(brands);
});

app.post('/api/brands', async (req, res) => {
  const brands = await readJsonFile(FILES.brands);
  const newBrand = { ...req.body, id: `brand-${Date.now()}` };
  brands.push(newBrand);
  
  if (await writeJsonFile(FILES.brands, brands)) {
    res.json({ success: true, brand: newBrand });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save brand' });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  const brands = await readJsonFile(FILES.brands);
  const index = brands.findIndex(b => b.id === req.params.id);
  
  if (index !== -1) {
    brands[index] = { ...brands[index], ...req.body };
    if (await writeJsonFile(FILES.brands, brands)) {
      res.json({ success: true, brand: brands[index] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update brand' });
    }
  } else {
    res.status(404).json({ success: false, message: 'Brand not found' });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  const brands = await readJsonFile(FILES.brands);
  const filteredBrands = brands.filter(b => b.id !== req.params.id);
  
  if (await writeJsonFile(FILES.brands, filteredBrands)) {
    res.json({ success: true, message: 'Brand deleted successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete brand' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  const newUser = { ...req.body, id: `user-${Date.now()}` };
  users.push(newUser);
  
  if (await writeJsonFile(FILES.users, users)) {
    res.json({ success: true, user: newUser });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  const filteredUsers = users.filter(u => u.id !== req.params.id);
  
  if (await writeJsonFile(FILES.users, filteredUsers)) {
    res.json({ success: true, message: 'User deleted successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Administrators API
app.get('/api/administrators', async (req, res) => {
  const administrators = await readJsonFile(FILES.administrators);
  res.json(administrators);
});

app.post('/api/administrators', async (req, res) => {
  const administrators = await readJsonFile(FILES.administrators);
  const newAdmin = { ...req.body, id: `admin-${Date.now()}` };
  administrators.push(newAdmin);
  
  if (await writeJsonFile(FILES.administrators, administrators)) {
    res.json({ success: true, administrator: newAdmin });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save administrator' });
  }
});

// Sales API
app.get('/api/sales', async (req, res) => {
  const sales = await readJsonFile(FILES.sales);
  res.json(sales);
});

app.post('/api/sales', async (req, res) => {
  const sales = await readJsonFile(FILES.sales);
  const newSale = { ...req.body, id: `sale-${Date.now()}` };
  sales.push(newSale);
  
  if (await writeJsonFile(FILES.sales, sales)) {
    res.json({ success: true, sale: newSale });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save sale' });
  }
});

// Warranty Search API
app.get('/api/warranty/search', async (req, res) => {
  try {
    const { type, value, page = 1, limit = 10 } = req.query;
    const sales = await readJsonFile(FILES.sales);
    
    let filteredSales = [];
    
    switch (type) {
      case 'productId':
        // Search by product ID (existing functionality)
        filteredSales = sales.filter(sale => 
          sale.productID === value || 
          sale.productId === value ||
          sale.commonId === value ||
          sale.uniqueId === value
        );
        break;
        
      case 'customerId':
        // Search by customer ID
        filteredSales = sales.filter(sale => 
          sale.customerId === value || 
          sale.userId === value
        );
        break;
        
      case 'mobileNumber':
        // Search by customer mobile number
        filteredSales = sales.filter(sale => 
          sale.customerMobile === value ||
          sale.customer?.mobile === value ||
          sale.customerDetails?.mobile === value
        );
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid search type. Use: productId, customerId, or mobileNumber' 
        });
    }
    
    // Calculate pagination
    const totalItems = filteredSales.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSales = filteredSales.slice(startIndex, endIndex);
    
    // Transform sales to warranty format
    const warrantyResults = paginatedSales.map(sale => ({
      productName: sale.productName,
      commonId: sale.commonId,
      uniqueId: sale.uniqueId,
      quantity: sale.quantitySold || sale.quantity,
      purchaseDate: sale.dateOfSale || sale.timestamp,
      warrantyStartDate: sale.dateOfSale || sale.timestamp,
      warrantyEndDate: sale.warrantyEndDate,
      salePrice: sale.totalPrice,
      customerId: sale.customerId || sale.userId,
      customerEmail: sale.customerEmail || sale.userEmail,
      customerMobile: sale.customerMobile || sale.customer?.mobile,
      customerAddress: sale.customerAddress,
      saleId: sale.saleId || sale.id,
      currency: sale.currency || 'BDT',
      unit: sale.unit
    }));
    
    res.json({
      success: true,
      data: warrantyResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Warranty search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching warranty information' 
    });
  }
});

// Get warranty details by sale ID
app.get('/api/warranty/:saleId', async (req, res) => {
  try {
    const { saleId } = req.params;
    const sales = await readJsonFile(FILES.sales);
    
    const sale = sales.find(s => 
      s.saleId === saleId || 
      s.id === saleId
    );
    
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Warranty information not found' 
      });
    }
    
    const warrantyInfo = {
      productName: sale.productName,
      commonId: sale.commonId,
      uniqueId: sale.uniqueId,
      quantity: sale.quantitySold || sale.quantity,
      purchaseDate: sale.dateOfSale || sale.timestamp,
      warrantyStartDate: sale.dateOfSale || sale.timestamp,
      warrantyEndDate: sale.warrantyEndDate,
      salePrice: sale.totalPrice,
      customerId: sale.customerId || sale.userId,
      customerEmail: sale.customerEmail || sale.userEmail,
      customerMobile: sale.customerMobile,
      customerAddress: sale.customerAddress,
      saleId: sale.saleId || sale.id,
      currency: sale.currency || 'BDT',
      unit: sale.unit,
      warrantyStatus: sale.warrantyEndDate ? 
        (new Date(sale.warrantyEndDate) > new Date() ? 'Active' : 'Expired') : 
        'Unknown'
    };
    
    res.json({
      success: true,
      data: warrantyInfo
    });
    
  } catch (error) {
    console.error('Warranty details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving warranty details' 
    });
  }
});

// Purchases API
app.get('/api/purchases', async (req, res) => {
  const purchases = await readJsonFile(FILES.purchases);
  res.json(purchases);
});

app.post('/api/purchases', async (req, res) => {
  const purchases = await readJsonFile(FILES.purchases);
  const newPurchase = { ...req.body, id: `purchase-${Date.now()}` };
  purchases.push(newPurchase);
  
  if (await writeJsonFile(FILES.purchases, purchases)) {
    res.json({ success: true, purchase: newPurchase });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save purchase' });
  }
});

// Returns API
app.get('/api/returns', async (req, res) => {
  const returns = await readJsonFile(FILES.returns);
  res.json(returns);
});

app.post('/api/returns', async (req, res) => {
  const returns = await readJsonFile(FILES.returns);
  const newReturn = { ...req.body, id: `return-${Date.now()}` };
  returns.push(newReturn);
  
  if (await writeJsonFile(FILES.returns, returns)) {
    res.json({ success: true, return: newReturn });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save return' });
  }
});

// Authentication API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Check administrators first
  const administrators = await readJsonFile(FILES.administrators);
  const admin = administrators.find(a => a.email === email && a.password === password);
  if (admin) {
    res.json({ success: true, user: admin });
    return;
  }
  
  // Check users
  const users = await readJsonFile(FILES.users);
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, user });
    return;
  }
  
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Initialize files and start server
initializeFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Friends IT Zone Backend Server running on port ${PORT}`);
    console.log(`Data will be stored in: ${DATA_DIR}`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
});
