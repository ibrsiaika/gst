#!/bin/bash

# GST Compliance SaaS Platform Setup Script

set -e

echo "🚀 GST Compliance SaaS Platform - Setup Script"
echo "=============================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Node.js found: $(node -v)"
echo ""

# Step 1: Start Docker services
echo "📦 Step 1: Starting PostgreSQL and Redis with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

echo ""

# Step 2: Setup Backend
echo "🔧 Step 2: Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

echo "🏗️  Building backend..."
npm run build

echo "✅ Backend setup complete!"
echo ""

cd ..

# Step 3: Setup Frontend
echo "🎨 Step 3: Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

echo "🏗️  Building frontend..."
npm run build

echo "✅ Frontend setup complete!"
echo ""

cd ..

# All done
echo "🎉 Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "=============="
echo ""
echo "1. Start the Backend:"
echo "   cd backend && npm run start:dev"
echo "   Backend will run on: http://localhost:3000/v1"
echo "   API docs available at: http://localhost:3000/api/docs"
echo ""
echo "2. Start the Frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo "   Frontend will run on: http://localhost:3001"
echo ""
echo "3. Access the application:"
echo "   - Landing page: http://localhost:3001"
echo "   - Dashboard: http://localhost:3001/dashboard"
echo "   - API Documentation: http://localhost:3000/api/docs"
echo ""
echo "📖 For more information, see PROJECT_README.md"
echo ""
