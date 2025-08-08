import serial
import requests
import time
import json

# --- CONFIGURACIÓN ---
# Revisa en el IDE de Arduino qué puerto COM usa tu placa (ej: 'COM3' en Windows, '/dev/ttyUSB0' en Linux)
SERIAL_PORT = 'COM3'  # <--- ¡CAMBIA ESTO!
BAUD_RATE = 9600

# Dirección IPv6 de tu servidor backend.
# Si el servidor corre en la misma máquina, usa la dirección de loopback IPv6.
SERVER_IPV6_ADDRESS = '::1' # Loopback IPv6 (localhost)
SERVER_PORT = 3000
SERVER_URL = f"http://[{SERVER_IPV6_ADDRESS}]:{SERVER_PORT}/data"

# --- FIN DE LA CONFIGURACIÓN ---

try:
    # Intentamos conectar con el puerto serial
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Conectado a Arduino en {SERIAL_PORT}")
    time.sleep(2) # Esperamos a que la conexión se estabilice
except serial.SerialException as e:
    print(f"Error al conectar con el puerto serial: {e}")
    exit() # Salimos del script si no podemos conectar

print("Iniciando puente de comunicación. Presiona CTRL+C para detener.")

while True:
    try:
        # Leemos una línea de datos desde el Arduino
        line = arduino.readline().decode('utf-8').strip()

        if line:
            print(f"Dato recibido de Arduino: {line}")
            
            # Parseamos la cadena: "T:25.50,H:60.00,L:850"
            parts = line.split(',')
            data = {}
            for part in parts:
                key_value = part.split(':')
                if len(key_value) == 2:
                    key = key_value[0]
                    value = float(key_value[1])
                    if key == 'T':
                        data['temperature'] = value
                    elif key == 'H':
                        data['humidity'] = value
                    elif key == 'L':
                        data['light'] = value
            
            # Si tenemos los 3 datos, los enviamos al servidor
            if 'temperature' in data and 'humidity' in data and 'light' in data:
                print(f"Enviando al servidor: {data}")
                
                try:
                    # Hacemos la petición POST al servidor con un timeout
                    response = requests.post(SERVER_URL, json=data, timeout=5)
                    print(f"Respuesta del servidor: {response.status_code}")
                except requests.exceptions.RequestException as e:
                    print(f"Error al enviar datos al servidor: {e}")

    except KeyboardInterrupt:
        print("\nDeteniendo el script.")
        break
    except Exception as e:
        print(f"Ocurrió un error: {e}")
        time.sleep(5) # Esperamos antes de reintentar

# Cerramos la conexión serial al salir
arduino.close()
print("Conexión con Arduino cerrada.")