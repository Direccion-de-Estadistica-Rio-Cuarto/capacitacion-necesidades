# Encuesta de necesidades de capacitación 2027 · Modelo A

Armada sobre `plantilla-encuestas` a partir del documento «Modelo A · borrador 3 · VALIDADO» (DECCyP).
`css/`, `js/` y `assets/` son copia de la plantilla. Lo propio de esta encuesta está en:

- `index.html`: las preguntas.
- `js/capacitacion-2027.js`: el catálogo de temas G y E, P2 dependiente de P1, la lista 8.1 con «Agregar otra», la tabla 8.2 (una fila por capacitación escrita), el contacto (pide al menos celular o mail) y la agenda 16.1.
- `css/capacitacion-2027.css`: subpreguntas, catálogo, grupos de campos y filas de 8.2.

## Diferencias con la plantilla
- **No es anónima.** Por eso no lleva el chip de k-anonimato ni el modal del protocolo. El celular
  y el mail van en campos `tel`/`email`, que el script no enmascara; los textos libres sí se sanitizan.
- **Sin NS/NC.** Todas las preguntas tienen `data-sin-extras`: se respetan las opciones validadas.
  «Otro/Otra» va solo donde lo pide el documento (P2, P3, P6, P8, 10.2 y P12) y es obligatorio cuando se despliega.
- **Sin pregunta de género.** El form lleva `data-sin-genero` porque esta encuesta no la necesita.
  Así, la numeración en pantalla y los nombres de campo (`p01_…` a `p16_…`) coinciden con los del documento.

## Pendiente
1. **Organigrama.** P1 y P2 salen de `ORGANIGRAMA PARA Andres.xlsx` (642 unidades). P1 tiene 14 opciones:
   la Intendencia, la Fiscalía, las 7 Secretarías y los organismos (Tribunal Administrativo, Defensoría,
   Concejo Deliberante, Tribunal de Cuentas y Tribunal de Faltas). En P2, cada una tiene un
   `<optgroup data-secretaria="…">` que empieza por la opción «(conducción)». Cada opción lleva
   `data-grupo` (la Subsecretaría o Coordinación de la que depende), y el script arma un subgrupo por cada una.
   La planilla no marca la jerarquía: se dedujo del orden y del tipo de unidad. Si una Coordinación
   aparece en el grupo equivocado, se corrige cambiando su `data-grupo`.

   **Si llega un organigrama nuevo**, las opciones se generan con los scripts de `herramientas/`:
   1. Descomprimí el `.xlsx`, que en realidad es un `.zip`, en una carpeta temporal; por ejemplo, `tmp/x`.
   2. Corré `node herramientas/leer-xlsx.js tmp/x > tmp/volcado.txt`.
   3. Corré `node herramientas/generar-organigrama.js tmp/volcado.txt tmp`. Esto genera `p1.html` y `p2.html`.
   4. Reemplazá con ellos las opciones de los dos `<select>` de `index.html`.
2. **Código del formulario del SGC.** Va en `data-codigo-formulario` y en un chip de la portada.
3. **Turnos reales para 16.1.** Hoy se elige un día hábil desde mañana y un horario de 8 a 12 hs.
4. **Endpoint a Google Sheets** (`data-endpoint`).
5. **8.2 · Personas:** el documento arranca en «10 a 15» y no hay opción para menos de 10 personas. Conviene confirmarlo.
