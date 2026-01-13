import os
import sys

# Ensure the project directory is in the path
sys.path.append(os.path.dirname(__file__))

from room_finder.wsgi import application
app = application
