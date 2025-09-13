# Database Setup Guide

## Option 1: PostgreSQL (Production Recommended)

### Windows Installation
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

### Database Setup
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE shopping_admin;
CREATE USER shopping_user WITH PASSWORD 'shopping_password_123';
GRANT ALL PRIVILEGES ON DATABASE shopping_admin TO shopping_user;
```

### Environment Configuration
Update `backend/.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopping_admin
DB_USER=shopping_user
DB_PASSWORD=shopping_password_123
```

## Option 2: SQLite (Quick Development Setup)

For quick testing without PostgreSQL installation, the backend is configured to automatically fall back to SQLite.

### Automatic Setup
The backend will create a SQLite database file at `backend/database.sqlite` automatically when PostgreSQL is not available.

### Environment Configuration
Set in `backend/.env`:
```
USE_SQLITE=true
```

## Starting the Application

1. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend  
   npm run dev
   ```

## Database Migration

After the server starts successfully, the database tables will be created automatically using Sequelize's `sync()` method.

## Test Data

To populate the database with sample data:
```bash
cd backend
npm run seed
```

## Database Reset

To reset the database:
- **PostgreSQL:** Drop and recreate the database
- **SQLite:** Delete the `backend/database.sqlite` file