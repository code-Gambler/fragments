# This is Dockerfile, which has all the information about about creating
# and hosting our fragments service inside a container.
# The link to the documentation - https://docs.docker.com/engine/reference/builder/

# Stage 0: Install base Dependencies
# Use node version 20.11.0
FROM node:20.11.0@sha256:7bf4a586b423aac858176b3f683e35f08575c84500fbcfd1d433ad8568972ec6 as dependencies

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY --chown=node:node package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci

#####################################################################################

# Stage 1: Deploy the app
FROM node:20.11-alpine3.18@sha256:a02826c7340c37a29179152723190bcc3044f933c925f3c2d78abb20f794de3f as deploy

LABEL maintainer="Steven David Pillay <stevendavidpillay@gmail.com>" \
      description="Fragments node.js microservice"

COPY --from=dependencies /app /app

WORKDIR /app

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Copy src to /app/src/ and transfering the ownership to node
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file and transfering the ownership to node
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

#Changing user to node
USER node

# Start the container by running our server
CMD node src/index.js

# We run our service on port 8080
EXPOSE 8080
