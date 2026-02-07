# Use Python 3.10 as base (compatible with latest tools)
FROM python:3.10-slim

# Install system dependencies including git (for pip install from git) and basic build tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Solc (Solidity Compiler)
# Using solc-select to manage versions, installing a common version default
RUN pip install solc-select
RUN solc-select install 0.8.20 && solc-select use 0.8.20

# Install Security Tools
# Upgrade pip and setuptools to avoid distutils errors with newer packages
RUN pip install --upgrade pip setuptools wheel
RUN pip install slither-analyzer mythril

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default Flask port)
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
