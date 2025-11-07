# FoodExpress Backend - Complete Code Explanation for Viva

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Detailed Code Explanation](#detailed-code-explanation)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Security Features](#security-features)
8. [Error Handling](#error-handling)

---

## 🎯 Project Overview

**FoodExpress** is a food delivery backend system built with Node.js and Express.js. It provides:
- RESTful API endpoints for menu, orders, and delivery time estimation
- MongoDB database integration using Mongoose ODM
- Static file serving for frontend (HTML, CSS, JS, Images)
- JSON-based API responses
- Basic security and logging

---

## 🛠 Technology Stack

### Core Dependencies:
1. **Express.js** (v4.19.2) - Web framework for Node.js
2. **Mongoose** (v8.6.0) - MongoDB object modeling (ODM)
3. **dotenv** (v16.4.5) - Environment variable management
4. **morgan** (v1.10.0) - HTTP request logger middleware
5. **helmet** (v7.1.0) - Security headers middleware

### Development Dependencies:
- **nodemon** (v3.1.7) - Auto-restart server during development

---

## 📁 Project Structure

```
Food-Express/
├── src/
│   ├── server.js              # Main server file
│   ├── models/
│   │   ├── MenuItem.js        # Menu item schema
│   │   └── Order.js           # Order schema
│   ├── routes/
│   │   ├── menu.js            # Menu API routes
│   │   ├── order.js           # Order API routes
│   │   └── delivery.js        # Delivery time routes
│   └── utils/
│       └── deliveryTime.js    # Delivery estimation logic
├── package.json               # Dependencies and scripts
└── env.example                # Environment variables template
```

---

## 📖 Detailed Code Explanation

### 1. **src/server.js** - Main Server File

#### **Imports and Setup (Lines 1-18)**
```javascript
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
```

**Explanation:**
- **ES6 Modules**: Using `import` instead of `require` (indicated by `"type": "module"` in package.json)
- **path & fileURLToPath**: Needed for ES modules to get `__dirname` (since it's not available in ES modules)
- **express**: Creates the web server
- **mongoose**: MongoDB connection and ODM
- **morgan**: Logs HTTP requests (useful for debugging)
- **helmet**: Adds security headers to responses
- **dotenv**: Loads environment variables from `.env` file

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```
- Converts ES module URL to file path to get `__dirname` equivalent

```javascript
dotenv.config();
```
- Loads environment variables from `.env` file

#### **Express App Initialization (Line 18)**
```javascript
const app = express();
```
- Creates Express application instance

#### **Middleware Setup (Lines 20-27)**

**Security Headers (Line 21):**
```javascript
app.use(helmet());
```
- Adds security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Protects against common web vulnerabilities

**Request Logging (Line 24):**
```javascript
app.use(morgan('dev'));
```
- Logs all HTTP requests in development format
- Example output: `GET /menu 200 15.234 ms`

**JSON Body Parser (Line 27):**
```javascript
app.use(express.json());
```
- Parses incoming JSON request bodies
- Makes `req.body` available in route handlers

#### **Static File Serving (Lines 29-34)**
```javascript
const projectRoot = path.resolve(__dirname, '..');
app.use('/CSS', express.static(path.join(projectRoot, 'CSS')));
app.use('/JS', express.static(path.join(projectRoot, 'JS')));
app.use('/HTML', express.static(path.join(projectRoot, 'HTML')));
app.use('/images', express.static(path.join(projectRoot, 'images')));
```

**Explanation:**
- `path.resolve(__dirname, '..')` - Gets project root directory (one level up from `src/`)
- `express.static()` - Serves static files from specified directories
- Each `app.use()` mounts a static file server:
  - `/CSS` → serves files from `CSS/` folder
  - `/JS` → serves files from `JS/` folder
  - `/HTML` → serves files from `HTML/` folder
  - `/images` → serves files from `images/` folder

**Example:** Request to `/CSS/style.css` serves `CSS/style.css` file

#### **Root Route (Lines 36-39)**
```javascript
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'HTML', 'index.html'));
});
```
- Serves `index.html` when user visits root URL (`/`)
- `res.sendFile()` - Sends file as response

#### **Health Check Endpoint (Lines 41-44)**
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```
- Simple endpoint to check if server is running
- Returns JSON: `{ "status": "ok" }`
- Useful for monitoring and deployment checks

