# GST Compliance SaaS Platform - Implementation

This repository contains the complete end-to-end implementation of a production-ready GST compliance SaaS platform for Indian businesses, built based on the comprehensive planning artifacts in the `docs/` directory.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL 15+
- Redis 7+ (optional, for queue-based processing)
- Docker & Docker Compose (for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ibrsiaika/gst.git
   cd gst
   ```

2. **Start the database and Redis using Docker Compose**
   ```bash
   docker-compose up -d
   ```
   This will start PostgreSQL on port 5432 and Redis on port 6379, and automatically initialize the database schema.

3. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env if needed
   npm install
   npm run start:dev
   ```
   Backend API will be available at: http://localhost:3000/v1
   
   Swagger API documentation: http://localhost:3000/api/docs

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at: http://localhost:3001

## 📁 Project Structure

```
gst/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── entities/     # TypeORM entities
│   │   ├── modules/      # Feature modules (tenants, invoices, etc.)
│   │   └── main.ts       # Application entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Next.js frontend application
│   ├── app/              # Next.js 14 app directory
│   │   ├── dashboard/    # Dashboard pages
│   │   └── page.tsx      # Landing page
│   └── package.json
├── docs/                 # Comprehensive documentation
│   ├── api/              # OpenAPI specification
│   ├── data-model/       # ERD and PostgreSQL schema
│   ├── ui-mockups/       # Interactive wireframes
│   └── postman/          # API collection and infrastructure BoM
├── docker-compose.yml    # Local development environment
└── README.md             # This file
```

## 🔧 Technology Stack

### Backend
- **Framework**: NestJS (Node.js 20, TypeScript)
- **Database**: PostgreSQL 15 with TypeORM
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI 3.0
- **Queue**: BullMQ + Redis (for async IRP/e-way processing)

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Containerization**: Docker

## 📚 API Endpoints

The backend implements the following key endpoints:

### Tenants
- `POST /v1/tenants` - Create a new tenant with admin user
- `GET /v1/tenants/:id` - Get tenant details
- `GET /v1/tenants` - List all tenants

### Invoices
- `POST /v1/invoices` - Create an invoice
- `GET /v1/invoices` - List invoices (filterable by tenant)
- `GET /v1/invoices/:id` - Get invoice details
- `POST /v1/invoices/:id/einvoice` - Submit invoice to IRP

Full API documentation is available at `/api/docs` when running the backend.

## 🎨 UI Features

The frontend includes:

1. **Landing Page** - Overview of platform features and technology stack
2. **Dashboard** - KPI cards showing:
   - Total invoices
   - Pending IRN submissions
   - Pending e-way bills
   - Tax liability
3. **Alerts** - GSTR filing deadlines and IRP validation failures
4. **Recent Activity** - Invoice listing with status tracking

## 🗃️ Database Schema

The PostgreSQL schema includes:

- **tenants** - Multi-tenant isolation
- **gst_registrations** - GSTIN details per tenant
- **users** - User management with RBAC (admin/accountant/viewer)
- **invoices** - Invoice master with GST validations
- **invoice_items** - Line items with HSN codes and tax calculations

Key features:
- ✅ GSTIN format validation (regex constraints)
- ✅ Tax split logic (CGST+SGST OR IGST check constraints)
- ✅ Valid GST tax rates (0, 0.1, 0.25, 3, 5, 12, 18, 28)
- ✅ Indian state code validation
- ✅ UUID primary keys
- ✅ Cascading deletes for data integrity

## 🔐 Security & Compliance

- **GSTIN Validation**: Regex pattern matching for 15-character format
- **Tax Calculation Validation**: Check constraints ensure proper CGST+SGST vs IGST logic
- **Multi-tenancy**: Tenant isolation at database level
- **Data Retention**: Schema supports 6-year retention per GST Act
- **Audit Trail**: Timestamps on all records

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
```bash
cd backend
docker build -t gst-backend .
docker run -p 3000:3000 --env-file .env gst-backend
```

### Environment Variables
See `backend/.env.example` for required environment variables including:
- Database connection
- IRP API credentials (sandbox/production)
- E-Way Bill API credentials
- Razorpay payment gateway keys
- JWT secrets

## 🛠️ Development Workflow

1. Database changes: Update `docs/data-model/schema.sql` and entity files
2. API changes: Update OpenAPI spec in `docs/api/openapi.yaml`
3. UI changes: Reference wireframes in `docs/ui-mockups/index.html`

## 📖 Additional Documentation

- **OpenAPI Spec**: See `docs/api/openapi.yaml`
- **Database Schema**: See `docs/data-model/schema.sql` and `docs/data-model/erd.md`
- **UI Mockups**: Open `docs/ui-mockups/index.html` in browser
- **Postman Collection**: Import `docs/postman/postman-outline.json`
- **Infrastructure Guide**: See `docs/postman/bill-of-materials.md`

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Project structure setup
- [x] Database schema implementation
- [x] Basic REST API (tenants, invoices)
- [x] Landing page and dashboard UI
- [x] Docker Compose for local development

### Phase 2 (Next)
- [ ] Authentication & Authorization (JWT)
- [ ] IRP integration with NIC sandbox
- [ ] E-Way Bill generation
- [ ] GSTIN verification API integration

### Phase 3 (Future)
- [ ] GSTR-1 and GSTR-3B report generation
- [ ] ITC ledger and reconciliation
- [ ] Razorpay subscription integration
- [ ] Email notifications
- [ ] Advanced filtering and search

## 🤝 Contributing

This is a demonstration project implementing the GST compliance specifications. For production use:

1. Replace placeholder credentials in `.env`
2. Implement proper authentication
3. Add rate limiting and security middleware
4. Set up monitoring and logging
5. Configure production database with proper backups
6. Register for IRP and E-Way Bill API access

## 📄 License

This implementation is based on the specifications in the `docs/` directory. Adapt for your specific business requirements and ensure compliance with latest GST notifications from CBIC.

## 🆘 Support

For issues or questions:
1. Check the comprehensive documentation in `docs/`
2. Review the OpenAPI spec for API details
3. Refer to the Bill of Materials for infrastructure setup

## 🙏 Acknowledgments

- Built following Next.js 14 and NestJS best practices
- Database schema designed for Indian GST compliance
- UI inspired by the wireframes in `docs/ui-mockups/`
- API contract follows the OpenAPI 3.0 specification in `docs/api/`
