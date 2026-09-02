const estadoInicial = {
  rutas: [],
  estudiantes: [
    { id: 1, nombre: 'Diego' },
    { id: 2, nombre: 'Valeria' },
    { id: 3, nombre: 'Pedro' },
    { id: 4, nombre: 'Laura' },
    { id: 5, nombre: 'Carlos' }
  ],
  conductores: [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'Ana Rodríguez' }
  ]
};

function cargarEstado() {
  const datosGuardados = localStorage.getItem('rutas_seguras_kids_db');
  if (datosGuardados) {
    try { return JSON.parse(datosGuardados); } catch (e) { console.error(e); }
  }
  return estadoInicial;
}

function guardarEstado() {
  localStorage.setItem('rutas_seguras_kids_db', JSON.stringify(estadoApp));
}

let estadoApp = cargarEstado();

function mostrarNotificacion(mensaje, tipo = 'error') {
  const toastExistente = document.querySelector('.toast-notificacion');
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notificacion ${tipo}`;
  toast.innerHTML = `<span>${tipo === 'error' ? '⚠️' : '✅'}</span><span>${mensaje}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function esNombreValido(texto) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto);
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.initMainWeather) initMainWeather();
  if (window.inicializarAutocompletarCiudades) inicializarAutocompletarCiudades();

  inicializarNavegacionSPA();
  inicializarFormularioRutas();
  inicializarAsignacionEstudiantes();
  inicializarBuscadorEstudiantes();
  inicializarFormularioEstudiantes();
  inicializarFormularioConductores();
  inicializarEscuchadoresEliminacion();
  inicializarEdicionRutas();

  renderizarRutasDashboard();
  renderizarVistaRutas();
  renderizarTablasSecundarias();
  actualizarSelectoresRuta();
  actualizarSelectoresConductor();
  renderizarListaEstudiantesDisponibles();
});

function inicializarNavegacionSPA() {
  const botonesNav = document.querySelectorAll('.boton-nav');
  const secciones = document.querySelectorAll('.seccion-vista');

  botonesNav.forEach(boton => {
    boton.addEventListener('click', () => {
      const vistaObjetivo = boton.dataset.vista;
      botonesNav.forEach(b => {
        b.classList.remove('activo');
        const etiqueta = b.querySelector('.etiqueta-activo');
        if (etiqueta) etiqueta.remove();
      });

      boton.classList.add('activo');
      boton.insertAdjacentHTML('beforeend', '<span class="etiqueta-activo">Activa</span>');

      secciones.forEach(seccion => {
        seccion.classList.toggle('activa', seccion.id === vistaObjetivo);
        seccion.classList.toggle('oculta', seccion.id !== vistaObjetivo);
      });

      if (vistaObjetivo === 'vista-rutas' || vistaObjetivo === 'rutas') renderizarVistaRutas();
    });
  });
}

function inicializarFormularioRutas() {
  const formularioRuta = document.getElementById('formulario-ruta');
  if (!formularioRuta) return;

  formularioRuta.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombreRuta = document.getElementById('nombreRuta')?.value.trim();
    const ciudadRuta = document.getElementById('ciudadRuta')?.value.trim();
    const conductor = document.getElementById('selectConductor')?.value.trim();
    const horaSalida = document.getElementById('horaSalida')?.value.trim();
    const capacidadRuta = document.getElementById('capacidadRuta')?.value.trim();

    if (!nombreRuta || !ciudadRuta || !conductor || !horaSalida || !capacidadRuta) {
      mostrarNotificacion('Completa todos los campos del formulario.', 'error');
      return;
    }

    const nuevaRuta = {
      id: Date.now().toString(),
      nombre: nombreRuta,
      conductor,
      hora: horaSalida,
      capacidad: capacidadRuta,
      ciudad: ciudadRuta,
      estudiantes: []
    };

    estadoApp.rutas.push(nuevaRuta);
    guardarEstado();

    formularioRuta.reset();
    mostrarNotificacion('Ruta creada con éxito', 'exito');

    renderizarRutasDashboard();
    renderizarVistaRutas();
    actualizarSelectoresRuta();
    actualizarSelectoresConductor();
    renderizarTablasSecundarias();
  });
}

function inicializarBuscadorEstudiantes() {
  const buscadorInput = document.querySelector('input[placeholder*="Buscar estudiante"]');
  if (!buscadorInput) return;

  buscadorInput.addEventListener('input', (e) => {
    renderizarListaEstudiantesDisponibles(e.target.value.toLowerCase().trim());
  });
}

