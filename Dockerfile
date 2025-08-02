# Use the official Bun image
FROM oven/bun:1.2.14-slim

# Set working directory
WORKDIR /app

# Install curl
RUN apt-get update && apt-get install -y curl

# Copy package files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["bun", "start"] 