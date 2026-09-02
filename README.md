# Rutas Seguras Kids

Aplicación web para la gestión de rutas escolares, asignación de estudiantes, control de conductores y consulta del clima asociado a cada ruta, desarrollada con HTML5, CSS3 y JavaScript vanilla.

## 1. Visión general del proyecto

Rutas Seguras Kids nace como una herramienta administrativa para optimizar la logística del transporte escolar. La aplicación permite registrar rutas, asignar estudiantes y conductores, revisar información clave por ruta y consultar el clima real de la ciudad asociada a cada recorrido usando la API pública de OpenWeather.

El proyecto está enfocado en demostrar dominio de JavaScript puro, estructura modular, uso de componentes nativos del navegador y arquitectura de interfaz responsiva.

## 2. Objetivo del proyecto

- Gestionar rutas escolares de forma sencilla e intuitiva.
- Centralizar la información de estudiantes, conductores y rutas.
- Permitir la edición y eliminación de rutas sin recargar la página.
- Consultar clima actual para la ciudad de la ruta mediante una API externa.
- Demostrar buenas prácticas con Vanilla JS, Web Components y CSS modular.

## 3. Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript ES6+
- Web Components
- Fetch API
- OpenWeather API
- Diseño responsive con media queries

## 4. Funcionalidades principales

- Registro de nuevas rutas
- Validación de formularios
- Consulta del clima principal de la sede
- Consulta del clima específico por ciudad de ruta
- Asignación de estudiantes a rutas
- Gestión de conductores
- Edición y eliminación de rutas
- Visualización responsiva del dashboard
- Notificaciones flotantes (toasts)

## 5. Historias de usuario

| ID | Usuario | Funcionalidad | Criterio de aceptación |
| --- | --- | --- | --- |
| HU-01 | Administrador | Registrar una nueva ruta con nombre, conductor, horario, capacidad y ciudad | El formulario valida los campos y la ruta aparece automáticamente en el dashboard |
| HU-02 | Administrador | Registrar estudiantes y conductores con nombres válidos | Solo se aceptan letras y espacios; si falla, se muestra una alerta o notificación |
| HU-03 | Administrador | Asignar estudiantes a rutas | El estudiante se asocia a la ruta seleccionada y la interfaz se actualiza en tiempo real |
| HU-04 | Administrador | Editar o eliminar una ruta | Los botones de acción cargan los datos en el formulario y sincronizan el estado global |
| HU-05 | Administrador / Conductor | Consultar clima actual | Se consume la API de OpenWeather y se muestra la temperatura y descripción climática |

## 6. Estructura del proyecto

```text
Proyecto-Rutas-Seguras-Kids/
├── index.html
├── README.md
├── assets/
│   └── icos/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── componets/
│   │   └── route-card.js
│   └── services/
│       └── weather.js
└── Documentación Técnica y Guía de Proyecto rutas.docx
```

### Descripción de archivos principales

- [index.html](index.html): estructura base de la aplicación, formularios y templates de rutas.
- [css/styles.css](css/styles.css): estilos generales, layout, tema visual y notificaciones.
- [js/app.js](js/app.js): lógica principal de la app, estado, validaciones, render y eventos.
- [js/services/weather.js](js/services/weather.js): lógica de consumo de la API de clima y autocompletado de ciudades.
- [js/componets/route-card.js](js/componets/route-card.js): Web Component reutilizable para mostrar cada ruta.

## 7. Arquitectura del sistema

La aplicación sigue una lógica basada en un estado central y render dinámico del DOM.

### Componentes principales

- Panel principal o dashboard
- Formulario de rutas
- Tarjeta de ruta con Web Component
- Listado de estudiantes
- Listado de conductores
- Módulo de clima por API
- Sistema de eventos personalizados

### Principio de funcionamiento

1. El administrador ingresa datos desde el formulario.
2. La lógica en [js/app.js](js/app.js) valida el contenido.
3. Se actualiza el estado global de la aplicación.
4. El DOM se renderiza sin recargar la página.
5. Las rutas pueden ser editadas o eliminadas mediante eventos personalizados.
6. El clima se consulta con Fetch y se actualiza en la interfaz.

