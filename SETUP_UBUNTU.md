# Setup Instructions for Ubuntu

## Prerequisites

Make sure you have the following installed:
- Python 3.11+ (`python3 --version`)
- uv (Python package manager)
- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- PostgreSQL (`psql --version`)

If you need to install them:

```bash
# Python 3
sudo apt update
sudo apt install python3

# uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Node.js 18+ (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib
```

## Database Setup

1. Create a PostgreSQL user and database:

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE email_assistant;
CREATE USER email_user WITH PASSWORD 'your_password_here';
ALTER ROLE email_user SET client_encoding TO 'utf8';
ALTER ROLE email_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE email_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE email_assistant TO email_user;
\q
```

2. Note your database connection string:
```
postgresql://email_user:your_password_here@localhost:5432/email_assistant
```

## Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install Python dependencies with uv (automatically creates virtual environment):

```bash
uv sync
```

3. Create a `.env` file in the backend directory:

```bash
nano .env
```

Add the following (replace with your actual values):

```env
DATABASE_URL=postgresql://email_user:your_password_here@localhost:5432/email_assistant
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here_change_this_in_production
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_smtp_password
CORS_ORIGINS=["http://localhost:3000"]
```

4. Create the uploads directory:

```bash
mkdir -p uploads
```

5. Run the FastAPI server:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## Frontend Setup

1. Open a new terminal window (keep the backend running), navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```bash
nano .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the Next.js development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Both Services

To run both services simultaneously, you have two options:

### Option 1: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Background Process (Single Terminal)

**Start Backend in Background:**
```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

To stop the background backend process:
```bash
pkill -f "uvicorn app.main:app"
```

## Quick Start Summary

```bash
# 1. Database (one-time setup)
sudo -u postgres psql -c "CREATE DATABASE email_assistant;"
sudo -u postgres psql -c "CREATE USER email_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE email_assistant TO email_user;"

# 2. Backend
cd backend
uv sync
# Create .env file with your settings
mkdir -p uploads
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend (in new terminal)
cd frontend
npm install
# Create .env.local file
npm run dev
```

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

### Port Already in Use

If port 8000 or 3000 is already in use:
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill the process
sudo kill -9 <PID>

# Or use different ports
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Python Dependencies Issues

If you have issues with uv:
```bash
# Make sure you're using Python 3.11+
python3 --version

# Reinstall uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clear uv cache and reinstall
uv cache clean
rm -rf .venv
uv sync
```

### Node.js Issues

If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```
