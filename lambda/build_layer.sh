#!/bin/bash

rm -rf nodejs

# npm install
npm ci

# https://sharp.pixelplumbing.com/install#aws-lambda
rm -rf node_modules/sharp
npm install --os=linux --cpu=x64 sharp
#SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp

# copy files into nodejs directory, which is how Lambda layers likes it
mkdir -p nodejs/nodejs
cp -ir node_modules nodejs/nodejs
