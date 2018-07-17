#!/bin/bash

rm -r cov
mkdir cov

# Instrument code
echo "{}" > cov/report.json
coverjs --recursive lib/ index.js -o cov/ -t node --result cov/report.json

# Run tests
cp -r test cov/test
tape cov/test/*.js

# Generate coverage report
cat cov/report.json | coverjs-report -r html > cov/report.html
echo "Coverage report written to cov/report.html"
