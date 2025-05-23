# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . .

# Build the project
RUN yarn build

# By default, run the server as specified by the smithery.yaml configuration
CMD ["node", "dist/index.js"]
