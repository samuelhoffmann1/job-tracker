# Step 1: Use official Node.js image
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy all source files
COPY . .

# Step 6: Build Next.js app
RUN npm run build

# Step 7: Expose port your Next.js server will listen on (default 3000)
EXPOSE 3000

# Step 8: Start Next.js production server
CMD ["npm", "start"]
