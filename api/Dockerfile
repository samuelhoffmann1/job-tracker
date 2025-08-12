# Step 1: Use an official Node.js image (Node 20 LTS Alpine)
FROM node:20-alpine AS build

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if you have one)
COPY package*.json ./

# Step 4: Install dependencies (including devDependencies)
RUN npm install

# Step 5: Copy the rest of your source code into the container
COPY . .

# Step 6: Build TypeScript files into JavaScript
RUN npm run build

# Step 7: Use a lightweight Node image for production (slim or alpine)
FROM node:20-alpine AS production

# Step 8: Set working directory again
WORKDIR /app

# Step 9: Copy only the built JS files and production dependencies from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Step 10: Expose the port your backend listens on (e.g., 3001)
EXPOSE 3001

# Step 11: Define the command to start your backend server using the compiled JS
CMD ["node", "dist/index.js"]
