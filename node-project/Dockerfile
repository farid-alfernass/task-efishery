FROM node:14

RUN mkdir -p /usr/src/app

# Set Working Directory
WORKDIR /usr/src/app

# Copy Node Packages Requirement
# COPY package*.json ./

# Install Node Modules Based On Node Packages Requirement
COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install

# Expose Application Port
EXPOSE 9001

# Run The Application
CMD ["npm", "start"]