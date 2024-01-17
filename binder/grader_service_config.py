import os

from grader_service.autograding.local_grader import LocalAutogradeExecutor

c.GraderService.service_host = "127.0.0.1"

c.JupyterHubGroupAuthenticator.hub_api_url = "http://127.0.0.1:8081/hub/api"

c.LocalAutogradeExecutor.relative_input_path = "convert_in"
c.LocalAutogradeExecutor.relative_output_path = "convert_out"

c.RequestHandlerConfig.autograde_executor_class = LocalAutogradeExecutor
