export function generarId(prefijo = '') {
    return prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function validarFormularioRuta(formData) {
    const nombre = formData.get('nombre')?.trim();
    const conductor = formData.get('conductor')?.trim();
    const hora = formData.get('hora')?.trim();
    const ciudad = formData.get('ciudad')?.trim();
    if (!nombre || !conductor || !hora || !ciudad) return { ok: false, msg: 'Todos los campos son obligatorios.' }
    return { ok: true, data: { nombre, conductor, hora, ciudad } }
}
