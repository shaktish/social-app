# use official node.js 20 alpine linux as base image
FROM node:20.18.1-alpine 
# Set working directory
WORKDIR /usr/src/app
# Copy dependency definitions
COPY package*.json ./
# Install only production dependencies (you can remove `--only=production` if you need devDeps for build)
RUN npm ci --omit=dev
# Copy rest of the app source code
COPY . . 
# Build the TypeScript code
RUN npm run build
# Expose the app port (change as per your Express app)
EXPOSE 5010 
# Run the compiled JavaScript output
CMD ["node", "dist/server.js"]