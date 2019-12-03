# BASE NODE *******************************************************************

FROM alpine:latest AS base

# Install node
RUN apk add --no-cache g++ make nodejs-current npm python python3

# Install global node packages
RUN npm i -g typescript ts-node

# Set working directory
WORKDIR /root/instavous

# Copy project file
COPY package.json .

# DEPENDENCIES ****************************************************************

FROM base AS dependencies

# Install node packages
RUN npm set progress=false && npm config set depth 0

# Install all node_modules
RUN npm i

# RELEASE *********************************************************************

FROM base AS release

# copy node_modules
COPY --from=dependencies /root/instavous/node_modules ./node_modules

# copy app sources
COPY . .

# define CMD
CMD npm run start
