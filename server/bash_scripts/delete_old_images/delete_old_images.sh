#!/bin/bash

branch=${BRANCH:-'prod'}
days_ago=${DAYS_AGO:-50}
nth_newest=${NTH_NEWEST:-5}

# $1 branch
if [[ -z "$branch" ]]; then
  echo "Please provide a branch name as the "BRANCH" environment variable"
  exit 1
fi

# $2 older than days condition
# f.e.: $(echo $(( $(date +%s) - 86400 * 50)))
if ! [[ "$days_ago" =~ ^[0-9]+$ ]]; then 
  echo "Please provide a number as the "DAYS_AGO" environment variable"
  exit 1
fi

# $3 more than n-th newest image condition
if ! [[ "$nth_newest" =~ ^[0-9]+$ ]]; then 
  echo "Please provide a number as the "NTH_NEWEST" environment variable"
  exit 1
fi

if [[ $nth_newest -lt 1 ]]; then 
  echo "Please provide a number greater than 0 the "NTH_NEWEST" environment variable"
  exit 1
fi

echo "Branch: $branch"
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

token=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKERHUB_USERNAME}'", "password": "'${DOCKERHUB_PASSWORD}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
tag_delimiter='-' 

while read name last_updated; do
  if [[ $name =~ ${branch}${tag_delimiter} ]]; then 
    branch_image_names+=("$name")
    branch_image_last_updated_dates+=("$last_updated")
  fi
done < <(curl -s -H "Authorization: JWT ${token}" "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}/tags/?page_size=10000" | jq -r '.results|.[]|.name + " " + .last_updated')

delete_from_unix_sec=$(date -d "$days_ago days ago" +%s)
i=0
for branch_image_name in ${branch_image_names[@]}; do
  last_updated_unix_sec=$(date -d "${branch_image_last_updated_dates[$i]}" +'%s')
  image_count=$(( i+1 ))

  if [[ $last_updated_unix_sec -lt $delete_from_unix_sec ]] && [[ $image_count -gt $nth_newest ]]; then 
    images_to_delete+=("$branch_image_name")
  fi

  ((i++))
done

echo "Images to delete: ${images_to_delete[@]}"

for image_to_delete in ${images_to_delete[@]}; do
  echo "Deleting image: ${image_to_delete}"
  curl -s -X DELETE -H "Authorization: JWT ${token}" "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}/tags/${image_to_delete}"
done

exit 0

