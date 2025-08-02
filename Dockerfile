# Use the official Bun image
FROM oven/bun:1.2.19-slim

# Set working directory
WORKDIR /app

# Install curl
RUN apt-get update && apt-get install -y curl git

# Copy package files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install

# Custom Swagger
RUN bun run swagger:build

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["bun", "start"] 