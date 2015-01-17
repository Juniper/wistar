#!/bin/bash

echo $0
first=$1
second=$2

./websockify.py $first $second &
