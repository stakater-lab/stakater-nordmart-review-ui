FROM node:17 as builder

LABEL name="Nordmart review" \
  maintainer="Quang <quang@stakater.com"

# set workdir
RUN mkdir -p $HOME/application
WORKDIR $HOME/application

# copy the entire application
COPY . .

# install dependencies
RUN npm ci

# build the application
RUN npm run build

EXPOSE 4200

CMD ["node", "server.js"]
