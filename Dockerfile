# Use the official Bun image
FROM oven/bun:1.2.14-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install

# Build the CSS
RUN bun run build:css

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["bun", "start"] 