#### **API Routes (Lines 46-49)**
```javascript
app.use('/menu', menuRouter);
app.use('/order', orderRouter);
app.use('/delivery-time', deliveryRouter);
```
- Mounts route handlers from separate files
- **Modular routing**: Keeps code organized and maintainable
- All routes in `menu.js` are prefixed with `/menu`
- Example: Route defined in `menu.js` as `router.get('/')` becomes `GET /menu`

#### **404 Handler for API Routes (Lines 51-57)**
```javascript
app.use((req, res, next) => {
  if (req.path.startsWith('/menu') || req.path.startsWith('/order') || req.path.startsWith('/delivery-time')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return next();
});
```
- Catches undefined API routes
- Returns JSON error for API requests
- `next()` allows other routes (like static files) to continue

#### **Error Handler Middleware (Lines 59-71)**
```javascript
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isProd ? undefined : err.message,
  });
});
```

**Explanation:**
- **4-parameter function** = Express error handler
- `err.status` - HTTP status code from error (defaults to 500)
- **Security**: Hides error details in production (prevents information leakage)
- Logs error to console for debugging
- Returns JSON error response

#### **Database Connection & Server Start (Lines 73-95)**
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodexpress';
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
    });
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
```

**Explanation:**
- **Environment Variables**: Uses `.env` file or defaults
- **MongoDB Connection**: 
  - `mongoose.connect()` - Connects to MongoDB
  - `autoIndex: true` - Automatically creates indexes
- **Server Listen**: Starts HTTP server on specified port
- **Error Handling**: Exits process if connection fails
- **Async/Await**: Handles asynchronous database connection

---

### 2. **src/models/MenuItem.js** - Menu Item Database Model

```javascript
import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General' },
    imageUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', MenuItemSchema);
```

**Explanation:**
- **Schema Definition**: Defines structure of menu item documents
- **Fields:**
  - `name`: Required string, trimmed (removes whitespace)
  - `description`: Optional string, defaults to empty
  - `price`: Required number, minimum value 0
  - `category`: String, defaults to 'General'
  - `imageUrl`: String for image URL
- **timestamps: true**: Automatically adds `createdAt` and `updatedAt` fields
- **Model Export**: Creates and exports Mongoose model named 'MenuItem'
- **Collection Name**: MongoDB collection will be `menuitems` (pluralized, lowercase)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Classic Burger",
  "description": "Grilled beef patty",
  "price": 580,
  "category": "Burgers",
  "imageUrl": "/images/burger-classic.jpg",
  "createdAt": "2025-01-07T10:00:00.000Z",
  "updatedAt": "2025-01-07T10:00:00.000Z"
}
```

---

### 3. **src/models/Order.js** - Order Database Model

```javascript
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true, trim: true },
    userLocation: {
      pincode: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'received', enum: ['received', 'preparing', 'out-for-delivery', 'delivered'] }
  },
  { timestamps: true, collection: 'orders' }
);

export default mongoose.model('Order', OrderSchema);
```

**Explanation:**
- **Nested Schema**: `userLocation` is an embedded object
- **Fields:**
  - `foodName`: Required string
  - `userLocation`: Object with pincode, city, address (all optional)
  - `totalAmount`: Required number, minimum 0
  - `status`: String with enum validation (only allowed values)
- **collection: 'orders'**: Explicitly sets collection name (not default pluralization)
- **Status Enum**: Ensures only valid order statuses are stored

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "foodName": "Classic Burger",
  "userLocation": {
    "pincode": "560001",
    "city": "Bengaluru",
    "address": "123 Main St"
  },
  "totalAmount": 580,
  "status": "received",
  "createdAt": "2025-01-07T10:00:00.000Z",
  "updatedAt": "2025-01-07T10:00:00.000Z"
}
```

---

### 4. **src/routes/menu.js** - Menu API Routes

```javascript
import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';

const router = Router();

