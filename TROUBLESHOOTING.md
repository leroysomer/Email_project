# Troubleshooting Installation Issues on Ubuntu/WSL

## Python 3.13 Compatibility Issues

If you're using Python 3.13, some packages may not have pre-built wheels yet. Here's how to fix it:

### Solution 1: Install System Dependencies (Recommended)

Install the required development libraries:

```bash
# Install PostgreSQL development libraries
sudo apt-get update
sudo apt-get install -y libpq-dev postgresql-client

# Install XML/XSLT development libraries (for lxml)
sudo apt-get install -y libxml2-dev libxslt1-dev

# Install build tools
sudo apt-get install -y build-essential python3-dev
```

Then try installing again:

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Solution 2: Use Python 3.11 or 3.12 (More Stable)

Python 3.13 is very new and some packages don't have wheels yet. Consider using Python 3.11 or 3.12:

```bash
# Remove old venv
cd backend
rm -rf venv

# Create new venv with Python 3.11 (if available)
python3.11 -m venv venv

# Or Python 3.12
python3.12 -m venv venv

# Activate and install
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Solution 3: Upgrade pydantic to Latest Version

If you must use Python 3.13, try upgrading pydantic:

```bash
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install pydantic>=2.10.0 pydantic-settings>=2.6.0
pip install -r requirements.txt
```

## Common Errors and Fixes

### Error: `libpq-fe.h: No such file or directory`

**Fix:**
```bash
sudo apt-get install libpq-dev
```

### Error: `libxslt/xsltconfig.h: No such file or directory`

**Fix:**
```bash
sudo apt-get install libxslt1-dev libxml2-dev
```

### Error: `pydantic-core` build failure with Python 3.13

**Fix:** Either:
1. Use Python 3.11 or 3.12 (recommended)
2. Upgrade pydantic: `pip install --upgrade "pydantic>=2.10.0"`

### Error: Missing gcc or build tools

**Fix:**
```bash
sudo apt-get install build-essential python3-dev
```

## Complete Setup Command Sequence

For Ubuntu/WSL with all dependencies:

```bash
# 1. Install system dependencies
sudo apt-get update
sudo apt-get install -y \
    python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib \
    libpq-dev \
    libxml2-dev libxslt1-dev \
    build-essential \
    nodejs npm

# 2. Create venv with Python 3.11 (more stable)
cd backend
python3.11 -m venv venv
source venv/bin/activate

# 3. Upgrade pip and install
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

## Checking Your Python Version

```bash
python3 --version
```

If it's 3.13, consider using 3.11 or 3.12 for better package compatibility.
