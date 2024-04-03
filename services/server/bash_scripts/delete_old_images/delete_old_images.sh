#!/bin/bash

set -e
set -o pipefail

regex=${1:-'prod'}
days_ago=${2:-50}
nth_newest=${3:-5}

# $1 regex
if [[ -z "$regex" ]]; then
  echo "Please provide a regex name as the 1. argument"
  exit 1
fi

# $2 older than days condition
# f.e.: $(echo $(( $(date +%s) - 86400 * 50)))
if ! [[ "$days_ago" =~ ^[0-9]+$ ]]; then 
  echo "Please provide a number as the 2. argument"
  exit 1
fi

# $3 more than n-th newest image condition
if ! [[ "$nth_newest" =~ ^[0-9]+$ ]]; then 
  echo "Please provide a number as the 3. argument"
  exit 1
fi

if [[ $nth_newest -lt 1 ]]; then 
  echo "Please provide a number greater than 0 the 3. argument"
  exit 1
fi

echo "Regex: $regex"
echo "Older than: $days_ago days"
echo "N-th newest: $nth_newest"

if [[ -z "$DOCKERHUB_USERNAME" ]]; then
  echo "Please provide a Docker Hub username as an environment variable"
  exit 1
fi

if [[ -z "$DOCKERHUB_PASSWORD" ]]; then
  echo "Please provide a Docker Hub password as an environment variable"
  exit 1
fi

if [[ -z "$DOCKERHUB_REPO" ]]; then
  echo "Please provide a Docker Hub password as an environment variable"
  exit 1
fi

token=$(curl -s -f -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKERHUB_USERNAME}'", "password": "'${DOCKERHUB_PASSWORD}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)

# don't use process substitution for curl so the error is caught by set -e
images_output=$(curl -s -f -H "Authorization: JWT ${token}" "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}/tags/?page_size=10000" | jq -r '.results|.[]|.name + " " + .last_updated')

while read name last_updated; do
  if [[ $name =~ $regex ]]; then 
    image_names+=("$name")
    image_last_updated_dates+=("$last_updated")
  fi
# use < <() process substitution to avoid subshell so the above image_names and image_last_updated_dates variables are available outside the while loop  
done < <(echo "$images_output")


delete_from_unix_sec=$(date -d "$days_ago days ago" +%s)
i=0
for image_name in ${image_names[@]}; do
  last_updated_unix_sec=$(date -d "${image_last_updated_dates[$i]}" +'%s')
  image_count=$(( i+1 ))

  if [[ $last_updated_unix_sec -lt $delete_from_unix_sec ]] && [[ $image_count -gt $nth_newest ]]; then 
    images_to_delete+=("$image_name")
  fi

  i=$(( i + 1 ))
done

if [[ ${#images_to_delete[@]} -eq 0 ]]; then
  echo "No images to delete"
  exit 0
fi

echo "Images to delete: ${images_to_delete[@]}"

for image_to_delete in ${images_to_delete[@]}; do
  echo "Deleting image: ${image_to_delete}"
  curl -s -f -X DELETE -H "Authorization: JWT ${token}" "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}/tags/${image_to_delete}"
done