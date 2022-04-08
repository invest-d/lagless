#!/bin/bash

CMDNAME=`basename $0`

while getopts f:e:t: OPT
do
    case $OPT in
        "f" ) RECEIVED_FUNC_NAME="TRUE" ; FUNC="$OPTARG" ;;
        "e" ) RECEIVED_ENTRY_POINT="TRUE" ; ENTRY="$OPTARG" ;;
        "t" ) RECEIVED_TRIGGER="TRUE" ; TRIGGER="" ;;
        * ) echo "Usage: $CMDNAME -f FUNCNAME -e ENTRYPOINT" 1>&2
            exit 1 ;;
    esac
done
if [ ! "$RECEIVED_FUNC_NAME" = "TRUE" ]; then
    echo 'no function name specified.'
    exit 1
fi
if [ ! "$RECEIVED_ENTRY_POINT" = "TRUE" ]; then
    echo 'no entry point specified.'
    exit 1
fi
if [ ! "$RECEIVED_TRIGGER" = "TRUE" ]; then
    TRIGGER="--trigger-http"
fi

CURRENT_PROJECT=$(gcloud config get-value project)

[ X$CURRENT_PROJECT != Xlagless ] && echo configure gcloud to lagless. && exit 1

pushd $(pwd)/functions
gcloud beta functions deploy $FUNC --region us-central1 --entry-point=$ENTRY $TRIGGER --runtime=nodejs10
popd
