# Rutas Seguras Kids

Proyecto de frontend para gestionar rutas escolares usando HTML, CSS y JavaScript puro (Vanilla JS).

Características principales
- Crear, editar y eliminar rutas.
- Asignar y eliminar estudiantes por ruta.
- Web Component `route-card` con Shadow DOM y `<template>`.
- Consumo de API pública (OpenWeather) mediante `fetch` y `async/await`. Retorno mock si no se configura la API key.
- Eventos personalizados (`ruta-creada`, `estudiante-agregado`, `estudiante-eliminado`).
- Responsive (Mobile / Tablet / Desktop).

Estructura

- `index.html` - Interfaz principal y plantilla del Web Component.
- `css/` - Estilos (`main.css`, `components.css`, `responsive.css`).
- `js/` - Lógica del proyecto: `app.js`, `api.js`, `utils.js`, `components/RouteCard.js`.
- `assets/` - Iconos de apoyo.

Ejecución local

1. Abrir `index.html` en el navegador (no requiere servidor). Algunas APIs como OpenWeather requieren HTTPS; si quieres usar la API real, configura la clave en `js/api.js` cambiando `API_KEY`.

2. Uso:

  - Rellenar el formulario y pulsar "Agregar ruta".
  - Desde cada tarjeta se pueden agregar estudiantes, editar el nombre de la ruta y eliminar la ruta.

Notas sobre OpenWeather

- Para obtener clima real: crea una cuenta en OpenWeather, copia la API key y pégala en `js/api.js` en la constante `API_KEY`.
- Si no pones `API_KEY`, la app mostrará datos de clima de prueba.

Checklist (requisitos del módulo)

- [x] Sin frameworks ni librerías externas.
- [x] HTML/CSS/JS separados.
- [x] Web Component `route-card` con `<template>` y Shadow DOM.
- [x] Operaciones CRUD sobre rutas y estudiantes.
- [x] Consumo con `fetch` y `async/await` (con fallback).
- [x] Uso de `CustomEvent` para notificar acciones.

Capturas de pantalla

Incluye tus propias capturas en `assets/img/` y actualiza este README antes de entregar.

Licencia

Proyecto para fines educativos.
