/* SERVICIO DE CLIMA
 * Este archivo concentra la consulta externa y publica funciones reutilizables
 * en window para que app.js y route-card.js no tengan que repetirla. */
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = 'd57d5462ba86429e2cac9628d82e0c10';
const CIUDAD_SEDE_FIJA = 'Bucaramanga';

// Lista local que llena el datalist del formulario; no requiere consultar internet.
const CIUDADES_COLOMBIA = [
  'Bucaramanga',
  'Floridablanca',
  'Girón',
  'Piedecuesta',
  'San Gil',
  'Barrancabermeja',
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Cúcuta',
  'Manizales',
  'Pereira',
  'Ibagué'
];

/**
 * Convierte el código técnico devuelto por OpenWeather a un emoji visible.
 */
function getWeatherIcon(ico) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '🌤️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  // Si llega un código desconocido, se utiliza un icono neutral como respaldo.
  return iconMap[ico] || '🌤️';
}

/**
 * Consulta OpenWeather y devuelve siempre un objeto con el mismo formato,
 * incluso si la consulta falla. Así la interfaz no necesita casos especiales.
 */
async function fetchCityWeather(cityName) {
  // Se protege contra valores vacíos, null o espacios adicionales.
  const ciudad = (cityName || '').trim();

  if (!ciudad) {
    return {
      ciudad: 'Sin ciudad',
      temperatura: '--',
      descripcion: 'Sin información',
      icono: '🌤️',
      fallback: true
    };
  }

  try {
    /* encodeURIComponent hace segura la ciudad para una URL. units=metric pide
     * grados Celsius y lang=es solicita la descripción en español. */
    const url = `${WEATHER_API_BASE_URL}?q=${encodeURIComponent(ciudad + ',co')}&units=metric&lang=es&appid=${OPENWEATHER_API_KEY}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error('Ciudad no encontrada o error de API');
    }

    // La respuesta HTTP se transforma de JSON a un objeto JavaScript.
    const data = await respuesta.json();

    return {
      ciudad: data.name || ciudad,
      // ?. y ?? permiten leer datos opcionales sin provocar errores.
      temperatura: Math.round(data.main?.temp ?? 0),
      descripcion: data.weather?.[0]?.description || 'Sin información',
      icono: getWeatherIcon(data.weather?.[0]?.icon || '01d'),
      fallback: false
    };
  } catch (error) {
    console.warn(`Error al consultar clima para ${ciudad}:`, error.message);
    return {
      ciudad,
      temperatura: '--',
      descripcion: 'Clima no disponible',
      icono: '🌤️',
      fallback: true
    };
  }
}

/**
 * Llena el <datalist> asociado al input de ciudad. El navegador muestra estas
 * opciones como sugerencias mientras el usuario escribe.
 */
function inicializarAutocompletarCiudades(datalistId = 'lista-ciudades-colombia') {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;

  datalist.innerHTML = '';
  CIUDADES_COLOMBIA.forEach((ciudad) => {
    const option = document.createElement('option');
    option.value = ciudad;
    datalist.appendChild(option);
  });
}

/**
 * Escribe los datos recibidos en los elementos del dashboard identificados por id.
 */
function updateMainWeatherPanel(weatherData) {
  const ciudadEl = document.getElementById('ciudad-clima');
  const tempEl = document.getElementById('temp-clima');
  const descEl = document.getElementById('desc-clima');
  const iconEl = document.getElementById('icono-clima');
  const fechaEl = document.getElementById('fecha-clima');
  const horaEl = document.getElementById('hora-clima');

  if (!ciudadEl || !tempEl || !descEl || !iconEl || !fechaEl || !horaEl) return;

  ciudadEl.textContent = weatherData.ciudad;
  tempEl.textContent = `${weatherData.temperatura}°C`;
  descEl.textContent = weatherData.descripcion;
  iconEl.src = 'assets/icos/clima.png';
  iconEl.alt = 'Clima: ' + weatherData.descripcion;

  // Fecha y hora se toman del dispositivo del usuario y se formatean para Colombia.
  const ahora = new Date();
  fechaEl.textContent = `📅 ${ahora.toLocaleDateString('es-CO')}`;
  horaEl.textContent = `⏰ ${ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Carga el clima inicial de la ciudad sede y después pinta el panel principal.
 */
async function initMainWeather() {
  const climaActual = await fetchCityWeather(CIUDAD_SEDE_FIJA);
  updateMainWeatherPanel(climaActual);
}

/* Funciones expuestas para que scripts cargados después puedan usarlas. El orden
 * de los <script> en index.html garantiza que estén disponibles antes de app.js. */
window.fetchCityWeather = fetchCityWeather;
window.initMainWeather = initMainWeather;
window.updateMainWeatherPanel = updateMainWeatherPanel;
window.inicializarAutocompletarCiudades = inicializarAutocompletarCiudades;
