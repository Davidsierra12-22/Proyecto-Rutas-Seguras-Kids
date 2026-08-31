// Simple wrapper for OpenWeather. Set API_KEY before use.
export const API_KEY = '1ef2f918432c0987e3e5481d0c7b14b8';

export async function obtenerClimaCiudad(ciudad){
  if(!API_KEY){
    // Return mock data if no API key configured
    return {temp:'N/A',descripcion:'No API key',icono:''};
  }
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&units=metric&lang=es&appid=${API_KEY}`;
    const res = await fetch(url);
    if(!res.ok){
      console.warn('OpenWeather respondió con estado:', res.status);
      return {temp:'N/A',descripcion:'No disponible',icono:''};
    }
    const json = await res.json();
    return {temp:Math.round(json.main.temp),descripcion:json.weather[0].description,icono:`https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`}
  }catch(e){
    console.error('obtenerClimaCiudad',e);
    return {temp:'N/A',descripcion:'No disponible',icono:''};
  }
}
