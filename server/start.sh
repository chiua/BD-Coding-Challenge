#!/bin/bash

cd /user/src/app

while ! curl http://elasticsearch:9200; do sleep 1; done;

pm2-docker server.js --watch
