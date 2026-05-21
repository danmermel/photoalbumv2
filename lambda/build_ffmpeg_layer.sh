#!/bin/bash

# check that a stage parameter is supplied
STAGE=$1
echo "Stage is $STAGE"
if [ -z "$1" ]
  then
    echo "You must supply a stage e.g ./apply production"
    exit 1
fi

# get the current hash of John Van Sickle's latest binaries
CURRENT_ETAG=`curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz.md5`

#get the ETAG of our last creation
aws s3 cp "s3://photoalbumv2-code-${STAGE}/jvs.md5" .
LAST_ETAG=`cat jvs.md5`

# if the JVS hash has changed, we need to download it
if [ "$CURRENT_ETAG" != "$LAST_ETAG" ]
then
  
  echo "Downloading new version of ffmpeg from John Van Sickle"

  # fetch latest ffmpeg binaries from John Van Sickle https://johnvansickle.com/ffmpeg/
  curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz > jvs.tar.xz

  # unpack the tarball
  tar xvf jvs.tar.xz

  # calculate name of the ffmeg... directory that was just unpacked
  # ls -d */ gets a list of directory names 
  # and then we grep for the ones beginning with ffmpeg e.g "ffmpeg-4.4-amd64-static/"
  JVSDIR=`ls -d */ | grep ^ffmpeg`
  echo "unpacked directory is ${JVSDIR}"

  # make directories for the layer zips
  mkdir -p ffmpeg/bin

  # copy the executables into the new dirs
  cp "${JVSDIR}ffmpeg" ffmpeg/bin/

  # remove working directories
  rm jvs.tar.xz
  rm -rf "${JVSDIR}"

  # write the value of the etag to a file and uplaod it to s3
  echo "$CURRENT_ETAG" > jvs.md5
  aws s3 cp jvs.md5 "s3://photoalbumv2-code-${STAGE}" 

else
  echo "John Van Sickle's latest version is the same as we download last time"
  if [ ! -d ffmpeg ]
  then
    echo "Downloading ffmpeg from s3"
    aws s3 cp "s3://photoalbumv2-code-${STAGE}/ffmpeg-${STAGE}.zip" .
    mkdir ffmpeg
    cd ffmpeg
    unzip ../ffmpeg-${STAGE}.zip
    cd ..
  fi
fi