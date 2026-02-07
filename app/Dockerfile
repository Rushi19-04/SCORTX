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
# Upgrade pip and setuptools, then install numpy explicitly to avoid build from source issues
RUN pip install --upgrade pip setuptools wheel
RUN pip install "numpy<2" 
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
