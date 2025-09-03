# Product Management API

RESTful API for product management built with Fastify, SQLite, and Drizzle ORM.

## Quick Start

### 1. Install Dependencies

```bash
cd product-management-api
npm install
```

### 2. Setup Database

```bash
# Generate migrations, run them, and seed database
npm run db:setup
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with pagination/filters) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH | `/api/products/:id/stock` | Update stock quantity |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## Product Schema

```typescript
{
  id: string (UUID)
  name: string
  description: string
  price: number
  sku: string (unique)
  stockQuantity: number
  createdAt: string (ISO date)
  updatedAt: string (ISO date)
}
```

## Usage Examples

### Create Product

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "description": "This is a sample product",
    "price": 29.99,
    "sku": "SAMPLE-001",
    "stockQuantity": 100
  }'
```

### Get All Products

```bash
curl http://localhost:3001/api/products
```

### Get Products with Filters

```bash
curl "http://localhost:3001/api/products?name=wireless&minPrice=20&limit=10"
```

### Update Product

```bash
curl -X PUT http://localhost:3001/api/products/[PRODUCT_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "price": 24.99,
    "stockQuantity": 150
  }'
```

### Update Stock

```bash
curl -X PATCH http://localhost:3001/api/products/[PRODUCT_ID]/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": -5}'
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Complete database setup (generate + migrate + seed)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| HOST | 0.0.0.0 | Server host |

## Architecture

```
src/
├── controllers/     # Request handlers
├── database/        # Database schema and connection
├── models/          # Data models and validation schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
└── server.ts        # Main server file
```

## Technologies Used

- **Fastify** - Fast and low overhead web framework
- **SQLite** - Lightweight database
- **Drizzle ORM** - Type-safe ORM
- **Zod** - Schema validation
- **TypeScript** - Type safety
- **UUID** - Unique identifiers