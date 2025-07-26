const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'data')));

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
  returns: path.join(DATA_DIR, 'returns.json'),
  warranties: path.join(DATA_DIR, 'warranty-approvals.json')
};

// POST categories (overwrite with new data)
app.post('/api/categories', async (req, res) => {
  const newCategories = req.body;
  try {
    await fs.writeFile(FILES.categories, JSON.stringify(newCategories, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save categories.' });
  }
});

// Ensure sales and warranty subdirectories exist
const SALES_DIR = path.join(DATA_DIR, 'sales');
const WARRANTY_DIR = path.join(DATA_DIR, 'warranty');
fs.ensureDirSync(SALES_DIR);
fs.ensureDirSync(WARRANTY_DIR);

// Initialize default data files
const initializeFiles = async () => {
  // Initialize products.json with default products
  // if (!await fs.pathExists(FILES.products)) {
  //   const defaultProducts = [
  //     {
  //       id: 'IT2025-RTR001',
  //       name: 'TP-Link Archer C6 AC1200 Wireless Router',
  //       brand: 'TP-Link',
  //       supplier: 'TP-Link Bangladesh',
  //       addedDate: '2024-01-15',
  //       pricePerUnit: 3500,
  //       stock: 25,
  //       unit: 'piece',
  //       category: 'Networking',
  //       rating: 4.7,
  //       image: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=400',
  //       description: 'High-speed dual-band wireless router with 4 Gigabit LAN ports and advanced security features.',
  //       specifications: {
  //         'Wireless Standard': '802.11ac',
  //         'Speed': '1200 Mbps',
  //         'Frequency': '2.4GHz + 5GHz',
  //         'Antennas': '4 External',
  //         'Ports': '4 x Gigabit LAN'
  //       }
  //     },
  //     {
  //       id: 'IT2025-SSD001',
  //       name: 'WD Blue 500GB SATA SSD',
  //       brand: 'Western Digital',
  //       supplier: 'WD Bangladesh',
  //       addedDate: '2024-01-20',
  //       pricePerUnit: 4200,
  //       stock: 40,
  //       unit: 'piece',
  //       category: 'Storage',
  //       rating: 4.8,
  //       image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
  //       description: 'Fast and reliable 500GB SATA SSD for improved system performance and faster boot times.',
  //       specifications: {
  //         'Capacity': '500GB',
  //         'Interface': 'SATA 6Gb/s',
  //         'Read Speed': '560 MB/s',
  //         'Write Speed': '530 MB/s',
  //         'Form Factor': '2.5 inch'
  //       }
  //     }
  //   ];
  //   await fs.writeJSON(FILES.products, defaultProducts, { spaces: 2 });
  // }

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
  // Ensure subcategory and model fields are always present
  const newProduct = {
    ...req.body,
    id: `IT2025-${Date.now()}`,
    subcategory: req.body.subcategory || '',
    model: req.body.model || ''
  };
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
    // Ensure subcategory and model fields are always present
    products[index] = {
      ...products[index],
      ...req.body,
      subcategory: req.body.subcategory || products[index].subcategory || '',
      model: req.body.model || products[index].model || ''
    };
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

// Users API
app.get('/api/users', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  const { email, name } = req.body;
  // Prevent duplicate by email or name
  if (users.some(u => u.email === email || u.name === name)) {
    return res.status(400).json({ success: false, message: 'User with this email or name already exists.' });
  }
  const newUser = { ...req.body, id: `user-${Date.now()}` };
  users.push(newUser);
  if (await writeJsonFile(FILES.users, users)) {
    res.json({ success: true, user: newUser, message: '✅ User added successfully' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save user' });
  }
});

// Update user details
app.put('/api/users/:id', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  // Prevent duplicate email or name (except for the user being updated)
  const { email, name } = req.body;
  if (users.some((u, i) => i !== index && (u.email === email || u.name === name))) {
    return res.status(400).json({ success: false, message: 'User with this email or name already exists.' });
  }
  // Update fields
  users[index] = { ...users[index], ...req.body };
  if (await writeJsonFile(FILES.users, users)) {
    res.json({ success: true, user: users[index], message: '🔄 User updated' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const users = await readJsonFile(FILES.users);
  const filteredUsers = users.filter(u => u.id !== req.params.id);
  if (await writeJsonFile(FILES.users, filteredUsers)) {
    res.json({ success: true, message: '🗑️ User deleted' });
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

// Update admin details
app.put('/api/administrators/:id', async (req, res) => {
  const administrators = await readJsonFile(FILES.administrators);
  const index = administrators.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  // Prevent duplicate email or name (except for the admin being updated)
  const { email, name } = req.body;
  if (administrators.some((a, i) => i !== index && (a.email === email || a.name === name))) {
    return res.status(400).json({ success: false, message: 'Admin with this email or name already exists.' });
  }
  administrators[index] = { ...administrators[index], ...req.body };
  if (await writeJsonFile(FILES.administrators, administrators)) {
    res.json({ success: true, admin: administrators[index], message: '🔄 Admin details updated.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update admin' });
  }
});

// Delete admin
app.delete('/api/administrators/:id', async (req, res) => {
  const administrators = await readJsonFile(FILES.administrators);
  const filteredAdmins = administrators.filter(a => a.id !== req.params.id);
  if (await writeJsonFile(FILES.administrators, filteredAdmins)) {
    res.json({ success: true, message: '🗑️ Admin deleted.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
});

// Sales API
app.get('/api/sales', async (req, res) => {
  const sales = await readJsonFile(FILES.sales);
  res.json(sales);
});

app.post('/api/sales', async (req, res) => {
  try {
    const sale = req.body;
    
    // Read existing sales
    const sales = await readJsonFile(FILES.sales);
    sales.push(sale);
    await writeJsonFile(FILES.sales, sales);
    
    res.json({ success: true, message: 'Sale recorded successfully' });
  } catch (error) {
    console.error('Error saving sale:', error);
    res.status(500).json({ success: false, message: 'Failed to save sale' });
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
  // Check sellers
  const sellersPath = path.join(DATA_DIR, 'sellers.json');
  let sellers = [];
  if (await fs.pathExists(sellersPath)) {
    sellers = await readJsonFile(sellersPath);
  }
  const seller = sellers.find(s => s.email === email && s.password === password);
  if (seller) {
    res.json({ success: true, user: seller });
    return;
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Warranty Management APIs

// Save sale with warranty info to daily sales file
app.post('/api/sales-with-warranty', async (req, res) => {
  try {
    const saleData = req.body;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailySalesFile = path.join(SALES_DIR, `${today}.json`);
    
    // Generate sale ID
    const saleId = `s-${Date.now()}`;
    const saleRecord = {
      saleId,
      ...saleData,
      timestamp: new Date().toISOString()
    };
    
    // Read existing daily sales or create new array
    let dailySales = [];
    if (await fs.pathExists(dailySalesFile)) {
      dailySales = await readJsonFile(dailySalesFile);
    }
    
    dailySales.push(saleRecord);
    await writeJsonFile(dailySalesFile, dailySales);
    
    // Also update the main sales.json file for backward compatibility
    const allSales = await readJsonFile(FILES.sales);
    allSales.push(saleRecord);
    await writeJsonFile(FILES.sales, allSales);
    
    res.json({ success: true, saleId, message: 'Sale with warranty recorded successfully' });
  } catch (error) {
    console.error('Error saving sale with warranty:', error);
    res.status(500).json({ success: false, message: 'Failed to save sale with warranty' });
  }
});

// Search warranty by multiple criteria (product ID, customer mobile, or customer email)
app.get('/api/warranty/search/:searchQuery', async (req, res) => {
  try {
    const { searchQuery } = req.params;
    const salesFiles = await fs.readdir(SALES_DIR);
    const matchingSales = [];
    
    // Search through all daily sales files
    for (const file of salesFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(SALES_DIR, file);
        const dailySales = await readJsonFile(filePath);
        
        // Filter by product ID, customer mobile, or customer email
        const filtered = dailySales.filter(sale => 
          sale.productId === searchQuery ||
          sale.customerMobile === searchQuery ||
          sale.customerEmail === searchQuery ||
          sale.customerEmail?.toLowerCase() === searchQuery.toLowerCase()
        );
        
        matchingSales.push(...filtered);
      }
    }
    
    // Calculate warranty status for each sale
    const today = new Date();
    const warrantyInfo = matchingSales.map(sale => {
      const warrantyEndDate = new Date(sale.warrantyEndDate);
      const isWarrantyActive = today <= warrantyEndDate;
      
      return {
        ...sale,
        warrantyStatus: isWarrantyActive ? 'active' : 'expired',
        daysRemaining: isWarrantyActive ? Math.ceil((warrantyEndDate - today) / (1000 * 60 * 60 * 24)) : 0
      };
    });
    
    res.json({ success: true, warranties: warrantyInfo });
  } catch (error) {
    console.error('Error searching warranty:', error);
    res.status(500).json({ success: false, message: 'Failed to search warranty information' });
  }
});

// Approve warranty claim
app.post('/api/warranty/approve', async (req, res) => {
  try {
    const { saleId, productId, dateOfSale, warrantyEndDate, approvedBy, notes } = req.body;
    
    const approvalRecord = {
      approvalId: `w-${Date.now()}`,
      saleId,
      productId,
      dateOfSale,
      warrantyEndDate,
      approvalDate: new Date().toISOString().split('T')[0],
      approvedBy,
      notes: notes || '',
      timestamp: new Date().toISOString()
    };
    
    // Read existing approvals
    let approvals = [];
    if (await fs.pathExists(FILES.warranties)) {
      approvals = await readJsonFile(FILES.warranties);
    }
    
    approvals.push(approvalRecord);
    await writeJsonFile(FILES.warranties, approvals);
    
    res.json({ success: true, approvalId: approvalRecord.approvalId, message: 'Warranty claim approved successfully' });
  } catch (error) {
    console.error('Error approving warranty:', error);
    res.status(500).json({ success: false, message: 'Failed to approve warranty claim' });
  }
});

// Get all warranty approvals
app.get('/api/warranty/approvals', async (req, res) => {
  try {
    let approvals = [];
    if (await fs.pathExists(FILES.warranties)) {
      approvals = await readJsonFile(FILES.warranties);
    }
    res.json({ success: true, approvals });
  } catch (error) {
    console.error('Error fetching warranty approvals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warranty approvals' });
  }
});

// Get sales report for a specific date
app.get('/api/sales/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const dailySalesFile = path.join(SALES_DIR, `${date}.json`);
    
    let dailySales = [];
    if (await fs.pathExists(dailySalesFile)) {
      dailySales = await readJsonFile(dailySalesFile);
    }
    
    res.json({ success: true, sales: dailySales, date });
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch daily sales' });
  }
});

// Get sold products (using sales data)
app.get('/api/soldproducts', async (req, res) => {
  try {
    const sales = await readJsonFile(FILES.sales);
    // Map sales data to soldProducts format for backward compatibility
    const soldProducts = sales.map(sale => ({
      saleId: sale.saleId,
      productId: sale.productId,
      productName: sale.productName,
      quantity: sale.quantity,
      pricePerUnit: sale.pricePerUnit,
      totalPrice: sale.totalPrice,
      unit: sale.unit,
      dateOfSale: sale.dateOfSale,
      customerName: sale.customerName,
      customerEmail: sale.customerEmail,
      customerMobile: sale.customerMobile,
      customerAddress: sale.customerAddress,
      soldByEmail: sale.soldByEmail,
      soldBy: sale.soldBy,
      warrantyEndDate: sale.warrantyEndDate,
      timestamp: sale.timestamp
    }));
    res.json({ success: true, soldProducts });
  } catch (error) {
    console.error('Error fetching sold products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sold products' });
  }
});

// Brands API
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await readJsonFile(FILES.brands);
    res.json(brands); // Return array directly
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json([]);
  }
});

app.post('/api/brands', async (req, res) => {
  try {
    const brands = await readJsonFile(FILES.brands);
    const newBrand = { ...req.body, id: `brand-${Date.now()}` };
    brands.push(newBrand);
    
    if (await writeJsonFile(FILES.brands, brands)) {
      res.json({ success: true, brand: newBrand });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save brand' });
    }
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ success: false, message: 'Failed to create brand' });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  try {
    const brands = await readJsonFile(FILES.brands);
    const brandIndex = brands.findIndex(b => b.id === req.params.id);
    
    if (brandIndex === -1) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    
    brands[brandIndex] = { ...brands[brandIndex], ...req.body };
    
    if (await writeJsonFile(FILES.brands, brands)) {
      res.json({ success: true, brand: brands[brandIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update brand' });
    }
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ success: false, message: 'Failed to update brand' });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  try {
    const brands = await readJsonFile(FILES.brands);
    const filteredBrands = brands.filter(b => b.id !== req.params.id);
    
    if (await writeJsonFile(FILES.brands, filteredBrands)) {
      res.json({ success: true, message: 'Brand deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete brand' });
    }
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ success: false, message: 'Failed to delete brand' });
  }
});

// Data Clear API
app.post('/api/data-clear', async (req, res) => {
  try {
    // List of files to clear/reset
    const filesToClear = [
      { path: FILES.products, defaultValue: [] },
      { path: FILES.sales, defaultValue: [] },
      { path: FILES.brands, defaultValue: [] },
      { path: path.join(DATA_DIR, 'basket.json'), defaultValue: [] },
      { path: path.join(DATA_DIR, 'revenue.json'), defaultValue: { totalRevenue: 0 } },
      { path: FILES.purchases, defaultValue: [] },
      { path: path.join(DATA_DIR, 'inventory.json'), defaultValue: { totalProducts: 0 } },
      { path: path.join(DATA_DIR, 'profit.json'), defaultValue: { netProfit: 0 } }
    ];
    for (const file of filesToClear) {
      await fs.writeJSON(file.path, file.defaultValue, { spaces: 2 });
    }
    res.json({ success: true, message: 'All data has been successfully cleared.' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, message: 'Failed to clear all data.' });
  }
});

// Verify admin password for data clear
app.post('/api/auth/verify-admin-password', async (req, res) => {
  const { email, password } = req.body;
  const administrators = await readJsonFile(FILES.administrators);
  const admin = administrators.find(a => a.email === email && a.password === password && a.role === 'admin');
  if (admin) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
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
