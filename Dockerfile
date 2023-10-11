# Use an official Node.js runtime as a parent image
FROM public.ecr.aws/o2w3y5h7/node:16.19

# Set the working directory in the container
WORKDIR /microservices

# Copy the current directory contents into the container at /microservices
COPY . /microservices

# Remove the node_modules directory (if it exists)
RUN rm -rf node_modules

# Install any needed packages specified in package.json
RUN npm install

# Make port 7000 available to the world outside this container
#EXPOSE 8081


# Define the command to run your application
CMD [ "node", "server.js" ]

