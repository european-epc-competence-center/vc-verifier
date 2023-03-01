#!/bin/bash
set +x
set -e

#METHOD_AND_HOST=https://ssi.eecc.de
METHOD_AND_HOST=http://localhost:3000

echo
cat << EOF
  ____________________________________________________ 
|  ________________________________________________  |
| |                                                | |
| | Open ID for verifiable presentations flow test | |
| |________________________________________________| |
|____________________________________________________|

EOF

echo -e "[...]\t Get presentation request"
echo
PRESENTATION_REQUEST=$(curl -s $METHOD_AND_HOST/api/verifier/openid-presentation-request)
#echo "$PRESENTATION_REQUEST" | jq

PRESENTATION_DEF_ID=$(echo "$PRESENTATION_REQUEST" | jq -r '.presentation_definition_id')

REQUEST_URI=$(echo "$PRESENTATION_REQUEST" | jq -r '.request_uri')
REQUEST_URI=${REQUEST_URI##*=}
REQUEST_URI=$METHOD_AND_HOST${REQUEST_URI#https://ssi.eecc.de}

echo -e "[...]\t Resolving REQUEST_URI=$REQUEST_URI"
echo

REQUEST_DEFINITION=$(curl -s $REQUEST_URI)

echo "[OK]\t Request definition received"
echo

echo "$REQUEST_DEFINITION" | jq

REDIRECT_URI=$(echo "$REQUEST_DEFINITION" | jq -r '.redirect_uri')
REDIRECT_URI=$METHOD_AND_HOST${REDIRECT_URI#https://ssi.eecc.de}

echo
echo "[...]\t Sending presentation to $REDIRECT_URI"
echo

VP=$(cat VP.json)
OLD_ID="05c3d636-7c92-4898-80d5-7fd1e081ef5b"
VP=${VP/$OLD_ID/$PRESENTATION_DEF_ID}

PRESENTATIN_ANSWER=$(curl -s -X POST $REDIRECT_URI -H "Content-Type: application/json" --data-binary "$VP")

CHECK_PRESENTATION_PATH=$METHOD_AND_HOST/api/verifier/presentation/$PRESENTATION_DEF_ID
echo "[...]\t Checking status of presentation at $CHECK_PRESENTATION_PATH"
echo

curl -s $CHECK_PRESENTATION_PATH | jq


