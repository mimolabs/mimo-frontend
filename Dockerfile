FROM node:6

MAINTAINER MIMO!

# WORKDIR /opt/app/dist

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN \
  cd /tmp && \
  npm install -g bower grunt-cli && \
  npm install --production && \
  mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

ADD . /opt/app

RUN ls && pwd && bower install --config.interactive=false --allow-root && grunt build

EXPOSE 8080

CMD ["node", "server/app.js"]
