// Incluimos las librerías necesarias
#include "DHT.h"

// Definimos el pin donde está conectado el sensor DHT11
#define DHTPIN 2
// Definimos el tipo de sensor DHT
#define DHTTYPE DHT11

// Inicializamos el sensor DHT
DHT dht(DHTPIN, DHTTYPE);

// Definimos el pin donde está conectado el sensor de luz (LDR)
#define LDRPIN A0

void setup() {
  // Iniciamos la comunicación serial a 9600 baudios.
  // Es muy importante que esta velocidad coincida con la del script de Python.
  Serial.begin(9600);
  
  // Iniciamos el sensor DHT
  dht.begin();
  
  Serial.println("Nodo sensor inicializado. Enviando datos...");
}

void loop() {
  // Esperamos 2 segundos entre lecturas para no saturar el sensor
  delay(2000);

  // Leemos la humedad y la temperatura del DHT11
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature(); // en Celsius

  // --- INICIO DE LA MODIFICACIÓN ---
  
  // 1. Leemos el valor analógico ORIGINAL del sensor de luz (0-1023)
  //    Este valor es inverso: más luz = número bajo.
  int valorLuzOriginal = analogRead(LDRPIN);
  
  // 2. Usamos la función map() para INVERTIR el valor.
  //    Mapeamos el rango de entrada [0 a 1023] a un rango de salida [1023 a 0].
  //    Ahora, más luz dará un número alto, que es lo que queremos.
  int luz = map(valorLuzOriginal, 0, 1023, 1023, 0);

  // --- FIN DE LA MODIFICACIÓN ---


  // Verificamos si las lecturas son válidas (a veces el DHT falla)
  if (isnan(humedad) || isnan(temperatura)) {
    Serial.println("Error al leer del sensor DHT!");
    return; // Salimos de la función si hay error
  }

  // Creamos la cadena de texto con los datos, usando el valor de 'luz' ya corregido.
  // El resto (temperatura y humedad) no se ha tocado.
  String dataString = "T:" + String(temperatura) + ",H:" + String(humedad) + ",L:" + String(luz);

  // Enviamos la cadena de datos a la computadora a través del puerto serial.
  Serial.println(dataString);
}