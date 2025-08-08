// --- CONFIGURACIÓN ---
// Dirección IPv6 de tu servidor backend.
// Si el servidor corre en la misma máquina, usa la dirección de loopback IPv6.
const SERVER_IPV6_ADDRESS = '::1'; // Loopback IPv6 (localhost)
const SERVER_PORT = 3000;
const API_URL = `http://[${SERVER_IPV6_ADDRESS}]:${SERVER_PORT}/data`;
// --- FIN DE LA CONFIGURACIÓN ---


// Función para formatear la fecha y hora
const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    }).format(date);
}

// Obtener elementos del DOM
const lastUpdateSpan = document.getElementById('last-update');
const tempHumCtx = document.getElementById('tempHumChart').getContext('2d');
const lightCtx = document.getElementById('lightChart').getContext('2d');

// Crear los gráficos con configuración inicial
const tempHumChart = new Chart(tempHumCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperatura (°C)',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                yAxisID: 'y'
            },
            {
                label: 'Humedad (%)',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                yAxisID: 'y1'
            }
        ]
    },
    options: {
        scales: {
            x: { type: 'time', time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } } },
            y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '°C' } },
            y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: '%' }, grid: { drawOnChartArea: false } }
        }
    }
});

const lightChart = new Chart(lightCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Nivel de Luz (0-1023)',
            data: [],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderWidth: 2
        }]
    },
    options: { scales: { x: { type: 'time', time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } } } } }
});

// Función para actualizar los gráficos con nuevos datos
function updateCharts(data) {
    // Extraemos las etiquetas (timestamps) y los datos de cada sensor
    const labels = data.map(d => new Date(d.timestamp));
    const tempData = data.map(d => d.temperature);
    const humData = data.map(d => d.humidity);
    const lightData = data.map(d => d.light);

    // Actualizamos el primer gráfico
    tempHumChart.data.labels = labels;
    tempHumChart.data.datasets[0].data = tempData;
    tempHumChart.data.datasets[1].data = humData;
    tempHumChart.update();
    
    // Actualizamos el segundo gráfico
    lightChart.data.labels = labels;
    lightChart.data.datasets[0].data = lightData;
    lightChart.update();
}

// Función para obtener datos del servidor
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error en la red: ${response.statusText}`);
        }
        const data = await response.json();
        
        if(data.length > 0) {
            updateCharts(data);
            lastUpdateSpan.textContent = formatTimestamp(new Date());
        }

    } catch (error) {
        console.error('No se pudieron obtener los datos:', error);
        lastUpdateSpan.textContent = `Error - ${new Date().toLocaleTimeString()}`;
    }
}

// Bucle principal: obtener datos cada 3 segundos
setInterval(fetchData, 3000);

// Carga inicial
fetchData();