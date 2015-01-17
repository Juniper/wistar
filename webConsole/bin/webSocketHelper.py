#!/usr/bin/env python

import sys
import os
import subprocess

first = sys.argv[1]
second = sys.argv[2]


path = os.path.abspath(os.path.dirname(__file__))

ws = os.path.join(path, "websockify.py")

print str(ws)

os.system(ws + " " + first + " " + second + " &")

