#!/usr/bin/env python
"""
Serveur d'authentification simple pour contourner les problèmes CSRF
Port 8001 pour éviter les conflits
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

class AuthHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/v1/auth/login/':
            # Lire les données POST
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                username = data.get('username')
                password = data.get('password')
                
                # Vérification simple
                if username == 'admin' and password == 'admin123':
                    response = {
                        'access': 'fake_access_token_12345',
                        'refresh': 'fake_refresh_token_12345'
                    }
                    
                    # Headers CORS
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                    self.end_headers()
                    
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    error = {'error': 'Identifiants incorrects'}
                    self.wfile.write(json.dumps(error).encode())
                    
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error = {'error': f'Erreur: {str(e)}'}
                self.wfile.write(json.dumps(error).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        # Gérer les requêtes preflight CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8001), AuthHandler)
    print("Serveur d'authentification temporaire demarre sur http://localhost:8001")
    print("Endpoint: POST http://localhost:8001/api/v1/auth/login/")
    print("Identifiants: admin / admin123")
    server.serve_forever()