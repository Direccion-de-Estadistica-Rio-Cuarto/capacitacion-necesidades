/* ==========================================================================
   capacitacion-2027.js — Lo propio de la Encuesta de necesidades de
   capacitación 2027 (Modelo A). Se carga ANTES de js/encuesta.js:

   1) Al cargar (antes de encuesta.js): arma el catálogo de temas G y E en
      cada [data-catalogo="<nombre>"], para que encuesta.js lo numere y valide.
   2) En DOMContentLoaded (después de encuesta.js y del borrador):
      · P2 dependiente de P1 (optgroup[data-secretaria]).
      · Contacto: al menos celular o mail ([data-contacto="exigir"]).
      · Lista 8.1 con «Agregar otra» ([data-lista]).
      · Tabla 8.2: una fila por capacitación escrita ([data-fila-de]).
      · Agenda 16.1: día hábil desde mañana y turno.
   Los campos ocultos quedan deshabilitados: no se validan ni se envían.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Catálogo de temas (Anexo del Modelo A) -------------------
     value = código del catálogo (G1.1 → g1_1), igual en P6, P8 y el tablero. */
  var CATALOGO = [
    { titulo: 'Capacitaciones generales (para cualquier área)', ejes: [
      { titulo: 'Habilidades blandas, gestión y liderazgo', temas: [
        ['g1_1', 'Atención al ciudadano y trabajo en equipo'],
        ['g1_2', 'Comunicación asertiva y resolución de conflictos'],
        ['g1_3', 'Liderazgo y gestión de equipos'],
        ['g1_4', 'Manejo del tiempo, estrés laboral y bienestar'],
        ['g1_5', 'Gestión del cambio y resiliencia organizacional'],
        ['g1_6', 'Capacitaciones entre jefes y colaboradores del área']] },
      { titulo: 'Competencias digitales e inteligencia artificial', temas: [
        ['g2_1', 'Iniciación a la IA (prompts, IA generativa)'],
        ['g2_2', 'Gestión y colaboración digital / automatizaciones'],
        ['g2_3', 'Herramientas informáticas (Excel, Word, sistemas)'],
        ['g2_4', 'Seguridad y gestión responsable de datos e información']] },
      { titulo: 'Formación normativa, cumplimiento y redacción', temas: [
        ['g3_1', 'Derecho administrativo, procedimientos y normativa municipal'],
        ['g3_2', 'Transparencia, ética profesional y acceso a la información'],
        ['g3_3', 'Redacción de documentos e informes oficiales']] },
      { titulo: 'Gestión de proyectos e innovación', temas: [
        ['g4_1', 'Metodologías ágiles (Scrum, Kanban, Design Thinking)'],
        ['g4_2', 'Diseño e implementación de procesos y simplificación'],
        ['g4_3', 'Innovación pública y modernización']] },
      { titulo: 'Idiomas e inclusión comunicativa', temas: [
        ['g5_1', 'Idiomas extranjeros (inglés profesional, portugués, etc.)'],
        ['g5_2', 'Lengua de Señas Argentina (LSA) y comunicación inclusiva']] },
      { titulo: 'Seguridad e higiene laboral', temas: [
        ['g6_1', 'Seguridad, higiene laboral, riesgos y primeros auxilios']] }
    ] },
    { titulo: 'Capacitaciones específicas (propias de cada sector)', ejes: [
      { titulo: 'Especialización sectorial', temas: [
        ['e1_1', 'Capacitaciones específicas del área de trabajo <span class="texto-suave">(las que exige el puesto o la actividad; por ejemplo, manipulación de alimentos, manejo defensivo, trabajo en altura)</span>'],
        ['e1_2', 'Gestión del talento, capital humano y clima laboral'],
        ['e1_3', 'Políticas públicas y desarrollo comunitario / social']] }
    ] }
  ];

  function catalogoHTML(nombre, placeholderOtro) {
    var h = '';
    CATALOGO.forEach(function (g) {
      h += '<p class="catalogo__grupo">' + g.titulo + '</p>';
      g.ejes.forEach(function (e) {
        h += '<p class="catalogo__eje">' + e.titulo + '</p><div class="opciones opciones--2col">' +
          e.temas.map(function (t) {
            return '<label class="opcion"><input type="checkbox" name="' + nombre + '" value="' + t[0] + '"> <span>' + t[1] + '</span></label>';
          }).join('') + '</div>';
      });
    });
    // «Otro» siempre al final, después de todo el catálogo
    h += '<div class="opciones catalogo__otro"><label class="opcion opcion--otro"><input type="checkbox" name="' + nombre + '" value="otro"> Otro' +
      '<input class="campo" type="text" name="' + nombre + '_otro" data-otro-texto aria-label="Especificá el tema" placeholder="' + placeholderOtro + '" maxlength="200"></label></div>';
    return h;
  }

  $$('[data-catalogo]').forEach(function (el) {
    el.innerHTML = catalogoHTML(el.dataset.catalogo, el.dataset.otroPlaceholder || '¿Cuál?');
  });

  /* ==================================================================== */
  doc.addEventListener('DOMContentLoaded', function () {
    var E = window.Encuesta;
    if (!E) return;

    /* ---------- P2 dependiente de P1 ----------------------------------- */
    var sec = doc.getElementById('p01'), area = doc.getElementById('p02');
    var areas = {}, marcador, otra;
    if (sec && area) {
      $$('optgroup[data-secretaria]', area).forEach(function (g) {
        areas[g.dataset.secretaria] = $$('option', g).map(function (o) { return [o.value, o.textContent, o.dataset.grupo || '']; });
      });
      marcador = area.querySelector('option[value=""]');
      otra = area.querySelector('option[value="otro"]');
    }
    function filtrarAreas() {
      if (!sec || !area) return;
      var previo = area.value, lista = areas[sec.value] || [];
      area.innerHTML = '';
      marcador.textContent = sec.value ? 'Elegí una opción' : 'Primero elegí la Secretaría u organismo';
      area.appendChild(marcador);
      // data-grupo arma un subgrupo por Subsecretaría o Coordinación dentro de la secretaría elegida
      var grupo = null, etiqueta = null;
      lista.forEach(function (o) {
        if (o[2] !== etiqueta) {
          etiqueta = o[2];
          grupo = etiqueta ? doc.createElement('optgroup') : area;
          if (etiqueta) { grupo.label = etiqueta; area.appendChild(grupo); }
        }
        var op = doc.createElement('option'); op.value = o[0]; op.textContent = o[1]; grupo.appendChild(op);
      });
      if (sec.value) area.appendChild(otra);
      var vale = lista.some(function (o) { return o[0] === previo; }) || (previo === 'otro' && sec.value);
      area.value = vale ? previo : '';
    }
    // En el propio select: corre antes de que encuesta.js guarde el borrador
    if (sec) sec.addEventListener('change', function () { filtrarAreas(); E.aplicarCondiciones(); });

    /* ---------- Lista 8.1 con «Agregar otra» --------------------------- */
    $$('[data-lista]').forEach(function (lista) {
      var items = $$('.lista__item', lista);
      var n = 1;
      items.forEach(function (it, i) { if (it.querySelector('input').value.trim()) n = i + 1; });
      lista._mostrados = n;
      lista.querySelector('[data-agregar]').addEventListener('click', function () {
        lista._mostrados = Math.min(items.length, lista._mostrados + 1);
        refrescar();
        var nuevo = items[lista._mostrados - 1].querySelector('input');
        if (!nuevo.disabled) nuevo.focus();
      });
    });
    function actualizarListas() {
      $$('[data-lista]').forEach(function (lista) {
        var items = $$('.lista__item', lista);
        items.forEach(function (it, i) {
          var ver = i < lista._mostrados;
          it.hidden = !ver;
          if (!ver) it.querySelector('input').disabled = true;
        });
        lista.querySelector('[data-agregar]').hidden = lista._mostrados >= items.length;
      });
    }

    /* ---------- Tabla 8.2: una fila por capacitación escrita ----------- */
    function oculto(el) { return !!el.closest('[hidden]:not(.seccion)'); }
    function actualizarFilas() {
      $$('[data-filas]').forEach(function (cont) {
        var alguna = false;
        $$('[data-fila-de]', cont).forEach(function (fila) {
          var src = doc.querySelector('[name="' + fila.dataset.filaDe + '"]');
          var texto = (src && !src.disabled && !oculto(src)) ? src.value.trim() : '';
          var ver = !!texto && !oculto(cont);
          fila.hidden = !ver;
          fila.querySelector('[data-titulo-fila]').textContent = texto;
          $$('select', fila).forEach(function (s, i) {
            s.disabled = !ver;
            s.setAttribute('aria-label', (i === 0 ? 'Personas' : 'Urgencia') + ' para «' + texto + '»');
          });
          if (ver) alguna = true;
        });
        var vacio = cont.querySelector('[data-filas-vacio]');
        if (vacio) vacio.hidden = alguna;
      });
    }

    /* ---------- Validaciones propias (mensajes en castellano) ---------- */
    function validarContacto(grupo) {
      var tel = grupo.querySelector('[data-contacto-tel]'), mail = grupo.querySelector('[data-contacto-mail]');
      if (!tel || !mail) return;
      tel.setCustomValidity(''); mail.setCustomValidity('');
      var t = tel.value.trim();
      if (t && (/[^\d\s+()\-]/.test(t) || t.replace(/\D/g, '').length < 8)) {
        tel.setCustomValidity('Revisá el celular: usá solo números, con la característica (por ejemplo, 358 412 3456).');
      }
      if (mail.value.trim() && mail.validity.typeMismatch) {
        mail.setCustomValidity('Revisá el mail: tiene que ser del tipo nombre@dominio.com.');
      }
      if (grupo.dataset.contacto === 'exigir' && !t && !mail.value.trim()) {
        tel.setCustomValidity('Dejanos al menos un medio de contacto: celular/WhatsApp o mail.');
      }
    }

    function fechaISO(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    var manana = new Date(); manana.setDate(manana.getDate() + 1);
    var MIN_FECHA = fechaISO(manana);
    $$('[data-agenda] input[type="date"]').forEach(function (f) { f.min = MIN_FECHA; });

    function validarAgenda(grupo) {
      var fecha = grupo.querySelector('input[type="date"]'), turno = grupo.querySelector('select');
      fecha.setCustomValidity(''); turno.setCustomValidity('');
      if (fecha.value) {
        var dia = new Date(fecha.value + 'T12:00:00').getDay();
        if (fecha.value < MIN_FECHA) fecha.setCustomValidity('Elegí un día a partir de mañana.');
        else if (dia === 0 || dia === 6) fecha.setCustomValidity('Elegí un día hábil (de lunes a viernes).');
        else if (!turno.value) turno.setCustomValidity('Elegí también el horario.');
      } else if (turno.value) {
        fecha.setCustomValidity('Elegí también el día.');
      }
    }

    function validarCampos() {
      $$('[data-contacto]').forEach(validarContacto);
      $$('[data-agenda]').forEach(validarAgenda);
    }

    // aplicarCondiciones habilita todo lo que está dentro de una condicional visible:
    // después se vuelven a deshabilitar las líneas y filas que no corresponden.
    function refrescar() {
      E.aplicarCondiciones();
      actualizarListas();
      actualizarFilas();
    }

    // Validaciones en captura: los mensajes ya están al día cuando encuesta.js revalida
    doc.addEventListener('input', validarCampos, true);
    doc.addEventListener('change', validarCampos, true);
    // Visibilidad en burbuja: después de aplicarCondiciones de encuesta.js
    doc.addEventListener('input', refrescar);
    doc.addEventListener('change', refrescar);

    filtrarAreas();
    validarCampos();
    refrescar();
  });
})();
