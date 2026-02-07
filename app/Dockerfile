# Use Mythril's official image as base
FROM mythril/myth:latest

# Switch to root to install other tools
USER root

# Install Python3, pip, git, and venv
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
# We install this globally as it's a standalone binary manager
RUN pip3 install solc-select --break-system-packages
RUN solc-select install 0.8.20 && solc-select use 0.8.20

# Install Slither in a separate virtual environment to avoid "Dependency Hell" with Mythril
RUN python3 -m venv /opt/slither-env
RUN /opt/slither-env/bin/pip install slither-analyzer
# Add Slither to PATH
ENV PATH="/opt/slither-env/bin:$PATH"

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default Flask port)
EXPOSE 5000

# Override the base image's ENTRYPOINT (which is likely "myth") so we can run our own command
ENTRYPOINT []

# Start the Flask app
CMD ["python3", "app.py"]

# Run the application
CMD ["python", "app.py"]
