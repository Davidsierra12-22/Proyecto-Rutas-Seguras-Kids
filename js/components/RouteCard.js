const plantilla = `
<style>
    :host{display:block;font-family:inherit}
    .card{border-radius:8px;border:1px solid var(--muted,#e0e6ef);padding:12px;background:var(--card-bg,#fff);box-shadow:0 1px 3px rgba(0,0,0,0.04)}
    .card-head{display:flex;justify-content:space-between;align-items:center}
    .meta{color:var(--muted,#666);font-size:0.9rem}
    .students{margin-top:8px}
    .student{display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#f7f9fc;margin-bottom:6px}
    .controls{display:flex;gap:8px}
    .small{font-size:0.85rem}
    .weather{display:flex;align-items:center;gap:8px}
    input[type="text"]{padding:6px;border:1px solid #cbd5e1;border-radius:6px}
    button{cursor:pointer}
</style>
<article class="card">
    <div class="card-head">
        <div>
            <div class="card-title"></div>
            <div class="card-driver meta"></div>
            <div class="card-time meta"></div>
        </div>
        <div class="controls">
            <div class="weather">
                <img class="weather-icon" src="" alt="clima" width="48" height="48">
                <div class="weather-temp small"></div>
            </div>
            <div>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        </div>
    </div>
    <div class="students">
        <strong>Pasajeros</strong>
        <div class="students-list"></div>
        <div class="add-student">
            <input class="student-name" placeholder="Nombre del estudiante">
            <button class="add-student-btn">Agregar</button>
        </div>
    </div>
</article>
`;

class TarjetaRuta extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = plantilla;
        this._data = null;
    }

    set data(value) {
        this._data = value;
        this.render();
    }

    get data() {
        return this._data;
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', e => {
            if (e.target.classList.contains('delete-btn')) {
                this.dispatchEvent(new CustomEvent('ruta-eliminada', { detail: { id: this._data.id }, bubbles: true, composed: true }));
            }
            if (e.target.classList.contains('edit-btn')) {
                const nuevo = prompt('Editar nombre de la ruta', this._data.nombre);
                if (nuevo && nuevo.trim()) {
                    this._data.nombre = nuevo.trim();
                    this.dispatchEvent(new CustomEvent('ruta-actualizada', { detail: { ruta: this._data }, bubbles: true, composed: true }));
                    this.render();
                }
            }
            if (e.target.classList.contains('add-student-btn')) {
                const input = this.shadowRoot.querySelector('.student-name');
                const nombre = input.value.trim();
                if (!nombre) return alert('Nombre requerido');
                this.dispatchEvent(new CustomEvent('estudiante-agregado', { detail: { id: this._data.id, nombre }, bubbles: true, composed: true }));
                input.value = '';
            }
            if (e.target.classList.contains('remove-student')) {
                const sid = e.target.dataset.sid;
                this.dispatchEvent(new CustomEvent('estudiante-eliminado', { detail: { rutaId: this._data.id, studentId: sid }, bubbles: true, composed: true }));
            }
        });
    }

    render() {
        if (!this._data) return;
        this.shadowRoot.querySelector('.card-title').textContent = this._data.nombre;
        this.shadowRoot.querySelector('.card-driver').textContent = `Conductor: ${this._data.conductor}`;
        this.shadowRoot.querySelector('.card-time').textContent = `Salida: ${this._data.hora}`;
        const wIcon = this.shadowRoot.querySelector('.weather-icon');
        const wTemp = this.shadowRoot.querySelector('.weather-temp');
        if (this._data.weather) {
            wTemp.textContent = typeof this._data.weather.temp === 'number' ? `${this._data.weather.temp}°C` : this._data.weather.temp;
            wIcon.src = this._data.weather.icono || '';
            wIcon.alt = this._data.weather.descripcion || 'clima';
        }
        const list = this.shadowRoot.querySelector('.students-list');
        list.innerHTML = '';
        (this._data.estudiantes || []).forEach(s => {
            const el = document.createElement('div');
            el.className = 'student';
            el.innerHTML = `<span>${s.nombre}</span><button class="remove-student" data-sid="${s.id}">Eliminar</button>`;
            list.appendChild(el);
        });
    }
}

customElements.define('tarjeta-ruta', TarjetaRuta);
