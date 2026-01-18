# Fix PostgreSQL Authentication Error

## Quick Fix Commands

Run these commands to fix the database authentication issue:

### 1. Check if PostgreSQL is Running

```bash
sudo systemctl status postgresql
# If not running, start it:
sudo systemctl start postgresql
```

### 2. Connect to PostgreSQL as Superuser

```bash
sudo -u postgres psql
```

### 3. In PostgreSQL Shell - Check if User/DB Exist

```sql
-- Check if user exists
\du

-- Check if database exists
\l

-- If user doesn't exist, create it:
CREATE USER email_user WITH PASSWORD 'your_password_here';

-- If database doesn't exist, create it:
CREATE DATABASE email_assistant;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE email_assistant TO email_user;

-- If user already exists, you can reset password:
ALTER USER email_user WITH PASSWORD 'your_new_password_here';

-- Exit PostgreSQL
\q
```

### 4. Alternative: Reset Everything (if user/db exist but password is wrong)

```bash
sudo -u postgres psql
```

Then in PostgreSQL:

```sql
-- Drop and recreate user (if needed)
DROP USER IF EXISTS email_user;
CREATE USER email_user WITH PASSWORD 'your_password_here';

-- Drop and recreate database (if needed)
DROP DATABASE IF EXISTS email_assistant;
CREATE DATABASE email_assistant OWNER email_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE email_assistant TO email_user;

\q
```

### 5. Update Your .env File

Make sure your `backend/.env` file has the correct DATABASE_URL:

```bash
cd ~/Documents/Email_project/backend
nano .env
```

The DATABASE_URL should match the password you just set:

```env
DATABASE_URL=postgresql://email_user:your_password_here@localhost:5432/email_assistant
```

**Important:** Replace `your_password_here` with the actual password you used when creating the user.

### 6. Test Database Connection

```bash
# From your backend directory
cd backend

# Test connection with psql
psql postgresql://email_user:your_password_here@localhost:5432/email_assistant

# If it connects successfully, type \q to exit

# Now try starting the server again
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## One-Line Quick Fix (Replace 'your_password' with your actual password)

```bash
sudo -u postgres psql -c "DROP USER IF EXISTS email_user;" -c "CREATE USER email_user WITH PASSWORD 'your_password';" -c "DROP DATABASE IF EXISTS email_assistant;" -c "CREATE DATABASE email_assistant OWNER email_user;" -c "GRANT ALL PRIVILEGES ON DATABASE email_assistant TO email_user;"
```

Then update your `backend/.env` file with the same password in DATABASE_URL.
