# FoodExpress Backend - Quick Viva Reference

## 🎯 Project in One Sentence
Food delivery backend API using Node.js, Express.js, and MongoDB that serves static frontend files and provides RESTful endpoints for menu, orders, and delivery time estimation.

---

## 📦 Dependencies & Their Purpose

| Package | Purpose |
|---------|---------|
| **express** | Web framework - handles HTTP requests/responses |
| **mongoose** | MongoDB ODM - database connection & schema modeling |
| **dotenv** | Environment variables - stores sensitive config |
| **morgan** | HTTP logging - logs all requests for debugging |
| **helmet** | Security - adds security headers to responses |
| **nodemon** | Dev tool - auto-restarts server on file changes |

---

## 🗂 File Structure & Purpose

```
src/
├── server.js          → Main entry point, Express app setup
├── models/
│   ├── MenuItem.js    → Database schema for food items
│   └── Order.js       → Database schema for orders
├── routes/
│   ├── menu.js        → GET /menu endpoint
│   ├── order.js       → POST /order endpoint
│   └── delivery.js    → GET /delivery-time endpoint
└── utils/
    └── deliveryTime.js → Delivery estimation logic
```

---

## 🔌 API Endpoints

### 1. GET /menu
- **Purpose**: Fetch all menu items
- **Method**: GET
- **Response**: `{ items: [...] }`
- **Code**: `MenuItem.find({}).sort({ createdAt: -1 })`

### 2. POST /order
- **Purpose**: Create new order
- **Method**: POST
- **Body**: `{ foodName, userLocation, totalAmount }`
- **Validation**: Checks foodName (string), totalAmount (number ≥ 0)
- **Response**: `{ order: {...} }` (201 status)

### 3. GET /delivery-time
- **Purpose**: Estimate delivery time
- **Method**: GET
- **Query**: `?location=...` or `?pincode=...` or `?city=...`
- **Response**: `{ location, etaMinutes, etaText }`

---

## 🗄 Database Models

### MenuItem Schema
```javascript
{
  name: String (required),
  description: String,
  price: Number (required, min: 0),
  category: String,
  imageUrl: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Order Schema
```javascript
{
  foodName: String (required),
  userLocation: {
    pincode: String,
    city: String,
    address: String
  },
  totalAmount: Number (required, min: 0),
  status: String (enum: 'received', 'preparing', 'out-for-delivery', 'delivered'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🔑 Key Code Concepts

### Middleware Stack (Order Matters!)
1. `helmet()` - Security headers
2. `morgan('dev')` - Request logging
3. `express.json()` - Parse JSON bodies
4. Static file serving
5. API routes
6. Error handler (last)

### Static File Serving
```javascript
app.use('/CSS', express.static(path.join(projectRoot, 'CSS')));
```
- Serves files from `CSS/` folder at `/CSS` URL
- Example: `/CSS/style.css` → serves `CSS/style.css`

### Error Handling Pattern
```javascript
try {
  // async operation
} catch (err) {
  return next(err);  // Passes to error middleware
}
```

### Mongoose Query Methods
- `Model.find({})` - Find all
- `Model.create({})` - Create new document
- `.sort({ field: -1 })` - Sort descending
- `.lean()` - Return plain objects (faster)

---

## 🛡 Security Features

1. **Helmet.js**: Adds security headers
2. **Input Validation**: Type checking, range validation
3. **Error Hiding**: Production mode hides error details
4. **Environment Variables**: Sensitive data in `.env`

---

## ⚡ Important Points to Remember

1. **ES6 Modules**: Uses `import/export` (not `require`)
2. **Async/Await**: All database operations are async
3. **Error Middleware**: 4-parameter function `(err, req, res, next)`
4. **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Error)
5. **Collection Name**: Orders saved in `orders` collection (explicitly set)
6. **Timestamps**: Auto-added by Mongoose (`timestamps: true`)

---

## 💡 Common Viva Questions

**Q: Why Mongoose over native MongoDB?**
A: Schema validation, easier queries, middleware hooks, type casting.

**Q: What is middleware?**
A: Functions that run between request and response. Can modify req/res or end request.

**Q: Why async/await?**
A: Cleaner syntax than callbacks/promises, easier error handling with try-catch.

**Q: What does .lean() do?**
A: Returns plain JS objects instead of Mongoose documents - faster and uses less memory.

**Q: req.body vs req.query vs req.params?**
A: 
- `req.body` - POST/PUT request body
- `req.query` - URL query string (`?key=value`)
- `req.params` - Route parameters (`/user/:id`)

**Q: How does error handling work?**
A: Errors caught in try-catch, passed to error middleware via `next(err)`, which returns JSON response.

**Q: Why separate route files?**
A: Modularity - easier to maintain, test, and scale. Each file handles specific functionality.

**Q: What is the purpose of helmet?**
A: Adds security HTTP headers to prevent XSS, clickjacking, and other attacks.

**Q: How does MongoDB connection work?**
A: `mongoose.connect()` establishes connection. Uses connection pooling for efficiency.

**Q: What is the difference between development and production?**
A: Production hides error details, uses optimized settings. Development shows detailed errors.

---

## 🚀 Startup Flow

1. Load environment variables (`dotenv.config()`)
2. Create Express app
3. Setup middleware (helmet, morgan, json parser)
4. Serve static files
5. Mount API routes
6. Setup error handler
7. Connect to MongoDB
8. Start HTTP server

---

## 📊 Request Flow Example

**POST /order Request:**
```
1. Request arrives → Express receives
2. Helmet adds security headers
3. Morgan logs request
4. express.json() parses body
5. Route handler validates input
6. Order.create() saves to MongoDB
7. Response sent (201 status)
8. Error handler catches any errors
```

---

**Good luck! 🎓**

