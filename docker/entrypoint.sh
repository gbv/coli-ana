#!/bin/bash

# Build site in background
bash build.sh &

pm2-runtime ecosystem.config.json