// GET /menu -> fetch all food items
router.get('/', async (req, res, next) => {
  try {
    const items = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

export default router;
```

**Explanation:**
- **Router**: Creates Express router instance
- **GET /menu Endpoint:**
  - `MenuItem.find({})` - Finds all documents (empty filter = all)
  - `.sort({ createdAt: -1 })` - Sorts by creation date, newest first (-1 = descending)
  - `.lean()` - Returns plain JavaScript objects (faster, no Mongoose document methods)
  - `res.json({ items })` - Sends JSON response with items array
- **Error Handling**: `next(err)` passes error to error handler middleware
- **Async/Await**: Handles asynchronous database query

**Request/Response Example:**
```
GET /menu
Response: {
  "items": [
    { "name": "Burger", "price": 580, ... },
    { "name": "Pizza", "price": 450, ... }
  ]
}
```

---

### 5. **src/routes/order.js** - Order API Routes

```javascript
import { Router } from 'express';
import Order from '../models/Order.js';

const router = Router();

// POST /order -> receive an order
router.post('/', async (req, res, next) => {
  try {
    const { foodName, userLocation, totalAmount } = req.body || {};

    // Validation
    if (!foodName || typeof foodName !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing foodName' });
    }
    if (typeof totalAmount !== 'number' || Number.isNaN(totalAmount) || totalAmount < 0) {
      return res.status(400).json({ error: 'Invalid totalAmount' });
    }

    // Safe location object
    const safeLocation = {
      pincode: userLocation?.pincode || '',
      city: userLocation?.city || '',
      address: userLocation?.address || ''
    };

    // Create order
    const order = await Order.create({ foodName, userLocation: safeLocation, totalAmount });
    return res.status(201).json({ order });
  } catch (err) {
    return next(err);
  }
});

export default router;
```

**Explanation:**
- **POST /order Endpoint**: Creates new order
- **Request Body Destructuring**: Extracts fields from `req.body`
- **Input Validation:**
  - Checks `foodName` exists and is string
  - Validates `totalAmount` is valid number and non-negative
  - Returns 400 (Bad Request) if validation fails
- **Optional Chaining (`?.`)**: Safely accesses nested properties
- **Safe Location**: Creates location object with defaults (prevents undefined errors)
- **Order Creation**: `Order.create()` saves document to database
- **201 Status**: Created status code for successful resource creation

**Request/Response Example:**
```
POST /order
Body: {
  "foodName": "Classic Burger",
  "userLocation": {
    "pincode": "560001",
    "city": "Bengaluru"
  },
  "totalAmount": 580
}

Response (201): {
  "order": {
    "_id": "...",
    "foodName": "Classic Burger",
    "userLocation": { ... },
    "totalAmount": 580,
    "status": "received",
    ...
  }
}
```

---

### 6. **src/routes/delivery.js** - Delivery Time Routes

```javascript
import { Router } from 'express';
import { estimateDeliveryMinutes } from '../utils/deliveryTime.js';

const router = Router();

// GET /delivery-time?location=... OR ?pincode=... OR ?city=...
router.get('/', async (req, res, next) => {
  try {
    const { location, pincode, city } = req.query;

    const loc = (location || pincode || city || '').toString().trim();
    if (!loc) {
      return res.status(400).json({ error: 'Missing location (pincode or city)' });
    }

    const minutes = estimateDeliveryMinutes(loc);
    return res.json({ location: loc, etaMinutes: minutes, etaText: `${minutes}-${minutes + 15} mins` });
  } catch (err) {
    return next(err);
  }
});

export default router;
```

**Explanation:**
- **Query Parameters**: Reads from `req.query` (URL parameters)
- **Flexible Input**: Accepts `location`, `pincode`, or `city` parameter
- **Input Sanitization**: Converts to string and trims whitespace
- **Validation**: Returns 400 if no location provided
- **Utility Function**: Calls `estimateDeliveryMinutes()` from utils
- **Response Format**: Returns location, minutes, and formatted text

**Request/Response Example:**
```
GET /delivery-time?location=Bengaluru
Response: {
  "location": "Bengaluru",
  "etaMinutes": 25,
  "etaText": "25-40 mins"
}
```

---

### 7. **src/utils/deliveryTime.js** - Delivery Estimation Logic

```javascript
export function estimateDeliveryMinutes(location) {
  const normalized = location.toLowerCase();

  // Major metro pincodes
  if (/\b(100|110|560|400)\d{3}\b/.test(normalized)) {
    return 20;
  }

  // Major cities
  if (/\b(mumbai|delhi|bengaluru|bangalore|hyderabad|chennai|pune|kolkata)\b/.test(normalized)) {
    return 25;
  }

  // Generic India
  if (/\b(india)\b/.test(normalized)) {
    return 35;
  }

  // Fallback estimate
  return 30 + Math.min(15, normalized.length);
}
```

**Explanation:**
- **Heuristic-Based**: Simple estimation (not real distance calculation)
- **Normalization**: Converts to lowercase for case-insensitive matching
- **Regex Patterns**: 
  - `/\b(100|110|560|400)\d{3}\b/` - Matches pincodes starting with major metro codes
  - `/\b(mumbai|delhi|...)\b/` - Matches major city names
- **Fallback Logic**: Returns estimate based on input length if no match
- **Note**: This is a simplified version; real implementation would use geolocation APIs

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/menu` | Get all menu items | - | `{ items: [...] }` |
| POST | `/order` | Create new order | `{ foodName, userLocation, totalAmount }` | `{ order: {...} }` |
| GET | `/delivery-time` | Get delivery estimate | Query: `?location=...` | `{ location, etaMinutes, etaText }` |
| GET | `/health` | Health check | - | `{ status: "ok" }` |

---

## 🗄 Database Models Summary

### MenuItem Collection
- Stores food items with name, description, price, category, imageUrl
- Auto-timestamps (createdAt, updatedAt)

### Orders Collection
- Stores order details: foodName, userLocation, totalAmount, status
- Status enum: 'received', 'preparing', 'out-for-delivery', 'delivered'
- Auto-timestamps

---

## 🔒 Security Features

1. **Helmet.js**: Adds security headers
   - Prevents XSS attacks
   - Prevents clickjacking
   - Sets content security policies

2. **Input Validation**: 
   - Type checking
   - Range validation (min values)
   - Required field validation

3. **Error Handling**:
   - Hides error details in production
   - Prevents information leakage

4. **Environment Variables**:
   - Sensitive data (MongoDB URI) stored in `.env`
   - Not committed to version control

---

## ⚠️ Error Handling

1. **Try-Catch Blocks**: All async routes wrapped in try-catch
2. **Error Middleware**: Centralized error handler
3. **Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request (validation errors)
   - 404: Not Found
   - 500: Internal Server Error
4. **Error Propagation**: `next(err)` passes errors to middleware

---

## 🚀 How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running
   ```

4. **Start Server:**
   ```bash
   npm start        # Production
   npm run dev      # Development (with nodemon)
   ```

5. **Access:**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/menu`, `/order`, `/delivery-time`

---

## 📝 Key Concepts for Viva

1. **RESTful API**: Uses standard HTTP methods (GET, POST)
2. **MVC Pattern**: Models (schemas), Routes (controllers), Utils (helpers)
3. **Middleware**: Functions that run between request and response
4. **Async/Await**: Modern way to handle asynchronous operations
5. **Schema Validation**: Mongoose validates data before saving
6. **Modular Code**: Separated into routes, models, utils for maintainability
7. **Error Handling**: Centralized error handling with proper status codes
8. **Security**: Helmet for headers, input validation, environment variables

---

## 🎓 Common Viva Questions & Answers

**Q: Why use Mongoose instead of native MongoDB driver?**
A: Mongoose provides schema validation, middleware, and easier query syntax. It adds structure and validation to MongoDB.

**Q: What is middleware in Express?**
A: Functions that execute between receiving request and sending response. Examples: helmet (security), morgan (logging), express.json() (parsing).

**Q: Why use async/await?**
A: Makes asynchronous code readable and easier to handle errors compared to callbacks or promises.

**Q: What is the purpose of .lean() in Mongoose?**
A: Returns plain JavaScript objects instead of Mongoose documents, improving performance and reducing memory usage.

**Q: Why separate routes into different files?**
A: Modularity - easier to maintain, test, and scale. Each route file handles specific functionality.

**Q: What is the difference between req.body, req.query, and req.params?**
A: 
- `req.body`: Data in request body (POST/PUT)
- `req.query`: URL query parameters (`?key=value`)
- `req.params`: Route parameters (`/user/:id`)

---

**Good luck with your viva! 🎉**

