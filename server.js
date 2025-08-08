const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware para permitir JSON y CORS (para que el frontend se pueda conectar)
app.use(express.json());
app.use(cors());

// Almacenamiento en memoria. Para un proyecto real usaríamos una base de datos.
// Guardaremos los últimos 100 registros.
let sensorDataHistory = [];
const MAX_HISTORY = 100;

// Ruta para recibir los datos desde el script de Python (POST)
app.post('/data', (req, res) => {
  const newData = {
    ...req.body,
    timestamp: new Date().toISOString() // Agregamos una marca de tiempo
  };

  console.log('Datos recibidos:', newData);

  // Agregamos los nuevos datos al historial
  sensorDataHistory.push(newData);

  // Mantenemos el historial con un tamaño máximo
  if (sensorDataHistory.length > MAX_HISTORY) {
    sensorDataHistory.shift(); // Elimina el elemento más antiguo
  }

  // Respondemos con éxito
  res.status(200).json({ message: 'Datos recibidos correctamente' });
});

// Ruta para que el dashboard pida los datos (GET)
app.get('/data', (req, res) => {
  res.json(sensorDataHistory);
});

// Iniciamos el servidor para que escuche en TODAS las interfaces de red, incluyendo IPv6
// '::' es el equivalente a '0.0.0.0' pero para IPv4 e IPv6.
app.listen(PORT, '::', () => {
  console.log(`Servidor escuchando en http://[::1]:${PORT}`);
  console.log('El servidor está listo para aceptar conexiones IPv4 e IPv6.');
});