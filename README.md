# FoodExpress Backend

Simple Node.js + Express.js backend for serving static frontend files and APIs for menu, orders, and delivery time. Uses MongoDB via Mongoose.

## Features
- Serves existing `HTML`, `CSS`, and `JS` directories statically
- MongoDB connection with Mongoose
- Routes:
  - `GET /menu` → fetch all food items
  - `POST /order` → create an order { foodName, userLocation, totalAmount }
  - `GET /delivery-time?location=...` (or `?pincode=`/`?city=`) → estimated ETA
- JSON responses, logging (morgan), basic error handling, security headers (helmet)

## Setup
1. Install Node.js (v18+ recommended) and MongoDB.
2. In this folder, install dependencies:
   ```bash
   npm install
   ```
3. Copy environment example and adjust if needed:
   ```bash
   copy env.example .env
   ```
   On Linux/macOS use:
   ```bash
   cp env.example .env
   ```
4. Start MongoDB locally or set `MONGODB_URI` in `.env`.

## Run
- Development (with auto-restart):
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

Server runs on `http://localhost:3000` by default.

## API
- `GET /menu`
  - Response: `{ items: MenuItem[] }`
- `POST /order`
  - Body JSON: `{ foodName: string, userLocation?: { pincode?, city?, address? }, totalAmount: number }`
  - Response: `{ order: Order }`
- `GET /delivery-time?location=...`
  - Response: `{ location, etaMinutes, etaText }`

## Models
- `MenuItem`: { name, description, price, category, imageUrl }
- `Order` (collection: `orders`): { foodName, userLocation, totalAmount, status }

## Notes
- Static files are served from existing `HTML`, `CSS`, `JS` directories.
- Add your real delivery-time logic in `src/utils/deliveryTime.js` as needed.


