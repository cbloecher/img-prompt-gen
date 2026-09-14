#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HOST = "127.0.0.1"
PORT = 8080

print(f"img-prompt-gen: http://{HOST}:{PORT}")
ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler).serve_forever()
