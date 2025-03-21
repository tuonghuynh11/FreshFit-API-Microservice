# Front-end Dockerfile
# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /fitness-web

# Copy package.json and package-lock.json into the directory
COPY ./fitness-web_old/package*.json ./

# Install any needed packages specified in package.json
RUN npm install --force

# Bundle app source inside Docker image (by copying from your local directory)
COPY ./fitness-web_old .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["npm","run", "start"]