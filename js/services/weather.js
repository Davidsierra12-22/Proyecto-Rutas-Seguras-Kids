const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = 'd57d5462ba86429e2cac9628d82e0c10';
const CIUDAD_SEDE_FIJA = 'Bucaramanga';

// Lista local para autocompletar (Bucaramanga, Santander y principales de Colombia)
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
 * Convierte el código de icono de OpenWeather a emoji
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
  return iconMap[ico] || '🌤️';
}

/**
 * Consulta la API de OpenWeather para una ciudad específica
 */
async function fetchCityWeather(cityName) {
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
    const url = `${WEATHER_API_BASE_URL}?q=${encodeURIComponent(ciudad + ',co')}&units=metric&lang=es&appid=${OPENWEATHER_API_KEY}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error('Ciudad no encontrada o error de API');
    }

    const data = await respuesta.json();

    return {
      ciudad: data.name || ciudad,
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
 * Llena el elemento <datalist> con las ciudades predefinidas
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
 * Actualiza la tarjeta de clima de la sede principal
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

  const ahora = new Date();
  fechaEl.textContent = `📅 ${ahora.toLocaleDateString('es-CO')}`;
  horaEl.textContent = `⏰ ${ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Carga el clima inicial de la ciudad sede
 */
async function initMainWeather() {
  const climaActual = await fetchCityWeather(CIUDAD_SEDE_FIJA);
  updateMainWeatherPanel(climaActual);
}

// Inicialización de funciones expuestas
window.fetchCityWeather = fetchCityWeather;
window.initMainWeather = initMainWeather;
window.updateMainWeatherPanel = updateMainWeatherPanel;
window.inicializarAutocompletarCiudades = inicializarAutocompletarCiudades;