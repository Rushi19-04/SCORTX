# Use Mythril's official image as base (guaranteed to work)
FROM mythril/myth:latest

# Switch to root to install other tools
USER root

# Install Python, pip, and git (Mythril image is Alpine based usually or Debian)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    wget \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Solc (Solidity Compiler)
RUN pip3 install solc-select
RUN solc-select install 0.8.20 && solc-select use 0.8.20

# Install Slither (Mythril is already installed!)
# We use --break-system-packages because modern Python environments are strict
RUN pip3 install slither-analyzer --break-system-packages

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
