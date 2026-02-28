# Use official Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port (change if different)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]