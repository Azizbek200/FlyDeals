# ✈️ Deals App

A full-stack flight deals platform with admin panel. Find and share the best flight deals with your audience.

## 🏗️ Tech Stack

### Backend
- **Language**: Go 1.25.7
- **Framework**: Gin (HTTP web framework)
- **Database**: PostgreSQL with pgx/v5
- **Auth**: JWT-based authentication
- **Password**: bcrypt hashing

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI**: React 19

## 📁 Project Structure

```
deals_app/
├── backend/              # Go backend API
│   ├── cmd/             # Command-line tools
│   │   └── seed/        # Admin user creation
│   ├── config/          # Configuration management
│   ├── db/              # Database connection & migrations
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # Auth & other middleware
│   ├── models/          # Data models
│   ├── utils/           # Helper functions
│   └── main.go          # Application entry point
│
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   └── lib/         # API client & utilities
│   └── public/          # Static assets
│
└── SETUP.md            # Detailed setup instructions
```

## 🚀 Quick Start

### Prerequisites
- Go 1.25.7+
- Node.js 24+
- PostgreSQL 16+

### 1. Install PostgreSQL
```bash
brew install postgresql@16
brew services start postgresql@16
createdb deals
```

### 2. Setup Environment Files

Environment files have been created with defaults:
- ✅ `backend/.env` - Backend configuration
- ✅ `frontend/.env.local` - Frontend configuration

**Note**: Update `DATABASE_URL` in `backend/.env` if your PostgreSQL credentials differ from defaults.

### 3. Create Admin User
```bash
cd backend
go run cmd/seed/main.go
# Creates: admin@flydeals.com / admin123
```

### 4. Start Backend
```bash
cd backend
go run main.go
```
Backend runs on: http://localhost:8080

### 5. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## 🎯 Features

### Public Features
- Browse published flight deals
- View deal details
- Responsive design

### Admin Features
- Secure login with JWT authentication
- Create, edit, and delete deals
- Publish/unpublish deals
- Rich text editor for deal descriptions

## 📋 API Endpoints

### Public Routes
- `GET /deals` - List published deals
- `GET /deals/:slug` - Get deal by slug

### Admin Routes (requires authentication)
- `POST /admin/login` - Admin login
- `GET /admin/deals` - List all deals (including unpublished)
- `POST /admin/deals` - Create new deal
- `PUT /admin/deals/:id` - Update deal
- `DELETE /admin/deals/:id` - Delete deal

## 🔐 Default Credentials

- **Email**: admin@flydeals.com
- **Password**: admin123

⚠️ **Important**: Change these credentials after first login!

## 🛠️ Development

### Backend
```bash
cd backend

# Run server
go run main.go

# Build
go build -o deals-api

# Run tests (if available)
go test ./...
```

### Frontend
```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📚 Documentation

For detailed setup instructions, troubleshooting, and deployment guides, see [SETUP.md](SETUP.md).

## 🔧 Configuration

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (auto-generated)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)
- `PORT` - Server port (default: 8080)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)

## 🎨 Key Pages

- `/` - Homepage with deal listings
- `/deal/[slug]` - Individual deal page
- `/admin/login` - Admin login
- `/admin/deals` - Admin deals dashboard
- `/admin/new` - Create new deal
- `/admin/edit/[id]` - Edit existing deal

## 📝 License

Private project

## 🤝 Contributing

This is a personal project. For questions or suggestions, please open an issue.
