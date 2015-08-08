#!/bin/bash

venv_path=./venv

${venv_path}/bin/watchmedo shell-command --patterns="*.py" -D -R --drop --command="${venv_path}/bin/nosetests -v" .
