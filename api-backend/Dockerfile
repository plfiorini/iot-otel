### Stage 1: Build the app

FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc -p tsconfig.json

### Stage 2: Run the app

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy only the built files from the build stage
COPY --from=build /app/dist /app/dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose the application port
EXPOSE 3000

# Start the application
ENTRYPOINT ["node", "/app/dist/index.js"]
