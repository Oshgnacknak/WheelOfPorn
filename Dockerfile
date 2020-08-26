# pull official base image
FROM node:13.12.0-alpine AS client

ENV NODE_ENV=production

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY client/package.json ./
COPY client/yarn.lock ./
RUN yarn install

# build app
COPY client ./
RUN yarn build

FROM node:13.12.0-alpine

ENV NODE_ENV=production

# set working directory
WORKDIR /app

# install app dependencies
COPY server/package.json ./
COPY server/package-lock.json ./
RUN npm install

# run app
COPY server ./
COPY --from=client /app/build ./public
CMD ["node", "index.js"]
