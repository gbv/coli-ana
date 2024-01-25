#!/bin/bash

# We need to rebuild the front-end if $BASE changed

base_file=dist/.base

if [[ -e $base_file && "$BASE" == "$(cat $base_file)" ]] || [[ ! -e $base_file && "$BASE" == "" ]]; then
  echo "Front-end rebuild skipped."
else
  echo "Rebuilding front-end because \$BASE changed to $BASE..."
  # Build the site
  npm run build
  # Remember the current $BASE
  echo "$BASE" > $base_file
fi
