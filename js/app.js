/*
 * ESTADO DE LA APLICACIÓN
 *
 * Toda la información que la interfaz muestra nace de `estadoApp`. Cada ruta
 * guarda los nombres de sus estudiantes; por eso, antes de asignar uno se
 * revisa si ya aparece en cualquier otra ruta.
 */
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

/* Lee la última copia guardada en el navegador. Si no existe (primera visita)
 * o está dañada, se usa el estado inicial definido arriba. */
function cargarEstado() {
  const datosGuardados = localStorage.getItem('rutas_seguras_kids_db');
  if (datosGuardados) {
    try { return JSON.parse(datosGuardados); } catch (e) { console.error(e); }
  }
  return estadoInicial;
}

/* Convierte el objeto de estado a texto JSON para conservarlo en localStorage.
 * localStorage pertenece al navegador, así que los datos persisten al recargar. */
function guardarEstado() {
  localStorage.setItem('rutas_seguras_kids_db', JSON.stringify(estadoApp));
}

// Variable de trabajo compartida por las funciones de este archivo.
let estadoApp = cargarEstado();

/* Muestra un mensaje temporal. Primero elimina un aviso previo para que nunca
 * se acumulen varios toast al mismo tiempo. */
function mostrarNotificacion(mensaje, tipo = 'error') {
  const toastExistente = document.querySelector('.toast-notificacion');
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement('div');
  // Las clases permiten que CSS pinte distinto los mensajes de éxito y error.
  toast.className = `toast-notificacion ${tipo}`;
  toast.innerHTML = `<span>${tipo === 'error' ? '⚠️' : '✅'}</span><span>${mensaje}</span>`;
  document.body.appendChild(toast);

  // Después de 3.5 s inicia la desaparición y 300 ms después se retira del DOM.
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* La expresión regular acepta letras españolas y espacios. `test` devuelve
 * true si todo el texto cumple el patrón y false en caso contrario. */
function esNombreValido(texto) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto);
}

/* DOMContentLoaded asegura que todos los elementos del index ya existen antes
 * de buscarlos por id o agregarles eventos. Primero se conectan eventos y luego
 * se dibuja el estado que estaba guardado. */
document.addEventListener('DOMContentLoaded', () => {
  // Estas funciones vienen de weather.js y se comprueba que existan antes de llamarlas.
  if (window.initMainWeather) initMainWeather();
  if (window.inicializarAutocompletarCiudades) inicializarAutocompletarCiudades();

  // "Inicializar" significa registrar los escuchadores de eventos una sola vez.
  inicializarNavegacionSPA();
  inicializarMenuLateral();
  inicializarFormularioRutas();
  inicializarAsignacionEstudiantes();
  inicializarBuscadorEstudiantes();
  inicializarFormularioEstudiantes();
  inicializarFormularioConductores();
  inicializarEscuchadoresEliminacion();
  inicializarEdicionRutas();

  // "Renderizar" significa crear o actualizar el HTML visible a partir de estadoApp.
  renderizarRutasDashboard();
  renderizarVistaRutas();
  renderizarTablasSecundarias();
  actualizarSelectoresRuta();
  actualizarSelectoresConductor();
  renderizarListaEstudiantesDisponibles();
});

/* Navegación de una SPA: no se carga otra página; se oculta la sección actual
 * y se muestra la elegida usando el valor data-vista de cada botón. */
