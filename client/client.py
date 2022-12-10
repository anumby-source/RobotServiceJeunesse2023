import requests

r = requests.get("http://192.168.4.1:80/capture")
file = open("capture.jpg", "wb")
file.write(r.content)
file.close()
print("Photo prise")
