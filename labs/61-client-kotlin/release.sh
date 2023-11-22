#!/usr/bin/env bash
if [ ! -z "$1" ]; then
   VERSION=$1
else
   VERSION=last
fi
SOURCE_BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
APP_NAME=lambdaorm-client-kotlin-lab

# Only execute release from develop branch
if [ $SOURCE_BRANCH == 'develop' ]; then
    # push to current branch
    git add .
    git commit -m "v${VERSION}"
    git tag "v${VERSION}" -m "new version"
    git push
    # create branch release and push image
    git checkout -b release
    gradle clean build
    docker login -u flaviorita -p $DOCKER_IO_PWD
    docker build -t flaviorita/${APP_NAME}:${VERSION} .
    docker push flaviorita/${APP_NAME}:${VERSION}
    git push --set-upstream origin release
    # merge main branch
    git checkout main
    git pull
    git merge release
    git push
    # merge source branch
    git checkout ${SOURCE_BRANCH}
    git pull
    git merge release
    git push
    # remove branch release local and remote
    git branch -d release
    git push origin --delete release
else
    echo "Error: The release must be executed from the develop branch and not from the ${SOURCE_BRANCH} branch."
    exit -1
fi;
