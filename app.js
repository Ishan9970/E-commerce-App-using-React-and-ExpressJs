const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cors = require('cors');



const app = express();
const JWT_SECRET = '09f26e40209f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3001' })); // Replace 3001 with your React dev server port

// ================= Serve static files (HTML, CSS, JS, uploaded images) =================
app.use(express.static(__dirname));

// ================= MySQL connection =================
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'user_db'
});

// ================= Multer config for file uploads =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname); // save uploads to server root
  },
  filename: function (req, file, cb) {
    const uniqueName = 'img-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

/* ==== Middleware: Verify JWT token for protected routes ==== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization Header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // adds { id, role } from JWT payload
    next();
  });
}

/* ==== Middleware: Restrict route to a specific role ==== */
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied: requires ' + role });
    }
    next();
  };
}

/* ================= REGISTER =================
   Creates a new user account (public access)
   Used by: register.html form submit
*/
app.post('/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const sql = 'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)';
  connection.query(sql, [first_name, last_name, email, password], (err) => {
    if (err) {
      console.error('MySQL error:', err);
      return res.status(500).json({ success: false, message: 'Error inserting user' });
    }
    return res.json({ success: true, message: 'Signup successful!' });
  });
});

/* ================= LOGIN =================
   Authenticates admin or user, returns JWT
   Used by: login.html
*/
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing email, password, or role' });
  }
  let table = role === 'admin' ? 'admins' : 'users';
  const sql = `SELECT id, password_hash FROM ${table} WHERE email = ?`;
  connection.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (results.length === 0 || results[0].password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const dbUser = results[0];
    const token = jwt.sign({ id: dbUser.id, role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, message: `${role} login successful!`, token });
  });
});

/* ================= FETCH USER PROFILE =================
   Gets profile details for a given user ID
   Used by: welcome.html (profile initials), profile.html
*/
app.get('/user/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && +req.user.id !== +req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const userId = req.params.id;
  const sql = 'SELECT id, first_name, last_name, email FROM users WHERE id = ?';
  connection.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

/* ================= UPDATE PROFILE =================
   Updates profile details for a given user ID
   Used by: update.html
*/
app.post('/update-profile', authenticateToken, (req, res) => {
  const { id, first_name, last_name, email, password } = req.body;
  if (!id || !first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (req.user.role !== 'admin' && +req.user.id !== +id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ? WHERE id = ?';
  connection.query(sql, [first_name, last_name, email, password, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error updating profile' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'Profile updated' });
  });
});

/* ================= DELETE MYSELF =================
   Deletes own account (or admin deletes any user)
   Used by: welcome.html dropdown -> Delete
*/
app.delete('/delete-myself', authenticateToken, (req, res) => {
  const id = req.body.id;
  if (!id) return res.status(400).json({ message: 'Missing user id' });
  if (req.user.role !== 'admin' && +req.user.id !== +id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error when deleting user' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true });
  });
});

/* ================= SEARCH PRODUCTS =================
   Searches by product name, returns first matching ID
   Used by: welcome.html search form
*/
app.get('/search', authenticateToken, (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ message: 'Missing search query' });
  const sql = 'SELECT id FROM products WHERE name LIKE ? LIMIT 1';
  connection.query(sql, [`%${query}%`], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) {
      res.json({ productId: results[0].id });
    } else {
      res.json({});
    }
  });
});

/* ================= GET SINGLE PRODUCT =================
   Retrieves details for one product by ID
   Used by: product_details.html, cart.html
*/
app.get('/product/:id', authenticateToken, (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE id = ?';
  connection.query(sql, [productId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(results[0]);
  });
});

/* ================= GET CATEGORIES =================
   Returns distinct product categories
   Used by: welcome.html category dropdown
*/
app.get('/api/categories', authenticateToken, (req, res) => {
  connection.query('SELECT DISTINCT category FROM products', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json(results.map(r => r.category));
  });
});

/* ================= GET PRODUCTS BY CATEGORY =================
   Returns products filtered by category or all products if 'All'
   Used by: welcome.html to load products
*/
app.get('/api/products-by-category', authenticateToken, (req, res) => {
  const category = req.query.category;
  let sql, params;
  if (!category || category.toLowerCase() === 'all') {
    sql = 'SELECT * FROM products';
    params = [];
  } else {
    sql = 'SELECT * FROM products WHERE category = ?';
    params = [category];
  }
  connection.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json(results);
  });
});

/* ================= UPLOAD IMAGE =================
   Uploads image and returns URL
   Used by: insert_product.html (admin)
*/
app.post('/api/upload-image', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const imageUrl = '/' + req.file.filename;
  res.json({ success: true, imageUrl });
});

/* ================= ADD PRODUCT (Admin only) =================
   Adds a new product to DB
   Used by: insert_product.html (admin)
*/
app.post('/api/request', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { name, price, description, image_url, category } = req.body;
  if (!name || !price || !image_url || !category) {
    return res.status(400).json({ message: 'All product fields required' });
  }
  connection.query(
    `INSERT INTO products (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)`,
    [name, price, description || '', image_url, category],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error adding product' });
      res.json({ success: true, productId: result.insertId });
    }
  );
});

/* ================= UPDATE PRODUCT (Admin only) =================
   Updates fields of an existing product
   Used by: admin edit product page
*/
app.post('/api/update-product', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { id, name, price, description, category } = req.body;
  if (!id || !name || !price) {
    return res.status(400).json({ message: 'Missing id, name, or price' });
  }
  let sql, params;
  if (typeof description !== 'undefined' && typeof category !== 'undefined') {
    sql = 'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?';
    params = [name, price, description, category, id];
  } else if (typeof description !== 'undefined') {
    sql = 'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?';
    params = [name, price, description, id];
  } else if (typeof category !== 'undefined') {
    sql = 'UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?';
    params = [name, price, category, id];
  } else {
    sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
    params = [name, price, id];
  }
  connection.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error updating product' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  });
});

/* ================= DELETE PRODUCT (Admin only) =================
   Deletes product from DB by ID
   Used by: admin delete action
*/
app.post('/api/delete-product', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Missing product id' });
  const sql = 'DELETE FROM products WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error deleting product' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  });
});

/* ================= PROCESS PAYMENT =================
   Saves transaction details for a purchase
   Used by: payment.html
*/
app.post('/api/pay', authenticateToken, (req, res) => {
  const { userId, payment_mode, products, quantities } = req.body;
  if (!userId || !payment_mode || !products || !quantities) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }
  const productsStr = Array.isArray(products) ? products.join(',') : String(products);
  const quantitiesStr = Array.isArray(quantities) ? quantities.join(',') : String(quantities);
  const gateway_transaction_id = 'TXN_' + Date.now();
  const sql = `
    INSERT INTO transactions 
      (user_id, products, quantities, payment_mode, gateway_transaction_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [userId, productsStr, quantitiesStr, payment_mode, gateway_transaction_id];
  connection.query(sql, params, (err) => {
    if (err) {
      console.error('Error saving transaction:', err);
      return res.status(500).json({ success: false, message: 'Database error while saving transaction' });
    }
    res.json({ success: true, gateway_transaction_id });
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
