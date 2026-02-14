# Use an official Node.js runtime as the base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# This is where we add the cleaning steps before installation
RUN rm -rf node_modules package-lock.json # Remove existing
RUN npm install --legacy-peer-deps         # Install dependencies, --legacy-peer-deps might help with some dependency issues

# Copy the rest of your application code
COPY . .

# Run your build script
RUN npm run build

# Expose the port your application listens on
EXPOSE 8080

# Command to run your application
CMD ["npm", "start"]
