#!/bin/bash

CURRENT_PROJECT=$(gcloud config get-value project)

[ X$CURRENT_PROJECT != Xlagless ] && echo configure gcloud to lagless. && exit 1

pushd $(pwd)/functions
gcloud beta functions deploy zengin_dev --region asia-northeast1 --entry-point=zengin --trigger-http --runtime=nodejs14
popd

