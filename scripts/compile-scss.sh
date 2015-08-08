#!/bin/bash

script_dir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
project_root=${script_dir%/*}

venv_path=${project_root}/venv
css_path=${project_root}/static

${venv_path}/bin/watchmedo shell-command --patterns="*.scss" -R --command="echo 'scss compile'; ${venv_path}/bin/python -mscss < ${css_path}/main.scss > ${css_path}/main.css" .