function inicializarNavegacionSPA() {
  const botonesNav = document.querySelectorAll('.boton-nav');
  const secciones = document.querySelectorAll('.seccion-vista');
  const logoInicio = document.getElementById('logo-inicio');

  botonesNav.forEach(boton => {
    boton.addEventListener('click', () => {
      // dataset.vista lee el atributo HTML data-vista, por ejemplo "vista-panel".
      const vistaObjetivo = boton.dataset.vista;
      botonesNav.forEach(b => {
        b.classList.remove('activo');
        const etiqueta = b.querySelector('.etiqueta-activo');
        if (etiqueta) etiqueta.remove();
      });

      boton.classList.add('activo');
      boton.insertAdjacentHTML('beforeend', '<span class="etiqueta-activo">Activa</span>');

      // toggle agrega o quita una clase según la condición indicada.
      secciones.forEach(seccion => {
        seccion.classList.toggle('activa', seccion.id === vistaObjetivo);
        seccion.classList.toggle('oculta', seccion.id !== vistaObjetivo);
      });

      if (vistaObjetivo === 'vista-rutas' || vistaObjetivo === 'rutas') renderizarVistaRutas();

      // En móvil el menú se cierra al terminar de elegir una vista.
      cerrarMenuLateral();
    });
  });

  /* El logo funciona como acceso directo al panel principal. Reutiliza el
   * evento del botón Dashboard para conservar exactamente la misma lógica. */
  logoInicio?.addEventListener('click', (evento) => {
    evento.preventDefault();
    document.querySelector('.boton-nav[data-vista="vista-panel"]')?.click();
  });
}

/* Controla el menú hamburguesa solo en pantallas pequeñas; CSS decide cuándo
 * el botón es visible y la clase "abierta" mueve la barra al área visible. */
