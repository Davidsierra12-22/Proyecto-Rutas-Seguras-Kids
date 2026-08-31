import {generarId,validarFormularioRuta} from './utils.js';
import {obtenerClimaCiudad} from './api.js';

const form = document.getElementById('form-ruta');
const lista = document.getElementById('lista-rutas');

let rutas = JSON.parse(localStorage.getItem('rutas')||'[]');

function guardar(){
  localStorage.setItem('rutas',JSON.stringify(rutas));
}

async function agregarRuta(payload){
  const id = generarId('r-');
  const clima = await obtenerClimaCiudad(payload.ciudad);
  const ruta = {id,...payload,estudiantes:[],weather:clima};
  rutas.push(ruta);
  guardar();
  renderRuta(ruta);
  document.dispatchEvent(new CustomEvent('ruta-creada',{detail:{ruta},bubbles:true}));
}

function renderAll(){
  lista.innerHTML='';
  rutas.forEach(renderRuta);
}

function renderRuta(ruta){
  const tarjeta = document.createElement('tarjeta-ruta');
  tarjeta.data = ruta;
  tarjeta.addEventListener('ruta-eliminada',e=>{
    rutas = rutas.filter(r=>r.id!==e.detail.id);
    guardar();
    renderAll();
  });
  tarjeta.addEventListener('ruta-actualizada',e=>{
    const idx = rutas.findIndex(r=>r.id===e.detail.ruta.id);
    if(idx>-1) rutas[idx] = e.detail.ruta;
    guardar();
  });
  tarjeta.addEventListener('estudiante-agregado',e=>{
    const r = rutas.find(r=>r.id===e.detail.id);
    if(r){
      r.estudiantes.push({id:generarId('s-'),nombre:e.detail.nombre});
      guardar();
      tarjeta.data = r; // refresh
      document.dispatchEvent(new CustomEvent('estudiante-agregado',{detail:{rutaId:r.id,nombre:e.detail.nombre},bubbles:true}));
    }
  });
  tarjeta.addEventListener('estudiante-eliminado',e=>{
    const r = rutas.find(r=>r.id===e.detail.rutaId);
    if(r){
      r.estudiantes = r.estudiantes.filter(s=>s.id!==e.detail.studentId);
      guardar();
      tarjeta.data = r;
      document.dispatchEvent(new CustomEvent('estudiante-eliminado',{detail:{rutaId:r.id,studentId:e.detail.studentId},bubbles:true}));
    }
  });
  lista.appendChild(tarjeta);
}

form.addEventListener('submit',async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(form);
  const v = validarFormularioRuta(fd);
  if(!v.ok) return alert(v.msg);
  await agregarRuta(v.data);
  form.reset();
});

// Render inicial
renderAll();
