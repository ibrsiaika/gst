# Getting Started with GST Compliance SaaS Platform

This guide will help you get the GST Compliance SaaS platform up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+**: [Download Node.js](https://nodejs.org/)
- **Docker & Docker Compose**: [Download Docker](https://www.docker.com/get-started)
- **PostgreSQL 15+** (if not using Docker)
- **Git**: [Download Git](https://git-scm.com/)

## Quick Start (Automated Setup)

We provide an automated setup script that will configure everything for you:

```bash
# Clone the repository
git clone https://github.com/ibrsiaika/gst.git
cd gst

# Run the setup script
./setup.sh
```

The setup script will:
1. Start PostgreSQL and Redis using Docker Compose
2. Install all backend dependencies
3. Build the backend application
4. Install all frontend dependencies
5. Build the frontend application

After the setup completes, follow the instructions to start the backend and frontend servers.

## Manual Setup

If you prefer to set up manually or the automated script doesn't work, follow these steps:

### Step 1: Clone the Repository

```bash
git clone https://github.com/ibrsiaika/gst.git
cd gst
```

### Step 2: Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose up -d
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Automatically initialize the database with the schema from `docs/data-model/schema.sql`

Verify the services are running:

```bash
docker compose ps
```

You should see both `gst-postgres` and `gst-redis` containers running.

### Step 3: Setup Backend

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Build the application
npm run build

# Start the development server
npm run start:dev
```

The backend will start on `http://localhost:3000/v1`

**API Documentation** is available at: `http://localhost:3000/api/docs`

### Step 4: Setup Frontend (New Terminal)

Open a new terminal window and run:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3001`

### Step 5: Access the Application

Once both servers are running:

- **Landing Page**: http://localhost:3001
- **Dashboard**: http://localhost:3001/dashboard
- **API Documentation**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/v1

## Environment Variables

### Backend Environment Variables

The backend uses environment variables defined in `backend/.env`. Here are the key variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=gst_saas

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# IRP (E-Invoice) - Sandbox
IRP_BASE_URL=https://einv-apisandbox.nic.in
IRP_CLIENT_ID=
IRP_CLIENT_SECRET=

# E-Way Bill - Sandbox
EWAY_BASE_URL=https://preprod-api.ewaybillgst.gov.in

# GSTIN Verification
GSTIN_API_URL=https://einv-apisandbox.nic.in/version1.03
```

## Testing the API

### Using Swagger UI

1. Open http://localhost:3000/api/docs
2. Explore the available endpoints
3. Try out the API calls directly from the browser

### Using cURL

Create a tenant:

```bash
curl -X POST http://localhost:3000/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Technologies Pvt Ltd",
    "pan": "ABCDE1234F",
    "planCode": "STARTER",
    "primaryGstin": "29ABCDE1234F2Z5",
    "adminEmail": "admin@abctech.com"
  }'
```

Create an invoice:

```bash
curl -X POST "http://localhost:3000/v1/invoices?tenantId=YOUR_TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV/2024-25/00001",
    "invoiceDate": "2024-05-10",
    "invoiceType": "B2B",
    "sellerGstin": "29ABCDE1234F2Z5",
    "sellerLegalName": "ABC Technologies Pvt Ltd",
    "sellerAddress": {
      "building": "Tech Park",
      "street": "Outer Ring Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "stateCode": "29",
      "pincode": "560103"
    },
    "buyerGstin": "27XYZDE4567L1Z2",
    "buyerLegalName": "XYZ Enterprises",
    "buyerAddress": {
      "building": "Business Center",
      "street": "MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "stateCode": "27",
      "pincode": "400001"
    },
    "placeOfSupply": "27",
    "supplyType": "INTER_STATE",
    "items": [
      {
        "description": "Software Development Services",
        "hsnCode": "998314",
        "quantity": 1,
        "unit": "NOS",
        "unitPrice": 100000,
        "taxableValue": 100000,
        "taxRate": 18,
        "igstAmount": 18000,
        "taxAmount": 18000,
        "itemTotal": 118000
      }
    ],
    "totalTaxableValue": 100000,
    "totalIgst": 18000,
    "totalTaxAmount": 18000,
    "grandTotal": 118000
  }'
```

### Using Postman

Import the Postman collection from `docs/postman/postman-outline.json`:

1. Open Postman
2. Click **Import**
3. Select `docs/postman/postman-outline.json`
4. Set environment variables:
   - `baseUrl`: `http://localhost:3000/v1`
   - `tenantId`: (get from tenant creation response)

## Database Access

To access the PostgreSQL database:

```bash
# Using Docker
docker compose exec postgres psql -U postgres -d gst_saas

# Or using psql directly
psql -h localhost -U postgres -d gst_saas
# Password: postgres
```

Common queries:

```sql
-- List all tables
\dt

-- View tenants
SELECT * FROM tenants;

-- View invoices
SELECT * FROM invoices;

-- View invoice items
SELECT * FROM invoice_items;
```

## Troubleshooting

### Port Already in Use

If you get an error that port 3000 or 5432 is already in use:

**Backend (port 3000)**:
```bash
# Change PORT in backend/.env
PORT=3001
```

**PostgreSQL (port 5432)**:
```bash
# Stop any existing PostgreSQL instances
# On macOS: brew services stop postgresql
# On Linux: sudo systemctl stop postgresql
```

### Database Connection Error

If the backend can't connect to PostgreSQL:

1. Ensure Docker containers are running:
   ```bash
   docker compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker compose logs postgres
   ```

3. Verify connection settings in `backend/.env`

### Schema Not Initialized

If the database schema is not initialized:

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d gst_saas

# Run the schema manually
\i /docker-entrypoint-initdb.d/01-schema.sql
```

## Development Workflow

### Making Changes to the Backend

1. Edit files in `backend/src/`
2. The dev server will automatically reload (hot reload is enabled)
3. Check http://localhost:3000/api/docs for updated API

### Making Changes to the Frontend

1. Edit files in `frontend/app/`
2. The dev server will automatically reload
3. View changes at http://localhost:3001

### Adding a New Entity

1. Create entity file in `backend/src/entities/`
2. Create DTO in `backend/src/modules/{module}/dto/`
3. Create service in `backend/src/modules/{module}/`
4. Create controller
5. Add to module imports in `app.module.ts`
6. Update database schema in `docs/data-model/schema.sql`

## Next Steps

Now that you have the platform running:

1. **Explore the UI**: Visit the dashboard at http://localhost:3001/dashboard
2. **Test the API**: Use Swagger UI at http://localhost:3000/api/docs
3. **Read the Docs**: Check `PROJECT_README.md` for detailed documentation
4. **Review the Schema**: See `docs/data-model/erd.md` for database design
5. **Check API Spec**: Review `docs/api/openapi.yaml` for complete API reference

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend/.env
2. Use a managed PostgreSQL database (not Docker)
3. Set strong JWT secrets
4. Configure IRP and E-Way Bill API credentials
5. Set up SSL/TLS certificates
6. Configure proper CORS settings
7. Set up monitoring and logging
8. Enable rate limiting
9. Configure backups

See `docs/postman/bill-of-materials.md` for complete infrastructure guide.

## Getting Help

- **API Issues**: Check Swagger docs at http://localhost:3000/api/docs
- **Database Issues**: Review `docs/data-model/schema.sql`
- **UI Issues**: Check wireframes in `docs/ui-mockups/index.html`
- **Infrastructure**: See `docs/postman/bill-of-materials.md`

## Support

For issues or questions, refer to the comprehensive documentation in the `docs/` directory.
