// ptiLoader.js
// ===============================
// Estado interno del módulo
// ===============================
let plantillasName = [];
let plantillaSeleccionada = {
  nombre: null,     // string del archivo encontrado (ej: "driscolls-usa-pinta-convencional.prn")
  contenido: null,  // texto ZPL de la plantilla cargada
  campos: null      // últimos campos leídos de la tabla (para debug/uso externo)
};

// ===============================
// Carga catálogo de plantillas
// ===============================
try {
  const res = await fetch('./zpl/plantillas/plantillasName.json');
  if (!res.ok) throw new Error('No se pudo cargar plantillasName.json');
  plantillasName = await res.json(); // array de nombres de archivos .prn
  console.log('✅ plantillasName.json cargado:', plantillasName.length, 'items');
} catch (err) {
  console.error('❌ Error cargando plantillasName.json:', err);
}

// ===============================
// Utils
// ===============================
function normalize(v) {
  return (v ?? '').toString().trim().toLowerCase();
}

async function cargarPlantilla(nombreArchivo) {
  try {
    const response = await fetch(`./zpl/plantillas/${nombreArchivo}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${nombreArchivo}`);
    return await response.text();
  } catch (err) {
    console.error('❌ Error cargando plantilla:', err);
    return '';
  }
}

// Suma puntos por cada token que aparece en el nombre del archivo
function puntuarCoincidencia(nombreArchivo, tokens) {
  const n = nombreArchivo.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    const token = t.toLowerCase();
    if (token && n.includes(token)) score += 1;
  }
  return score;
}

// Busca el mejor archivo en plantillasName a partir de los campos de la fila
function elegirArchivoPlantillaPorCampos(camposFila) {
  // Campos esperados desde la fila
  const cliente       = normalize(camposFila.cliente);
  const destino       = normalize(camposFila.destino);
  const consignatario = normalize(camposFila.consignatario);
  const importador    = normalize(camposFila.importador);
  const formato       = normalize(camposFila.formato);
  const tipo          = normalize(camposFila.tipoEmpaque);

  // Tokens de búsqueda en orden de importancia aproximada
  const tokens = [cliente, destino, formato, tipo, consignatario, importador]
    .filter(Boolean);

  // Si no hay catálogo cargado, salimos
  if (!Array.isArray(plantillasName) || plantillasName.length === 0) {
    console.warn('⚠️ plantillasName vacío; no se puede seleccionar por catálogo.');
    return null;
  }

  // Puntuar todas las plantillas
  let mejor = null;
  let mejorScore = -1;

  for (const nombre of plantillasName) {
    const score = puntuarCoincidencia(nombre, tokens);
    // Heurística: preferir archivos que terminen en .prn y mayor score
    if (score > mejorScore && nombre.toLowerCase().endsWith('.prn')) {
      mejor = nombre;
      mejorScore = score;
    }
  }

  // Regla: debe superar cierto umbral (p.ej. al menos 2 tokens)
  if (mejor && mejorScore >= 2) {
    return mejor;
  }

  // fallback: intenta algo con cliente + formato si existe
  const simple = plantillasName.find(n =>
    n.toLowerCase().includes(cliente) &&
    n.toLowerCase().includes(formato) &&
    n.toLowerCase().endsWith('.prn')
  );
  if (simple) return simple;

  return null; // no se encontró nada convincente
}

// Lee los textos de la fila (en base al DOM de .wrap)
function leerCamposDeFila(tr) {
  const tds = tr.querySelectorAll('td');
  if (tds.length < 6) {
    console.warn('⚠️ La fila no tiene 6 columnas esperadas.');
  }
  // Orden esperado según tu HTML:
  // 0 Cliente | 1 Destino | 2 Consignatario | 3 Importador | 4 Formato | 5 Tipo de empaque
  return {
    cliente:        tds[0]?.textContent ?? '',
    destino:        tds[1]?.textContent ?? '',
    consignatario:  tds[2]?.textContent ?? '',
    importador:     tds[3]?.textContent ?? '',
    formato:        tds[4]?.textContent ?? '',
    tipoEmpaque:    tds[5]?.textContent ?? ''
  };
}


// 1) Vincula el botón “Configurar e imprimir” para seleccionar/cargar la plantilla
export function setupPlantillaLoaderFromTable({
  botonSelector = '#btnAbrir',
  modalSelector = '#modal',
  abrirModal = (el) => { el?.classList?.add('open'); } // define cómo abres tu modal
} = {}) {
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest(botonSelector);
    if (!btn) return;

    try {
      const tr = btn.closest('tr');
      if (!tr) throw new Error('No se encontró la fila (tr) asociada al botón.');

      const campos = leerCamposDeFila(tr);
      const archivo = elegirArchivoPlantillaPorCampos(campos);

      let nombreFinal = archivo;
      let contenido = '';

      if (!archivo) {
        console.warn('⚠️ No se encontró plantilla por tabla; usando fallback imagen_canvas.prn');
        nombreFinal = 'imagen_canvas.prn';
      }

      contenido = await cargarPlantilla(nombreFinal);

      if (!contenido) {
        // último fallback si la carga falla: intenta imagen_canvas.prn
        if (nombreFinal !== 'imagen_canvas.prn') {
          console.warn('⚠️ Reintentando con imagen_canvas.prn');
          nombreFinal = 'imagen_canvas.prn';
          contenido = await cargarPlantilla(nombreFinal);
        }
      }

      // Guardamos en el estado del módulo
      plantillaSeleccionada = {
        nombre: nombreFinal,
        contenido,
        campos
      };

      // Notificamos al resto de la app (el modal, etc.)
      const evCustom = new CustomEvent('plantilla:cargada', {
        detail: {
          nombre: nombreFinal,
          contenido,
          campos
        }
      });
      document.dispatchEvent(evCustom);

      // Abre el modal (si así lo deseas)
      const modal = document.querySelector(modalSelector);
      abrirModal?.(modal);

      console.log('✅ Plantilla lista:', nombreFinal, 'Campos:', campos);
    } catch (err) {
      console.error('❌ Error seleccionando/cargando plantilla desde tabla:', err);
    }
  });
}

// 2) Devuelve la plantilla actualmente seleccionada (por click en tabla).
//    Si aún no hay selección, intenta una auto-selección usando la PRIMERA fila de la tabla.
//    Y si aun así falla, cae a imagen_canvas.prn.
export async function obtenerTextoPlantilla() {
  if (plantillaSeleccionada?.contenido) {
    return plantillaSeleccionada.contenido;
  }
  // Intento de auto-selección a partir de la primera fila de la tabla
  try {
    const tr = document.querySelector('.wrap .table-wrap tbody tr');
    if (tr) {
      const campos = leerCamposDeFila(tr);
      const archivo = elegirArchivoPlantillaPorCampos(campos) || 'imagen_canvas.prn';
      const contenido = await cargarPlantilla(archivo);
      plantillaSeleccionada = { nombre: archivo, contenido, campos };
      console.log('↪️ Auto-selección de plantilla por primera fila:', archivo);
      return contenido;
    }
  } catch (e) {
    console.warn('Auto-selección falló:', e);
  }

  // Fallback final
  console.warn('⚠️ Sin selección previa: usando imagen_canvas.prn');
  return await cargarPlantilla('imagen_canvas.prn');
}
