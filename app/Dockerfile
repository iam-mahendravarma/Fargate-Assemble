# Use official Node.js image with Alpine for minimal size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the full app
COPY . .

# Disable lint check for production builds
ENV NEXT_DISABLE_ESLINT true

# Build the Next.js app (optional, if using production mode)
RUN npm run build

# Expose only the app port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
