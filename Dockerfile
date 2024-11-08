FROM node:22-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies separately
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the app
CMD ["npm", "start"]