/* Bloquea estudiantes ya asignados */
function renderizarListaEstudiantesDisponibles(filtro = '') {
  const contenedor = document.getElementById('lista-estudiantes-disponibles');
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const estudiantesFiltrados = estadoApp.estudiantes.filter(est => est.nombre.toLowerCase().includes(filtro));

  if (estudiantesFiltrados.length === 0) {
    contenedor.innerHTML = '<p style="color:#64748b; font-size:13px; padding:5px;">No hay estudiantes disponibles.</p>';
    return;
  }

  estudiantesFiltrados.forEach(est => {
    const rutaAsignada = estadoApp.rutas.find(r => r.estudiantes.includes(est.nombre));
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.margin = '6px 0';

    if (rutaAsignada) {
      label.innerHTML = `<input type="checkbox" value="${est.nombre}" disabled> <span style="color:#94a3b8;">${est.nombre} (${rutaAsignada.nombre})</span>`;
    } else {
      label.innerHTML = `<input type="checkbox" value="${est.nombre}"> ${est.nombre}`;
    }
    contenedor.appendChild(label);
  });
}

/* Bloquea conductores ya asignados */
function actualizarSelectoresConductor() {
  const selectConductor = document.getElementById('selectConductor');
  if (!selectConductor) return;

  selectConductor.innerHTML = '<option value="">Seleccione Conductor</option>';
  estadoApp.conductores.forEach(c => {
    const rutaAsignada = estadoApp.rutas.find(r => r.conductor === c.nombre);
    const opt = document.createElement('option');
    opt.value = c.nombre;
    opt.textContent = rutaAsignada ? `${c.nombre} (${rutaAsignada.nombre})` : c.nombre;
    if (rutaAsignada) opt.disabled = true;
    selectConductor.appendChild(opt);
  });
}

function actualizarSelectoresRuta() {
  const selectAsignar = document.getElementById('selectRutaAsignar');
  if (!selectAsignar) return;

  selectAsignar.innerHTML = '<option value="">Seleccione Ruta</option>';
  estadoApp.rutas.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.nombre;
    selectAsignar.appendChild(opt);
  });
}

function inicializarAsignacionEstudiantes() {
  const btnConfirmar = document.getElementById('boton-confirmar-asignacion');
  const selectRuta = document.getElementById('selectRutaAsignar');
  const contenedorChecks = document.getElementById('lista-estudiantes-disponibles');

  if (!btnConfirmar) return;

  btnConfirmar.addEventListener('click', () => {
    const rutaId = selectRuta.value;
    if (!rutaId) return mostrarNotificacion('Seleccione una ruta.', 'error');

    const checkboxes = contenedorChecks.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)');
    const seleccionados = Array.from(checkboxes).map(cb => cb.value);

    if (seleccionados.length === 0) return mostrarNotificacion('Seleccione al menos un estudiante disponible.', 'error');

    const ruta = estadoApp.rutas.find(r => r.id === rutaId);
    if (ruta) {
      seleccionados.forEach(estNombre => {
        if (!ruta.estudiantes.includes(estNombre)) ruta.estudiantes.push(estNombre);
      });

      guardarEstado();
      mostrarNotificacion('Estudiantes asignados correctamente', 'exito');
      renderizarRutasDashboard();
      renderizarVistaRutas();
      renderizarTablasSecundarias();
      renderizarListaEstudiantesDisponibles();
    }
  });
}

function inicializarFormularioEstudiantes() {
  const form = document.getElementById('formulario-estudiante');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('nombreEstudianteInput');
    const nombre = input.value.trim();

    if (!nombre) return;
    if (!esNombreValido(nombre)) return mostrarNotificacion('Solo letras y espacios.', 'error');

    estadoApp.estudiantes.push({ id: Date.now(), nombre });
    guardarEstado();
    input.value = '';
    mostrarNotificacion('Estudiante añadido', 'exito');
    renderizarTablasSecundarias();
    renderizarListaEstudiantesDisponibles();
  });
}

function inicializarFormularioConductores() {
  const form = document.getElementById('formulario-conductor');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('nombreConductorInput');
    const nombre = input.value.trim();

    if (!nombre) return;
    if (!esNombreValido(nombre)) return mostrarNotificacion('Solo letras y espacios.', 'error');

    estadoApp.conductores.push({ id: Date.now(), nombre });
    guardarEstado();
    input.value = '';
    mostrarNotificacion('Conductor añadido', 'exito');
    renderizarTablasSecundarias();
    actualizarSelectoresConductor();
  });
}

function renderizarRutasDashboard() {
  const contenedor = document.getElementById('contenedor-rutas');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  estadoApp.rutas.forEach(ruta => {
    const tarjeta = document.createElement('route-card');
    tarjeta.setInfo(ruta);
    contenedor.appendChild(tarjeta);
  });
}

