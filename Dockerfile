# Copyright (c) 2022, TU Wien
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

ARG REGISTRY=quay.io
ARG OWNER=jupyter
ARG BASE_CONTAINER=$REGISTRY/$OWNER/datascience-notebook
FROM $BASE_CONTAINER

USER root

RUN apt-get update &&\
    apt-get install -yq --no-install-recommends \
    git

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./ /Grader-Labextension

RUN python3 -m pip install /Grader-Labextension
RUN rm -rf /Grader-Labextension

WORKDIR /home/jovyan

USER jovyan
