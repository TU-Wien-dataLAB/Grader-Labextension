# Copyright (c) 2022, TU Wien
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.
import functools
from http.client import responses
import json
import traceback
from typing import Optional, Awaitable

from tornado import httputil
from tornado.web import HTTPError

from grader_labextension.api.models.error_message import ErrorMessage
from grader_labextension.services.request import RequestService
from jupyter_server.base.handlers import APIHandler
import os
from tornado.httpclient import HTTPClientError, HTTPResponse
from traitlets.config.configurable import SingletonConfigurable
from traitlets.traitlets import Unicode


def cache(max_age: int):
    if max_age < 0:
        raise ValueError("max_age must be larger than 0!")

    def wrapper(handler_method):
        @functools.wraps(handler_method)
        async def request_handler_wrapper(self: "ExtensionBaseHandler", *args, **kwargs):
            self.set_header("Cache-Control", f"max-age={max_age}, must-revalidate, private")
            return await handler_method(self, *args, **kwargs)

        return request_handler_wrapper

    return wrapper


class HandlerConfig(SingletonConfigurable):
    hub_api_url = Unicode(os.environ.get("JUPYTERHUB_API_URL"), help="The url of the hubs api.").tag(config=True)
    hub_api_token = Unicode(os.environ.get("JUPYTERHUB_API_TOKEN"),
                            help="The authorization token to access the hub api").tag(config=True)
    hub_user = Unicode(os.environ.get("JUPYTERHUB_USER"), help="The user name in jupyter hub.").tag(config=True)
    service_base_url = Unicode(
        os.environ.get("GRADER_BASE_URL", "/services/grader"),
        help="Base URL to use for each request to the grader service",
    ).tag(config=True)
    lectures_base_path = Unicode(
        "lectures",
        help="The path in each user home directory where lecture directories are created."
    ).tag(config=True)


class ExtensionBaseHandler(APIHandler):
    """
    BaseHandler for all server-extension handler
    """

    def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
        pass

    def set_service_headers(self, response: HTTPResponse):
        for header in response.headers.get_list("Cache-Control"):
            self.set_header("Cache-Control", header)

    request_service = RequestService.instance()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, *kwargs)
        self.root_dir = os.path.expanduser(
            os.path.join(self.settings["server_root_dir"], HandlerConfig.instance().lectures_base_path)
        ).rstrip("/")

    @property
    def service_base_url(self):
        return HandlerConfig.instance().service_base_url

    @property
    def grader_authentication_header(self):
        """Returns the authentication header

        :return: authentication header
        :rtype: dict
        """

        return dict(Authorization="Token " + HandlerConfig.instance().hub_api_token)

    @property
    def user_name(self):
        return self.current_user['name']

    async def get_lecture(self, lecture_id) -> dict:
        try:
            lecture = await self.request_service.request(
                "GET",
                f"{self.service_base_url}/lectures/{lecture_id}",
                header=self.grader_authentication_header,
            )
            return lecture
        except HTTPClientError as e:
            self.log.error(e.response)
            raise HTTPError(e.code, reason=e.response.reason)

    async def get_assignment(self, lecture_id, assignment_id):
        try:
            assignment = await self.request_service.request(
                "GET",
                f"{self.service_base_url}/lectures/{lecture_id}/assignments/{assignment_id}",
                header=self.grader_authentication_header,
            )
            return assignment
        except HTTPClientError as e:
            self.log.error(e.response)
            raise HTTPError(e.code, reason=e.response.reason)
        
    def write_error(self, status_code, **kwargs):
            """APIHandler errors are JSON, not human pages"""
            self.set_header("Content-Type", "application/json")
            message = responses.get(status_code, "Unknown HTTP Error")
            reply: dict = {
                "message": message,
            }
            exc_info = kwargs.get("exc_info")
            if exc_info:
                e = exc_info[1]
                if isinstance(e, HTTPError):
                    reply["message"] = e.log_message or message
                    reply["reason"] = e.reason
                else:
                    reply["message"] = "Unhandled error"
                    reply["reason"] = None
                    reply["traceback"] = "".join(traceback.format_exception(*exc_info))
            self.log.warning("wrote error: %r", reply["message"], exc_info=True)
            self.finish(json.dumps(reply))