## 8. Flujos de la lógica del sistema

### A. Flujo de registro y validación de rutas y usuarios

```text
Inicio
  |
  v
Formulario de rutas o usuarios
  |
  v
Validar datos
  |-- Si hay error --> Mostrar mensaje/Toast --> Fin
  |
  v
Guardar en estado global
  |
  v
Renderizar tarjeta / tabla
  |
  v
Fin
```

Whimsical - Diagrama de flujo de registro / validación:

https://whimsical.com/el-chanclas/rutas-kids-5nRf5kdWWKhTKKfuhb7uev

### B. Flujo de asignación de estudiantes y persistencia

```text
Inicio
  |
  v
Buscar estudiante
  |
  v
Seleccionar estudiantes con checkbox
  |
  v
Elegir ruta destino
  |
  v
Actualizar datos de la ruta
  |
  v
Renderizar nueva vista
  |
  v
Fin
```

Whimsical - Diagrama de flujo de asignación y almacenamiento:

[Insertar enlace de Whimsical aquí]

## 9. Web Components y lógica reutilizable

El componente principal de la aplicación es el Web Component `<route-card>`, el cual encapsula la representación visual y la lógica de cada ruta.

### Beneficios del uso de Web Components

- Encapsulamiento visual
- Reutilización del código
- Aislamiento del DOM interno
- Comunicación con eventos personalizados
- Facilidad para integrar en interfaces modulares

## 10. API de clima

La aplicación consume la API OpenWeather para mostrar información climática real.

### Endpoint principal

- Weather endpoint: `https://api.openweathermap.org/data/2.5/weather`

### Funcionalidad

- Se consulta la ciudad de la sede principal.
- También se consulta la ciudad de cada ruta registrada.
- La API devuelve temperatura, descripción del clima e icono.
- La información se renderiza en la interfaz de usuario.

## 11. Validaciones y reglas de negocio

Se aplican validaciones para asegurar integridad de los datos.

### Validación de nombres

Se usa una expresión regular que permite únicamente letras y espacios:

```javascript
function esNombreValido(texto) {
  const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return patron.test(texto);
}
```

Esto evita errores al registrar estudiantes o conductores con números o caracteres especiales.

## 12. Metodología de trabajo y enfoque del proyecto

El proyecto está orientado a:

- Desarrollo frontend puro
- Separación clara entre estructura, estilo y lógica
- Comunicación entre módulos mediante eventos
- Gestión del estado del usuario con JavaScript
- Diseño responsive y visual moderno

## 13. Plan de trabajo del proyecto

| Fase | Tareas | Resultado esperado |
| --- | --- | --- |
| Fase 1 | Maquetación base del dashboard y formularios | Layout principal terminado |
| Fase 2 | Creación del Web Component para rutas | Componentes reutilizables |
| Fase 3 | CRUD de rutas y validaciones | Manejo completo del flujo principal |
| Fase 4 | Integración del clima y búsqueda | Datos dinámicos y en tiempo real |
| Fase 5 | Documentación del proyecto | README y diagramas funcionales |

## 14. Checklist de verificación final

- [x] Desarrollo con JavaScript vanilla
- [x] Uso de HTML5 y CSS3
- [x] Estructura modular por carpetas
- [x] Uso de Web Component para rutas
- [x] Validación de entradas por regex
- [x] Integración con API de clima
- [x] Interfaz responsive
- [x] Eventos personalizados para lógica de negocio
- [x] Diseño visual adaptado a la temática del proyecto

## 15. Requisitos de ejecución

### Requerimientos

- Navegador moderno
- Conexión a internet para consultar la API de clima
- Visual Studio Code recomendado

### Ejecución local

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto.
3. Ejecuta el archivo [index.html](index.html) en tu navegador.
4. Si deseas modificar la lógica de clima, revisa [js/services/weather.js](js/services/weather.js).

## 16. Créditos y nota del proyecto

Proyecto desarrollado como ejercicio académico y aplicativo enfocado en la gestión escolar y la programación web frontend moderna.

---

> Este README se puede complementar con los diagramas de flujo definitivos en Whimsical cuando se tenga el enlace final del equipo de diseño o documentación.
