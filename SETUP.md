# Deals App Setup Guide

## ✅ Completed Steps
- [x] Environment files created
- [x] Backend and frontend dependencies verified
- [x] Code compiles successfully

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Using Homebrew (recommended):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Alternative - Using Postgres.app:**
Download from https://postgresapp.com/

### 2. Create Database

Once PostgreSQL is running:

```bash
# Create the database
createdb deals

# Or using psql:
psql postgres
CREATE DATABASE deals;
\q
```

### 3. Update Database Credentials (if needed)

The default `.env` file is configured for:
- **User**: `user`
- **Password**: `password`
- **Database**: `deals`
- **Host**: `localhost`
- **Port**: `5432`

If your PostgreSQL uses different credentials, update the `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL=postgres://YOUR_USER:YOUR_PASSWORD@localhost:5432/deals?sslmode=disable
```

For default PostgreSQL installation, you might need:
```
DATABASE_URL=postgres://$(whoami)@localhost:5432/deals?sslmode=disable
```

## 👤 Create Admin User

### Using the Seed Script (Recommended)

The project includes a seed script that creates/updates an admin user:

```bash
cd backend

# Create default admin (admin@flydeals.com / admin123)
go run cmd/seed/main.go

# Or create with custom credentials
go run cmd/seed/main.go your-email@example.com your-password
```

**Important**: Change the default password immediately after first login!

## 🚀 Running the Application

### Terminal 1 - Start Backend:
```bash
cd backend
go run main.go
```

Backend will start on: http://localhost:8080

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:3000

## 📝 Default Login Credentials

- **Email**: `admin@flydeals.com`
- **Password**: `admin123`

⚠️ **Change these credentials in production!**

## 🔧 Troubleshooting

### Database Connection Issues

1. Check if PostgreSQL is running:
```bash
pg_isready
# or
brew services list | grep postgresql
```

2. Test connection:
```bash
psql -h localhost -U $(whoami) -d deals
```

3. Check backend logs for specific error messages

### Port Already in Use

If port 8080 or 3000 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Run `npm run dev -- -p 3001` (or any other port)

### CORS Errors

Make sure `CORS_ORIGIN` in `backend/.env` matches your frontend URL.

## 📚 Next Steps

1. Access the app at http://localhost:3000
2. Login to admin panel at http://localhost:3000/admin/login
3. Create your first deal at http://localhost:3000/admin/new
4. View public deals on the homepage

## 🔐 Security Notes

- The JWT_SECRET has been auto-generated
- Change default admin credentials
- In production, use environment variables for secrets
- Enable SSL for database connections in production
- Update CORS_ORIGIN to your production domain
