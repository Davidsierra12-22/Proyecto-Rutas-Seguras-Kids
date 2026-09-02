/*
 * WEB COMPONENT: <route-card>
 *
 * Esta clase crea una etiqueta HTML propia para representar una ruta. Al usar
 * Shadow DOM, los estilos y los ids internos de cada tarjeta no chocan con los
 * de las demás tarjetas ni con los del index.html.
 */
class RouteCard extends HTMLElement {
  constructor() {
    super();
    // mode: 'open' permite consultar el contenido interno mediante shadowRoot.
    this.attachShadow({ mode: 'open' });
    // Datos de respaldo que permiten dibujar una tarjeta incluso antes de recibir una ruta.
    this._data = {
      id: '',
      nombre: 'Ruta sin nombre',
      conductor: 'Sin conductor',
      hora: '07:00',
      capacidad: '30',
      ciudad: 'Bucaramanga',
      estudiantes: []
    };
  }

  // El navegador ejecuta este método automáticamente al insertar <route-card> en el DOM.
  connectedCallback() {
    this.render();
  }

  /* Método público llamado desde app.js. La desestructuración extrae solo los
   * campos necesarios del objeto ruta; estudiantes = [] evita recibir undefined. */
  setInfo({ id, nombre, conductor, hora, capacidad, ciudad, estudiantes = [] }) {
    this._data = { id, nombre, conductor, hora, capacidad, ciudad, estudiantes };
    if (id) this.dataset.id = id;
    this.render();
  }

  /* Consulta el clima de la ciudad de esta tarjeta. async/await espera el
   * resultado de weather.js sin bloquear el resto de la interfaz. */
  async actualizarClima(ciudad) {
    const climaEl = this.shadowRoot?.querySelector('#clima-tarjeta');
    if (!climaEl) return;

    try {
      // La función vive en weather.js y se publica en window para poder reutilizarla aquí.
      if (window.fetchCityWeather) {
        const clima = await window.fetchCityWeather(ciudad || 'Bucaramanga');
        climaEl.textContent = `${clima.icono} ${clima.temperatura}°C`;
      } else {
        climaEl.textContent = '☀️ --°C';
      }
    } catch (error) {
      climaEl.textContent = '🌤️ --°C';
    }
  }

