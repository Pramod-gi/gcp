#!/bin/bash

# Use gcloud CLI to fetch the repository name from Artifact Registry
REPOSITORY_NAME=$(gcloud artifacts repositories list --location=$LOCATION --format="value(name)")

echo $REPOSITORY_NAME

# Export the REPOSITORY_NAME as an environment variable
# export REPOSITORY_NAME
ENV REPOSITORY_NAME=$REPOSITORY_NAME


chmod +x set_repo_name.sh
