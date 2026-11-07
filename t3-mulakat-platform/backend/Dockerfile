# Production image, copy all the files and run next
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy all files
COPY . .

# Install only production dependencies
RUN npm install --only=production --ignore-scripts

# Set environment variables
# ENV REDIS_HOST=my-redis-container
# ENV REDIS_PORT=6379
# ENV REDIS_PASSWORD=''
# ENV REDIS_USERNAME=""

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run your app (adjust if necessary)
CMD ["node", "dist/dist.js"]