  /* Genera nuevamente todo el contenido visible de la tarjeta según this._data.
   * Cada render también vuelve a enlazar los eventos porque reemplaza innerHTML. */
  render() {
    const { id, nombre, conductor, hora, capacidad, ciudad, estudiantes } = this._data;
    const totalEstudiantes = estudiantes.length;

    // slice toma una copia con los primeros tres estudiantes para la vista previa.
    const vistaPrevia = estudiantes.slice(0, 3);
    const hayMas = totalEstudiantes > 3;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 290px;
          margin: 10px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .tarjeta {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-sizing: border-box;
        }
        .encabezado {
          background-color: #dbeafe;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .icono-bus { font-size: 1.4rem; }
        .icono-mapa { font-size: 1.2rem; }

        .cuerpo {
          padding: 12px 14px;
        }
        .titulo {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 2px 0;
        }
        .info-sub {
          font-size: 0.82rem;
          color: #475569;
          margin: 2px 0;
        }
        .estatus {
          color: #16a34a;
          font-weight: 600;
        }
        .conteo-estudiantes {
          font-weight: 700;
          color: #334155;
          margin: 8px 0 10px 0;
          font-size: 0.88rem;
        }

        .fila-acciones-avatares {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .grupo-avatares {
          display: flex;
          align-items: center;
        }
        .avatar-preview {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          margin-right: -8px;
          object-fit: cover;
          background: #f1f5f9;
        }
        .puntos-mas {
          margin-left: 12px;
          font-weight: bold;
          color: #64748b;
          font-size: 0.85rem;
        }

        .grupo-botones {
          display: flex;
          gap: 6px;
        }
        .btn-icono {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          transition: background 0.2s;
        }
        .btn-editar { background-color: #0891b2; color: white; }
        .btn-eliminar { background-color: #ef4444; color: white; }

        .btn-desplegar {
          width: 100%;
          background: #0f766e;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-desplegar:hover {
          background: #115e59;
        }

        .lista-desplegable {
          display: none;
          max-height: 150px;
          overflow-y: auto;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-top: 8px;
          padding: 4px;
        }
        .lista-desplegable.abierta {
          display: block;
        }
        .item-estudiante {
          display: flex;
          align-items: center;
          padding: 5px 8px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.82rem;
          color: #334155;
        }
        .item-estudiante:last-child {
          border-bottom: none;
        }
        .item-estudiante img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
        }
        .sin-estudiantes {
          padding: 8px;
          font-size: 0.8rem;
          color: #94a3b8;
          text-align: center;
        }
      </style>

      <div class="tarjeta">
        <div class="encabezado">
          <span class="icono-bus">🚌</span>
          <span class="icono-mapa">🗺️</span>
        </div>

        <div class="cuerpo">
          <h4 class="titulo">${nombre}</h4>
          <p class="info-sub">(${conductor}, ${hora}, Clima: <span id="clima-tarjeta">⏳ ...</span>)</p>
          <p class="info-sub">Estatus: <span class="estatus">Activa</span></p>
          <p class="conteo-estudiantes">${totalEstudiantes}/${capacidad} Estudiantes</p>

          <div class="fila-acciones-avatares">
            <div class="grupo-avatares">
              <!-- map crea un avatar por estudiante y join('') une ese HTML. -->
              ${vistaPrevia.map(e => `
                <img src="${typeof e === 'object' && e.foto ? e.foto : 'assets/icos/perfil.png'}" class="avatar-preview" alt="Estudiante">
              `).join('')}
              ${hayMas ? `<span class="puntos-mas">...</span>` : ''}
            </div>

            <div class="grupo-botones">
              <button class="btn-icono btn-editar" id="btn-editar" title="Editar">✏️</button>
              <button class="btn-icono btn-eliminar" id="btn-eliminar" title="Eliminar">🗑️</button>
            </div>
          </div>

          <button class="btn-desplegar" id="btn-toggle">
            <span>👥 Ver Estudiantes</span>
            <span id="flecha">▾</span>
          </button>

          <div class="lista-desplegable" id="lista-estudiantes">
            <!-- Ternario: muestra estado vacío o crea los elementos de la lista. -->
            ${totalEstudiantes === 0 
              ? `<div class="sin-estudiantes">Sin estudiantes asignados</div>`
              : estudiantes.map(e => {
                  const nombreEst = typeof e === 'string' ? e : e.nombre;
                  const fotoEst = typeof e === 'object' && e.foto ? e.foto : 'assets/icos/perfil.png';
                  return `
                    <div class="item-estudiante">
                      <img src="${fotoEst}" alt="${nombreEst}">
                      <span>${nombreEst}</span>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>
    `;

    this.autobindEvents(id);
    this.actualizarClima(ciudad);
  }

  /* Obtiene los elementos recién creados dentro del Shadow DOM y conecta sus
   * acciones. Se llama después de render para que esos elementos ya existan. */
  autobindEvents(id) {
    const btnToggle = this.shadowRoot.querySelector('#btn-toggle');
    const lista = this.shadowRoot.querySelector('#lista-estudiantes');
    const flecha = this.shadowRoot.querySelector('#flecha');
    const btnEditar = this.shadowRoot.querySelector('#btn-editar');
    const btnEliminar = this.shadowRoot.querySelector('#btn-eliminar');

    if (btnToggle && lista) {
      btnToggle.addEventListener('click', () => {
        // La clase abierta cambia display en el CSS interno y la flecha refleja el estado.
        const estaAbierta = lista.classList.toggle('abierta');
        flecha.textContent = estaAbierta ? '▴' : '▾';
      });
    }

    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        /* CustomEvent avisa a app.js. bubbles y composed permiten que el evento
         * salga del Shadow DOM y sea escuchado por document. */
        this.dispatchEvent(new CustomEvent('editar-ruta', {
          detail: { id: id || this._data.id },
          bubbles: true,
          composed: true
        }));
      });
    }

    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('eliminar-ruta', {
          detail: { id: id || this._data.id },
          bubbles: true,
          composed: true
        }));
      });
    }
  }
}

// Registra la clase para que el navegador entienda la etiqueta <route-card>.
customElements.define('route-card', RouteCard);
// Se expone para depuración o reutilización desde otros scripts cargados en la página.
window.RouteCard = RouteCard;