function inicializarMenuLateral() {
  const botonMenu = document.getElementById('boton-menu-lateral');
  const barraLateral = document.getElementById('barra-lateral');
  if (!botonMenu || !barraLateral) return;

  botonMenu.addEventListener('click', () => {
    // toggle devuelve true cuando acaba de abrirse y false cuando acaba de cerrarse.
    const menuAbierto = barraLateral.classList.toggle('abierta');
    botonMenu.setAttribute('aria-expanded', String(menuAbierto));
    botonMenu.setAttribute('aria-label', menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  });
}

/* Cierra el menú sin hacer nada si los elementos no existen o ya estaba cerrado. */
function cerrarMenuLateral() {
  const botonMenu = document.getElementById('boton-menu-lateral');
  const barraLateral = document.getElementById('barra-lateral');
  if (!botonMenu || !barraLateral || !barraLateral.classList.contains('abierta')) return;

  barraLateral.classList.remove('abierta');
  botonMenu.setAttribute('aria-expanded', 'false');
  botonMenu.setAttribute('aria-label', 'Abrir menú de navegación');
}

/* Captura el envío del formulario de rutas. preventDefault evita que el
 * navegador recargue la página y permite validar y actualizar la interfaz. */
function inicializarFormularioRutas() {
  const formularioRuta = document.getElementById('formulario-ruta');
  if (!formularioRuta) return;

  formularioRuta.addEventListener('submit', (event) => {
    event.preventDefault();

    // ?. evita un error si faltara un campo; trim elimina espacios al inicio/final.
    const nombreRuta = document.getElementById('nombreRuta')?.value.trim();
    const ciudadRuta = document.getElementById('ciudadRuta')?.value.trim();
    const conductor = document.getElementById('selectConductor')?.value.trim();
    const horaSalida = document.getElementById('horaSalida')?.value.trim();
    const capacidadRuta = document.getElementById('capacidadRuta')?.value.trim();

    if (!nombreRuta || !ciudadRuta || !conductor || !horaSalida || !capacidadRuta) {
      mostrarNotificacion('Completa todos los campos del formulario.', 'error');
      return;
    }

    // Date.now genera un identificador basado en el instante actual.
    const nuevaRuta = {
      id: Date.now().toString(),
      nombre: nombreRuta,
      conductor,
      hora: horaSalida,
      capacidad: capacidadRuta,
      ciudad: ciudadRuta,
      estudiantes: []
    };

    // Se actualiza la fuente de datos, se guarda y luego se refrescan las vistas afectadas.
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

/* Filtra en tiempo real; el evento input ocurre con cada tecla, pegado o borrado. */
function inicializarBuscadorEstudiantes() {
  const buscadorInput = document.querySelector('input[placeholder*="Buscar estudiante"]');
  if (!buscadorInput) return;

  buscadorInput.addEventListener('input', (e) => {
    renderizarListaEstudiantesDisponibles(e.target.value.toLowerCase().trim());
  });
}

/* Dibuja la lista de casillas y bloquea estudiantes ya asignados. El filtro
 * recibido ya está en minúsculas para que la búsqueda no distinga mayúsculas. */
function renderizarListaEstudiantesDisponibles(filtro = '') {
  const contenedor = document.getElementById('lista-estudiantes-disponibles');
  if (!contenedor) return;

  contenedor.innerHTML = '';
  // filter devuelve solo los estudiantes que contienen el texto buscado.
  const estudiantesFiltrados = estadoApp.estudiantes.filter(est => est.nombre.toLowerCase().includes(filtro));

  if (estudiantesFiltrados.length === 0) {
    contenedor.innerHTML = '<p style="color:#64748b; font-size:13px; padding:5px;">No hay estudiantes disponibles.</p>';
    return;
  }

  estudiantesFiltrados.forEach(est => {
    // find devuelve la primera ruta que ya contiene al estudiante, o undefined.
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

/* Reconstruye el selector de conductor. Un conductor con ruta aparece deshabilitado
 * para impedir que quede asignado a dos rutas. */
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

/* Actualiza el selector de destino con las rutas existentes. El value es el id,
 * no el nombre, para que la asignación identifique la ruta correctamente. */
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

/* Asigna los estudiantes marcados a la ruta seleccionada. Aunque la interfaz
 * bloquea casillas asignadas, la comprobación includes evita duplicados también
 * en los datos guardados. */
function inicializarAsignacionEstudiantes() {
  const btnConfirmar = document.getElementById('boton-confirmar-asignacion');
  const selectRuta = document.getElementById('selectRutaAsignar');
  const contenedorChecks = document.getElementById('lista-estudiantes-disponibles');

  if (!btnConfirmar) return;

  btnConfirmar.addEventListener('click', () => {
    const rutaId = selectRuta.value;
    if (!rutaId) return mostrarNotificacion('Seleccione una ruta.', 'error');

    // Solo se toman casillas marcadas que no estén deshabilitadas.
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

/* Registra un estudiante nuevo y refresca tanto su tabla como la lista de
 * asignación para que pueda seleccionarse inmediatamente. */
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

/* Registra un conductor y actualiza el selector usado al crear rutas. */
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

/* Crea una tarjeta personalizada (<route-card>) por cada ruta para el panel.
 * setInfo es un método definido en route-card.js que recibe el objeto completo. */
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

/* Reutiliza las mismas tarjetas en la vista de gestión. Se limpia el contenedor
 * antes de agregar tarjetas para no duplicar elementos al renderizar de nuevo. */
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

/* Construye las filas de estudiantes y conductores. map transforma cada objeto
 * en HTML y join('') une las filas en una sola cadena para asignarla al tbody. */
function renderizarTablasSecundarias() {
  const tbodyEst = document.getElementById('cuerpo-tabla-estudiantes');
  const tbodyCond = document.getElementById('cuerpo-tabla-conductores');

  if (tbodyEst) {
    tbodyEst.innerHTML = estadoApp.estudiantes.map(e => {
      const ruta = estadoApp.rutas.find(r => r.estudiantes.includes(e.nombre));
      // Operador ternario: si hay ruta muestra badge azul; si no, badge gris.
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

/* Las tarjetas disparan eventos personalizados desde su Shadow DOM. `composed`
 * permite que el evento llegue a document y aquí se elimina la ruta indicada. */
function inicializarEscuchadoresEliminacion() {
  document.addEventListener('eliminar-ruta', (e) => {
    // detail transporta el id enviado por la tarjeta en el CustomEvent.
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

/* Para editar, se cargan los datos de la ruta en el formulario y se elimina la
 * versión anterior. Al guardar el formulario se crea la versión actualizada. */
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

/* Se expone en window porque las filas se generan como texto HTML y usan
 * onclick="eliminarEstudiante(id)". Antes de eliminar, se quita al estudiante
 * de cualquier ruta para que no queden referencias huérfanas. */
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

/* Igual que la función anterior, queda en window para que el botón generado en
 * la tabla pueda invocarla con onclick. */
window.eliminarConductor = (id) => {
  estadoApp.conductores = estadoApp.conductores.filter(c => c.id !== id);
  guardarEstado();
  renderizarTablasSecundarias();
  actualizarSelectoresConductor();
  mostrarNotificacion('Conductor eliminado', 'exito');
};
