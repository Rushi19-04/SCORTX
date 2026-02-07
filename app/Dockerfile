# Use Python 3.9 as base (better compatibility with older tools like Mythril's dependencies)
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Solc (Solidity Compiler)
RUN pip install solc-select
RUN solc-select install 0.8.20 && solc-select use 0.8.20

# Install Security Tools
# DOWNGRADE setuptools to <58 to support "use_2to3" and "distutils" required by old numpy
RUN pip install "setuptools<58.0.0" "wheel"
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
