
# MicroPython boot.py - Access Point Web Server

try:
  import usocket as socket
except:
  import socket

import network

station = network.WLAN(network.AP_IF)
station.active(True)
station.config(essid='RCO')
station.config(authmode=3,password='12345678')

while station.isconnected() == False:
  pass

print('Connection successful')
print(station.ifconfig())

def web_page(request):
  
  fans_state = ""
  if request.find('/?forward') > 0:
    fans_state="Going Forward"
  if request.find('/?Stopped') > 0:
    fans_state="Stopped" 
  
  html = """<html><head> <title>SJ23& Web Server</title> 
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,"> <style>
  html{font-family: Helvetica; display:inline-block; margin: 0px auto; text-align: center;}
  h1{color: #0F3376; padding: 2vh;}p{font-size: 1.5rem;}
  .button{display: inline-block; background-color: #e7bd3b; border: none; 
  border-radius: 4px; color: white; text-decoration: none; font-size: 30px; width:100%}
  </style></head>
  <body> <h1>SJ23 Web Server</h1> 
  <p>AUTO : <strong>""" + fans_state + """</strong></p>
  <p><a href='/?forward'><button class="button">Forward</button></a></p>
  <p><a href='/?stop'><button class="button button">STOP</button></a></p>
  
  </body></html>"""
  
  return html

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 80))
s.listen(5)

while True:
  conn, addr = s.accept()
  print('Got a connection from %s' % str(addr))
  request = conn.recv(1024)
  request = str(request)
  print('The Content = %s' % request)
  response = web_page(request)
  conn.send(response)
  conn.close()
