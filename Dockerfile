# Copyright (c) 2022, TU Wien
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

FROM jupyter/scipy-notebook

USER root

RUN apt-get update &&\
    apt-get install -yq --no-install-recommends \
    git

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# INSTALL grader-service
COPY ./grader_labextension /grader_labextension
COPY ./grader_convert /grader_convert

RUN python3 -m pip install /grader_labextension

USER jovyanFROM ubuntu:latest
LABEL authors="matthiasmatt"

ENTRYPOINT ["top", "-b"]