function renderizarVistaRutas() {
  const contenedorGestion = document.getElementById('contenedor-rutas-gestion') || document.querySelector('#vista-rutas .grid-rutas');
  if (!contenedorGestion) return;

  contenedorGestion.innerHTML = '';
  if (estadoApp.rutas.length === 0) {
    contenedorGestion.innerHTML = '<p style="color: #64748b; padding: 20px;">No hay rutas registradas.</p>';
    return;
  }

  contenedorGestion.style.display = 'flex';
  contenedorGestion.style.flexWrap = 'wrap';
  contenedorGestion.style.gap = '15px';

  estadoApp.rutas.forEach(ruta => {
    const tarjeta = document.createElement('route-card');
    tarjeta.setInfo(ruta);
    contenedorGestion.appendChild(tarjeta);
  });
}

/* Muestra estado real en las tablas secundarias */
function renderizarTablasSecundarias() {
  const tbodyEst = document.getElementById('cuerpo-tabla-estudiantes');
  const tbodyCond = document.getElementById('cuerpo-tabla-conductores');

  if (tbodyEst) {
    tbodyEst.innerHTML = estadoApp.estudiantes.map(e => {
      const ruta = estadoApp.rutas.find(r => r.estudiantes.includes(e.nombre));
      const estadoHtml = ruta 
        ? `<span class="badge-asignado">${ruta.nombre}</span>` 
        : `<span class="badge-sin-asignar">Sin asignar</span>`;

      return `
        <tr>
          <td>${e.nombre}</td>
          <td>${estadoHtml}</td>
          <td><button onclick="eliminarEstudiante(${e.id})" class="boton-icono">🗑️</button></td>
        </tr>
      `;
    }).join('');
  }

  if (tbodyCond) {
    tbodyCond.innerHTML = estadoApp.conductores.map(c => {
      const ruta = estadoApp.rutas.find(r => r.conductor === c.nombre);
      const estadoHtml = ruta 
        ? `<span class="badge-asignado">${ruta.nombre}</span>` 
        : `<span class="badge-sin-asignar">Sin asignar</span>`;

      return `
        <tr>
          <td>${c.nombre}</td>
          <td>${estadoHtml}</td>
          <td><button onclick="eliminarConductor(${c.id})" class="boton-icono">🗑️</button></td>
        </tr>
      `;
    }).join('');
  }
}

function inicializarEscuchadoresEliminacion() {
  document.addEventListener('eliminar-ruta', (e) => {
    const idEliminar = e.detail.id;
    estadoApp.rutas = estadoApp.rutas.filter(r => r.id !== idEliminar);
    guardarEstado();

    renderizarRutasDashboard();
    renderizarVistaRutas();
    actualizarSelectoresRuta();
    actualizarSelectoresConductor();
    renderizarTablasSecundarias();
    renderizarListaEstudiantesDisponibles();
    mostrarNotificacion('Ruta eliminada', 'exito');
  });
}

function inicializarEdicionRutas() {
  document.addEventListener('editar-ruta', (e) => {
    const ruta = estadoApp.rutas.find(r => r.id === e.detail.id);
    if (!ruta) return;

    document.getElementById('nombreRuta').value = ruta.nombre;
    document.getElementById('ciudadRuta').value = ruta.ciudad;
    document.getElementById('selectConductor').value = ruta.conductor;
    document.getElementById('horaSalida').value = ruta.hora;
    document.getElementById('capacidadRuta').value = ruta.capacidad;

    estadoApp.rutas = estadoApp.rutas.filter(r => r.id !== e.detail.id);
    guardarEstado();

    renderizarRutasDashboard();
    renderizarVistaRutas();
    actualizarSelectoresRuta();
    actualizarSelectoresConductor();
    renderizarTablasSecundarias();
    renderizarListaEstudiantesDisponibles();
    mostrarNotificacion('Modifica los datos y reenvía el formulario', 'exito');
  });
}

window.eliminarEstudiante = (id) => {
  const est = estadoApp.estudiantes.find(e => e.id === id);
  if (est) {
    estadoApp.rutas.forEach(r => {
      r.estudiantes = r.estudiantes.filter(nombre => nombre !== est.nombre);
    });
  }
  estadoApp.estudiantes = estadoApp.estudiantes.filter(e => e.id !== id);
  guardarEstado();
  renderizarTablasSecundarias();
  renderizarListaEstudiantesDisponibles();
  renderizarRutasDashboard();
  renderizarVistaRutas();
  mostrarNotificacion('Estudiante eliminado', 'exito');
};

window.eliminarConductor = (id) => {
  estadoApp.conductores = estadoApp.conductores.filter(c => c.id !== id);
  guardarEstado();
  renderizarTablasSecundarias();
  actualizarSelectoresConductor();
  mostrarNotificacion('Conductor eliminado', 'exito');
};