import { setupPlantillaLoaderFromTable } from './zpl/js/ptiLoader.js';
import { generarZPLFinal } from './zpl/js/zplGenerator.js';
import { detectPrinter, sendToPrinter, getSelectedPrinter } from './zpl/js/printerManager.js';
import { getFormData, setFormDataFromTable } from './zpl/js/formProcessor.js';

(() => {
  "use strict";

  console.log("🔵 [INIT] PTI App arrancando. (script inyectado al final del HTML => DOM ya listo)");

  /********************************************************************
   * 1. DATASET (misma estructura que ya tienes)
   ********************************************************************/
  const CLIENTES_CONFIG = {
    DRISCOLLS: {
      REGIONES: ["CHINA", "USA"],
      VARIEDADES: [
        { code: 21, name: "ROSITA" },
        { code: 22, name: "RAYMI" },
        { code: 5,  name: "TERRAPIN" },
        { code: 14, name: "DUPREE" },
        { code: 19, name: "ARANA" },
        { code: 4,  name: "KIRRA" },
      ],
      RANCHOS: ["13197", "13480", "6794"],
      LDPS: [
        "009-00385-02",
        "009-00385-04",
        "009-00385-05",
        "009-00385-06",
        "009-00385-07"
      ],
      ACOPIOS: {
        1: { planta: "Nº 009-00056-PE", aut: "000407-MINAGRI-SENASA-LA LIBERTAD" },
        2: { planta: "Nº 009-00058-PE", aut: "000814-MIDAGRI-SENASA-LA LIBERTAD" },
        3: { planta: "Nº 009-00063-PE", aut: "000816-MIDAGRI-SENASA-LA LIBERTAD" },
        4: { planta: "Nº 009-00061-PE", aut: "000817-MIDAGRI-SENASA-LA LIBERTAD" },
        5: { planta: "Nº 009-00028-PE", aut: "000063-MINAGRI-SENASA-LA LIBERTAD" },
        6: { planta: "Nº 009-00054-PE", aut: "000815-MIDAGRI-SENASA-LA LIBERTAD" },
        7: { planta: "Nº 009-00062-PE", aut: "000818-MIDAGRI-SENASA-LA LIBERTAD" },
      },
      FORMATOS: [
        { nombre: "4.4-oz",               empaque: "Convencional", regiones: ["CHINA"], variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA","KIRRA"] },
        { nombre: "4.4-oz-Jumbo",         empaque: "Jumbo",        regiones: ["CHINA"], variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA","KIRRA"] },
        { nombre: "11-Oz-Sweetest-Batch", empaque: "SB",           regiones: ["USA"],   variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA"] },
        { nombre: "18-Oz",                empaque: "Convencional", regiones: ["USA"],   variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA"] },
        { nombre: "18-Oz-Sweetest-Batch", empaque: "SB",           regiones: ["USA"],   variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA"] },
        { nombre: "Pinta",                empaque: "Convencional", regiones: ["USA"],   variedades: ["ROSITA","RAYMI","TERRAPIN","DUPREE","ARANA"] }
      ],
    },

    TERCEROS: {
      CLIENTES: {
        "SUN BELLE": {
          REGIONES: ["USA", "CHINA", "EUROPA"],
          VARIEDADES: [
            { code: 7,  name: "BILOXI" },
            { code: 17, name: "BIANCA" },
            { code: 28, name: "ABRIL BLUE" },
          ],
          RANCHOS: ["6794"],
          FORMATOS: [
            { nombre: "Caja chica abierta 4.4 oz/125 g", empaque: "Convencional", regiones: ["USA"],    variedades: ["BILOXI","BIANCA","ABRIL BLUE"] },
            { nombre: "Caja cerrada Pinta",              empaque: "Convencional", regiones: ["EUROPA"], variedades: ["BILOXI","BIANCA","ABRIL BLUE"] },
            { nombre: "Caja grande 400 g",               empaque: "Convencional", regiones: ["CHINA"],  variedades: ["BILOXI","BIANCA","ABRIL BLUE"] }
          ],
        },

        "PENG SHENG": {
          REGIONES: ["CHINA"],
          VARIEDADES: [
            { code: 29, name: "ALEXIA BLUE" },
            { code: 30, name: "EB 9-2" },
            { code: 31, name: "MEGACRESP" },
          ],
          RANCHOS: ["6794"],
          FORMATOS: [
            { nombre: "4.4-oz", empaque: "Jumbo",        regiones: ["CHINA"], variedades: ["ALEXIA BLUE","EB 9-2"] },
            { nombre: "4.4-oz", empaque: "Convencional", regiones: ["CHINA"], variedades: ["MEGACRESP"] },
          ],
        },

        "OZ BLUE": {
          REGIONES: ["USA"],
          VARIEDADES: [
            { code: 32, name: "MEGAEARLY" },
            { code: 34, name: "MEGAGIANT" },
            { code: 35, name: "MEGAONE" },
          ],
          RANCHOS: ["6794"],
          FORMATOS: [
            { nombre: "Caja SB 11 oz OZBLU",    empaque:"SB",     regiones: ["USA"], variedades: ["MEGAEARLY","MEGAGIANT"] },
            { nombre: "Caja pinta Ozblu 9.8oz", empaque:"9.8oz",  regiones: ["USA"], variedades: ["MEGAONE"] },
            { nombre: "Caja pinta punnet",      empaque:"Punnet", regiones: ["USA"], variedades: ["MEGAEARLY","MEGAGIANT","MEGAONE"] }
          ],
        },

        "GLOBAL BERRY": {
          REGIONES: ["EUROPA", "OTROS"],
          VARIEDADES: [
            { code: 7,  name: "BILOXI" },
            { code: 17, name: "BIANCA" },
          ],
          RANCHOS: ["6794"],
          FORMATOS: [
            { nombre: "125g",       empaque: "Convencional", regiones: ["EUROPA"], variedades: ["BILOXI","BIANCA"] },
            { nombre: "125g-Jumbo", empaque: "Jumbo",        regiones: ["EUROPA"], variedades: ["BILOXI","BIANCA"] },
            { nombre: "250g",       empaque: "Convencional", regiones: ["OTROS"],  variedades: ["BILOXI","BIANCA"] },
            { nombre: "300g",       empaque: "Convencional", regiones: ["OTROS"],  variedades: ["BILOXI","BIANCA"] }
          ],
        },
      },

      LDPS: [
        "009-00385-02",
        "009-00385-04",
        "009-00385-05",
        "009-00385-06",
        "009-00385-07"
      ],
      ACOPIOS: {
        1: { planta: "N° 009-00056-PE", aut: "000407-MINAGRI-SENASA-LA LIBERTAD" },
        2: { planta: "N° 009-00058-PE", aut: "000814-MIDAGRI-SENASA-LA LIBERTAD" },
        3: { planta: "N° 009-00063-PE", aut: "000816-MIDAGRI-SENASA-LA LIBERTAD" },
        4: { planta: "N° 009-00061-PE", aut: "000817-MIDAGRI-SENASA-LA LIBERTAD" },
        5: { planta: "N° 009-00028-PE", aut: "000063-MINAGRI-SENASA-LA LIBERTAD" },
        6: { planta: "N° 009-00054-PE", aut: "000815-MIDAGRI-SENASA-LA LIBERTAD" },
        7: { planta: "N° 009-00062-PE", aut: "000818-MIDAGRI-SENASA-LA LIBERTAD" },
      },
    },
  };


  /********************************************************************
   * 2. UTILIDADES BÁSICAS
   ********************************************************************/
  const PTIUtils = (() => {
    const $ = id => document.getElementById(id);

    const pad3 = n => String(n).padStart(3, "0");

    const dayOfYear = d =>
      Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

    const todayISO = () => new Date().toISOString().split("T")[0];

    return { $, pad3, dayOfYear, todayISO };
  })();


  /********************************************************************
   * 3. CAPTURA DE ELEMENTOS DOM / DETECCIÓN DE PÁGINA
   ********************************************************************/
  const $ = PTIUtils.$;

  // index.html
  const tabla       = document.getElementById("tablaRegistros") || null;
  const tablaBody   = tabla ? tabla.querySelector("tbody") : null;

  // config_imprimir_etiqueta.html
  const selVariedad    = $("selVariedad");
  const selLdp         = $("selLdp");
  const selAcopioPA    = $("selAcopioPA");
  const selAcopioProd  = $("selAcopioProd");
  const selRancho      = $("selRancho");
  const inpFecha       = $("inpFecha");
  const outJuliano     = $("outJuliano");
  const copiasElem     = document.getElementById("copias") || $("copiasId");

  const btnPreview     = $("btnPreview");
  const btnImprimir    = $("btnImprimir");
  const btnCerrar      = $("btnCerrar");

  // ajustes de impresión simulada
  const mL             = $("mL");
  const mR             = $("mR");
  const mT             = $("mT");
  const mB             = $("mB");
  const dark           = $("dark");
  const darkValue      = $("darkValue");

  // vista previa canvas
  const labelCanvas    = document.getElementById("labelCanvas");
  const zplArea        = $("zplArea");

  // etiquetas opcionales en UI textual (si no existen, no falla)
  const vVariedad      = $("v-variedad");
  const vLdp           = $("v-ldp");
  const vPlanta        = $("v-planta");
  const vAut           = $("v-aut");
  const vProd          = $("v-prod");

  // detección de página
  const esIndex  = !!tablaBody;
  const esConfig = !!inpFecha || !!btnImprimir || !!selVariedad;

  console.log("🔎 [PAGE DETECT] esIndex =", esIndex, "| esConfig =", esConfig);


  /********************************************************************
   * 4. GET SETUP POR CLIENTE
   ********************************************************************/
  function getClienteSetup(nombreCliente) {
    console.log("🔵 [getClienteSetup] cliente =", nombreCliente);

    if (nombreCliente === "DRISCOLLS") {
      return {
        tipo: "DRISCOLLS",
        cfgClienteEspecifico: CLIENTES_CONFIG.DRISCOLLS,
        cfgLDPS: CLIENTES_CONFIG.DRISCOLLS.LDPS,
        cfgACOPIOS: CLIENTES_CONFIG.DRISCOLLS.ACOPIOS
      };
    }

    if (CLIENTES_CONFIG.TERCEROS.CLIENTES[nombreCliente]) {
      return {
        tipo: "TERCEROS",
        cfgClienteEspecifico: CLIENTES_CONFIG.TERCEROS.CLIENTES[nombreCliente],
        cfgLDPS: CLIENTES_CONFIG.TERCEROS.LDPS,
        cfgACOPIOS: CLIENTES_CONFIG.TERCEROS.ACOPIOS
      };
    }

    console.warn("⚠️ [getClienteSetup] cliente no reconocido:", nombreCliente);
    return {
      tipo: null,
      cfgClienteEspecifico: null,
      cfgLDPS: [],
      cfgACOPIOS: {}
    };
  }


  /********************************************************************
   * 5. ENRIQUECER / NORMALIZAR DATOS DE LA FILA
   ********************************************************************/
  function prepararDatosFila(datosFilaBase) {
    console.log("🚧 [prepararDatosFila] datosFilaBase =", datosFilaBase);

    const clienteNombre =
      datosFilaBase.cliente ||
      datosFilaBase.consignatario ||
      datosFilaBase.importador ||
      "";

    const { tipo, cfgClienteEspecifico, cfgLDPS } = getClienteSetup(clienteNombre);

    // variedades válidas
    let variedadesValidas = [];
    if (cfgClienteEspecifico && Array.isArray(cfgClienteEspecifico.FORMATOS)) {
      cfgClienteEspecifico.FORMATOS.forEach(f => {
        const mFormato = f.nombre === datosFilaBase.formato;
        const mEmpaque = f.empaque === datosFilaBase.empaque;
        const mRegion  = (f.regiones || []).includes(datosFilaBase.region);
        if (mFormato && mEmpaque && mRegion) {
          (f.variedades || []).forEach(vName => {
            if (!variedadesValidas.includes(vName)) variedadesValidas.push(vName);
          });
        }
      });
    }

    if (!variedadesValidas.length && cfgClienteEspecifico?.VARIEDADES) {
      variedadesValidas = cfgClienteEspecifico.VARIEDADES.map(v => v.name);
    }

    const variedadDefault = variedadesValidas[0] || "";
    const ldpDefault      = (cfgLDPS && cfgLDPS[0]) || "";
    const acopioDefault   = "1";

    let ranchoDefault = "";
    if (cfgClienteEspecifico?.RANCHOS?.length) {
      ranchoDefault = cfgClienteEspecifico.RANCHOS[0];
    } else if (CLIENTES_CONFIG.DRISCOLLS.RANCHOS?.length) {
      ranchoDefault = CLIENTES_CONFIG.DRISCOLLS.RANCHOS[0];
    } else {
      const primerTercero = Object.values(CLIENTES_CONFIG.TERCEROS.CLIENTES)[0];
      if (primerTercero?.RANCHOS?.length) {
        ranchoDefault = primerTercero.RANCHOS[0];
      }
    }

    const fechaDefault = datosFilaBase.fecha || PTIUtils.todayISO();

    const enriched = {
      ...datosFilaBase,
      tipoCliente: tipo || "",
      variedad: variedadDefault,
      ldp: ldpDefault,
      acopioPA: acopioDefault,
      acopioProd: acopioDefault,
      rancho: ranchoDefault,
      fecha: fechaDefault
    };

    console.log("✅ [prepararDatosFila] enriched =", enriched);
    return enriched;
  }


  /********************************************************************
   * 6. INDEX: RENDER TABLA
   ********************************************************************/
  function generarTabla() {
    if (!esIndex || !tablaBody) return;

    console.log("🔵 [generarTabla] Renderizando filas...");

    tablaBody.innerHTML = "";

    // DRISCOLLS
    CLIENTES_CONFIG.DRISCOLLS.FORMATOS.forEach(fmt => {
      (fmt.regiones || []).forEach(region => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>DRISCOLLS</td>
          <td>${region}</td>
          <td>DRISCOLLS</td>
          <td>DRISCOLLS</td>
          <td>${fmt.nombre}</td>
          <td>${fmt.empaque}</td>
          <td><button class="btn btn-primary btn-sm btn-abrir">Configurar e imprimir</button></td>
        `;
        tablaBody.appendChild(tr);
      });
    });

    // TERCEROS
    Object.keys(CLIENTES_CONFIG.TERCEROS.CLIENTES).forEach(nombreCliente => {
      const infoCliente = CLIENTES_CONFIG.TERCEROS.CLIENTES[nombreCliente];
      (infoCliente.FORMATOS || []).forEach(fmt => {
        (fmt.regiones || []).forEach(region => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${nombreCliente}</td>
            <td>${region}</td>
            <td>${nombreCliente}</td>
            <td>${nombreCliente}</td>
            <td>${fmt.nombre}</td>
            <td>${fmt.empaque}</td>
            <td><button class="btn btn-primary btn-sm btn-abrir">Configurar e imprimir</button></td>
          `;
          tablaBody.appendChild(tr);
        });
      });
    });

    console.log("🟢 [generarTabla] OK. Filas:", tablaBody.querySelectorAll("tr").length);
  }

  if (esIndex) {
    generarTabla();
  }


  /********************************************************************
   * 7. INDEX: CLICK EN "CONFIGURAR E IMPRIMIR"
   *    -> guarda fila en localStorage y navega a config
   ********************************************************************/
  if (esIndex && tabla) {
    console.log("🔵 [INDEX] Attach listener tabla...");

    tabla.addEventListener("click", (event) => {
      const boton = event.target.closest(".btn-abrir");
      if (!boton) return;
      const fila = boton.closest("tr");
      if (!fila) return;

      try {
        console.log("👉 [INDEX CLICK] rowIndex =", fila.rowIndex);

        const tds = fila.querySelectorAll("td");
        if (!tds || tds.length < 6) throw new Error("Fila inválida (<6 cols)");

        const filaBase = {
          cliente:       (tds[0]?.textContent || "").trim(),
          region:        (tds[1]?.textContent || "").trim(),
          consignatario: (tds[2]?.textContent || "").trim(),
          importador:    (tds[3]?.textContent || "").trim(),
          formato:       (tds[4]?.textContent || "").trim(),
          empaque:       (tds[5]?.textContent || "").trim(),
          filaIndex:     fila.rowIndex ?? null
        };

        console.log("📝 [INDEX CLICK] filaBase =", filaBase);

        const datosFinales = prepararDatosFila(filaBase);

        console.log("💾 [INDEX CLICK] Guardando datosFila =", datosFinales);
        localStorage.setItem("datosFila", JSON.stringify(datosFinales));

        // flujo original: notificar módulos
        if (typeof setFormDataFromTable === "function") {
          try { setFormDataFromTable(datosFinales); }
          catch(e){ console.warn("⚠️ setFormDataFromTable error:", e); }
        }
        if (typeof setupPlantillaLoaderFromTable === "function") {
          try { setupPlantillaLoaderFromTable(datosFinales); }
          catch(e){ console.warn("⚠️ setupPlantillaLoaderFromTable error:", e); }
        }

        console.log("➡️ [INDEX CLICK] Ir a config_imprimir_etiqueta.html");
        window.location.href = "config_imprimir_etiqueta.html";

      } catch (err) {
        console.error("🔴 [INDEX CLICK] Error:", err);
        alert("Error al procesar la fila. Revisa la consola.");
      }
    });
  }


  /********************************************************************
   * 8. HELPERS PARA LLENAR SELECTS
   ********************************************************************/
  function fillSelectFromArray(selectEl, arr, selectedValue, labelLog) {
    if (!selectEl) {
      console.log(`❌ [fillSelectFromArray] ${labelLog}: select no existe`);
      return;
    }

    console.log(`🔧 [fillSelectFromArray] ${labelLog}`, { arr, selectedValue });

    selectEl.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "-- Selecciona --";
    selectEl.appendChild(opt0);

    (arr || []).forEach(text => {
      const op = document.createElement("option");
      op.value = text;
      op.textContent = text;
      selectEl.appendChild(op);
    });

    if (selectedValue) {
      selectEl.value = selectedValue;
      if (selectEl.value !== selectedValue) {
        console.warn(`⚠️ [fillSelectFromArray] '${selectedValue}' no estaba, se fuerza.`);
        const forced = document.createElement("option");
        forced.value = selectedValue;
        forced.textContent = selectedValue;
        selectEl.appendChild(forced);
        selectEl.value = selectedValue;
      }
    }

    console.log(`✅ [fillSelectFromArray] ${labelLog} ->`, selectEl.value);
  }

  function fillSelectFromAcopios(selectEl, acopiosObj, selectedValue, labelLog) {
    if (!selectEl) {
      console.log(`❌ [fillSelectFromAcopios] ${labelLog}: select no existe`);
      return;
    }

    console.log(`🔧 [fillSelectFromAcopios] ${labelLog}`, { acopiosObj, selectedValue });

    selectEl.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "-- Selecciona --";
    selectEl.appendChild(opt0);

    Object.keys(acopiosObj || {}).forEach(key => {
      const info = acopiosObj[key];
      const op = document.createElement("option");
      op.value = key;
      op.textContent = `${key} - ${info.planta}`;
      selectEl.appendChild(op);
    });

    if (selectedValue) {
      selectEl.value = selectedValue;
      if (selectEl.value !== selectedValue) {
        console.warn(`⚠️ [fillSelectFromAcopios] '${selectedValue}' no estaba, se fuerza.`);
        const forced = document.createElement("option");
        forced.value = selectedValue;
        forced.textContent = selectedValue;
        selectEl.appendChild(forced);
        selectEl.value = selectedValue;
      }
    }

    console.log(`✅ [fillSelectFromAcopios] ${labelLog} ->`, selectEl.value);
  }


  /********************************************************************
   * 9. STORAGE UTILS + CÁLCULOS (CONFIG)
   ********************************************************************/
  function getDatosFilaFromStorage() {
    try {
      const raw = localStorage.getItem("datosFila");
      console.log("📥 [getDatosFilaFromStorage] RAW =", raw);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      console.log("📦 [getDatosFilaFromStorage] PARSED =", parsed);
      return parsed || {};
    } catch (err) {
      console.error("❌ [getDatosFilaFromStorage] parse fail:", err);
      return {};
    }
  }

  function calcularJulianoActual() {
    if (!inpFecha || !inpFecha.value) return "---";
    const d = new Date(inpFecha.value);
    if (isNaN(d)) return "---";
    return PTIUtils.pad3(PTIUtils.dayOfYear(d));
  }


  /********************************************************************
   * 10. DIBUJO DEL CANVAS
   *
   * - Usa márgenes mL/mT como offset principal (mueves todo el bloque).
   * - mR/mB por ahora solo los guardo en logs, pero puedes usarlos para recorte.
   * - Oscuridad "dark": en vez de overlay, ahora ajusta el color del texto.
   *   → más alto = más negro intenso. simularemos con un color rgba(0,0,0,alpha)
   *   alpha va de ~0.4 (claro) a 1.0 (oscuro).
   ********************************************************************/
  function getInkRGBA() {
    const sliderVal = Number(dark?.value || "0"); // 0..8
    // map 0..8 → alpha 0.4 .. 1.0 lineal
    const alpha = 0.4 + (sliderVal / 8) * 0.6;
    return `rgba(0,0,0,${alpha.toFixed(2)})`;
  }

  function buildPreviewDataForCanvas() {
    const datosFila = getDatosFilaFromStorage();
    const { cfgACOPIOS } = getClienteSetup(
      datosFila.cliente || datosFila.consignatario || datosFila.importador || ""
    );

    const juliano = calcularJulianoActual();
    const plantaInfo = cfgACOPIOS?.[selAcopioPA?.value || ""] || { planta:"", aut:"" };

    const codProdText =
      `${juliano} ${selRancho?.value || ""}-A${selAcopioProd?.value || ""}`.trim();

    return {
      variedad:     selVariedad?.value || "",
      ldp:          selLdp?.value || "",
      planta:       plantaInfo.planta || "",
      aut:          plantaInfo.aut || "",
      fecha:        inpFecha?.value || "",
      juliano,
      rancho:       selRancho?.value || "",
      acopioProd:   selAcopioProd?.value || "",
      codProd:      codProdText,
      oscuridadRGBA: getInkRGBA(),

      // márgenes
      offXmm: parseFloat(mL?.value || "0"), // margen izq mm simulada
      offYmm: parseFloat(mT?.value || "0"), // margen sup mm simulada
      // guardo también por debug:
      mRmm:  parseFloat(mR?.value || "0"),
      mBmm:  parseFloat(mB?.value || "0"),
    };
  }

  function dibujarCanvasPreview() {
    if (!esConfig) return;
    if (!labelCanvas) {
      console.warn("⚠️ [dibujarCanvasPreview] No hay #labelCanvas.");
      return;
    }

    const ctx = labelCanvas.getContext("2d");
    if (!ctx) {
      console.error("❌ [dibujarCanvasPreview] sin contexto 2D.");
      return;
    }

    // armar los datos actuales
    const data = buildPreviewDataForCanvas();
    console.group("🖼️ [dibujarCanvasPreview] Redibujando canvas con:", data);

    // limpiar fondo totalmente blanco
    ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);

    // convertir "mm" a "px" aproximado
    // etiqueta simulada 100x50 mm -> canvas 800x400 px => ~8 px/mm en X e Y
    const PX_PER_MM = 8;
    const offsetX = data.offXmm * PX_PER_MM;
    const offsetY = data.offYmm * PX_PER_MM;

    // estilo de texto según densidad (oscuridad)
    ctx.fillStyle = data.oscuridadRGBA;
    ctx.strokeStyle = data.oscuridadRGBA;
    ctx.lineWidth = 1;

    // tipografía base
    ctx.font = "20px monospace";
    let y = offsetY + 40;
    const dy = 30;

    ctx.fillText("Variedad: " + data.variedad, offsetX + 20, y);        y += dy;
    ctx.fillText("LDP: "      + data.ldp,      offsetX + 20, y);        y += dy;
    ctx.fillText("Planta: "   + data.planta,   offsetX + 20, y);        y += dy;
    ctx.fillText("Aut.: "     + data.aut,      offsetX + 20, y);        y += dy;
    ctx.fillText("Fecha: "    + data.fecha,    offsetX + 20, y);        y += dy;
    ctx.fillText("Juliano: "  + data.juliano,  offsetX + 20, y);        y += dy;
    ctx.fillText("Rancho: "   + data.rancho,   offsetX + 20, y);        y += dy;
    ctx.fillText("Acopio: "   + data.acopioProd, offsetX + 20, y);      y += dy;

    ctx.fillText("Cod Prod:", offsetX + 20, y);
    ctx.fillText(data.codProd, offsetX + 160, y);
    y += dy + 5;

    // separador
    ctx.beginPath();
    ctx.moveTo(offsetX + 10, y);
    ctx.lineTo(offsetX + 760, y);
    ctx.stroke();
    y += 20;

    ctx.font = "16px monospace";
    ctx.fillText("PREVIEW SIMULADA (no es resolución real ZPL)", offsetX + 20, y);

    console.groupEnd();

    // actualizar spans de preview textual (si existen)
    if (vVariedad) vVariedad.textContent = data.variedad;
    if (vLdp)      vLdp.textContent      = data.ldp;
    if (vPlanta)   vPlanta.textContent   = data.planta;
    if (vAut)      vAut.textContent      = data.aut;
    if (outJuliano) outJuliano.textContent = data.juliano;
    if (vProd)     vProd.textContent     = data.codProd;
    if (darkValue && dark) darkValue.textContent = dark.value;
  }


  /********************************************************************
   * 11. POBLAR FORM EN CONFIG (auto al cargar config)
   ********************************************************************/
  function poblarFormularioEnConfig() {
    if (!esConfig) return;
    console.group("🔵 [poblarFormularioEnConfig] mapeo inicial de formulario...");

    const raw = localStorage.getItem("datosFila");
    console.log("🗃️ raw localStorage.datosFila =", raw);
    if (!raw) {
      console.warn("⚠️ no hay datosFila en storage.");
      console.groupEnd();
      return;
    }

    let datosFilaParsed;
    try {
      datosFilaParsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ parse error datosFila:", err);
      console.groupEnd();
      return;
    }

    const datosListos = prepararDatosFila(datosFilaParsed);
    localStorage.setItem("datosFila", JSON.stringify(datosListos));
    console.log("💾 datosListos normalizado y guardado:", datosListos);

    // obtener cfg del cliente
    const clienteNombre =
      datosListos.cliente ||
      datosListos.consignatario ||
      datosListos.importador ||
      "";

    const { cfgClienteEspecifico, cfgLDPS, cfgACOPIOS } = getClienteSetup(clienteNombre);

    // variedades válidas para ese formato+empaque+región
    let variedadesDisponibles = [];
    if (cfgClienteEspecifico?.FORMATOS) {
      cfgClienteEspecifico.FORMATOS.forEach(f => {
        const matchF = (f.nombre === datosListos.formato);
        const matchE = (f.empaque === datosListos.empaque);
        const matchR = (f.regiones || []).includes(datosListos.region);
        if (matchF && matchE && matchR) {
          (f.variedades || []).forEach(vName => {
            if (!variedadesDisponibles.includes(vName)) {
              variedadesDisponibles.push(vName);
            }
          });
        }
      });
    }
    if (!variedadesDisponibles.length && cfgClienteEspecifico?.VARIEDADES) {
      variedadesDisponibles = cfgClienteEspecifico.VARIEDADES.map(v => v.name);
    }

    // ranchos candidate
    let ranchosDisponibles = [];
    if (cfgClienteEspecifico?.RANCHOS?.length) {
      ranchosDisponibles = cfgClienteEspecifico.RANCHOS.slice();
    } else if (CLIENTES_CONFIG.DRISCOLLS.RANCHOS?.length) {
      ranchosDisponibles = CLIENTES_CONFIG.DRISCOLLS.RANCHOS.slice();
    }

    // llenar selects
    fillSelectFromArray(
      selVariedad,
      variedadesDisponibles,
      datosListos.variedad,
      "selVariedad"
    );

    fillSelectFromArray(
      selLdp,
      cfgLDPS || [],
      datosListos.ldp,
      "selLdp"
    );

    fillSelectFromAcopios(
      selAcopioPA,
      cfgACOPIOS || {},
      datosListos.acopioPA,
      "selAcopioPA"
    );

    fillSelectFromAcopios(
      selAcopioProd,
      cfgACOPIOS || {},
      datosListos.acopioProd,
      "selAcopioProd"
    );

    fillSelectFromArray(
      selRancho,
      ranchosDisponibles,
      datosListos.rancho,
      "selRancho"
    );

    // fecha y copias
    if (inpFecha) {
      inpFecha.value = datosListos.fecha || PTIUtils.todayISO();
      console.log("📅 inpFecha.value =", inpFecha.value);
    }
    if (copiasElem && datosListos.copias) {
      copiasElem.value = datosListos.copias;
    }

    // notificar módulos externos (tu flujo original)
    if (typeof setFormDataFromTable === "function") {
      try { setFormDataFromTable(datosListos); }
      catch(e){ console.warn("⚠️ setFormDataFromTable error:", e); }
    }
    if (typeof setupPlantillaLoaderFromTable === "function") {
      try { setupPlantillaLoaderFromTable(datosListos); }
      catch(e){ console.warn("⚠️ setupPlantillaLoaderFromTable error:", e); }
    }

    // actualizar vista previa inmediatamente
    dibujarCanvasPreview();

    console.groupEnd();
  }

  if (esConfig) {
    poblarFormularioEnConfig(); // <-- Esto mapea el form apenas cargo la página config
  }


  /********************************************************************
   * 12. GENERAR Y MOSTRAR ZPL
   ********************************************************************/
  async function generateAndShowZPL() {
    console.group("🧾 [generateAndShowZPL] Generando ZPL...");
    try {
      const zpl = await generarZPLFinal();
      console.log("📄 ZPL =", zpl);

      if (zplArea) {
        zplArea.value = zpl;
        console.log("📝 zplArea.value actualizado.");
      } else {
        console.warn("⚠️ No existe #zplArea en DOM.");
      }

      console.groupEnd();
      return zpl;
    } catch (err) {
      console.error("❌ [generateAndShowZPL] Error:", err);
      console.groupEnd();
      throw err;
    }
  }


  /********************************************************************
   * 13. BOTÓN PREVIEW
   *     - redibuja canvas con offsets/oscuro actuales
   *     - genera ZPL y lo muestra
   ********************************************************************/
  async function handlePreviewClick() {
    if (!esConfig) return;
    console.group("👁️ [handlePreviewClick] Preview solicitado...");

    // 1. redibujo canvas con la data actual
    dibujarCanvasPreview();

    // 2. genero ZPL y lo muestro
    try {
      await generateAndShowZPL();
      console.log("✅ Preview lista y ZPL generado.");
    } catch (err) {
      alert("Error generando preview/ZPL: " + (err.message || err));
    }

    console.groupEnd();
  }


  /********************************************************************
   * 14. IMPRESIÓN
   ********************************************************************/
  async function printNow() {
    if (!esConfig) return;
    console.group("🖨️ [printNow] Inicio impresión...");

    try {
      const data = getFormData();
      console.log("📦 getFormData() =>", data);

      // Validaciones mínimas
      if (!data.variedad) { alert("Selecciona una variedad."); throw new Error("Falta variedad"); }
      if (!data.ldp)      { alert("Selecciona LDP.");         throw new Error("Falta LDP"); }
      if (!data.fecha)    { alert("Selecciona fecha.");       throw new Error("Falta fecha"); }

      // Actualizar canvas preview con todo lo actual
      dibujarCanvasPreview();

      // Generar ZPL final y colocarlo en textarea
      const zpl = await generateAndShowZPL();
      console.log("🖨️ ZPL listo:\n", zpl);

      // Confirmar copias
      const copiasNum = Math.min(200, Math.max(1, data.copias));
      const ok = confirm(`Vas a imprimir ${copiasNum} copia(s). ¿Continuar?`);
      if (!ok) {
        console.warn("⏹️ Usuario canceló impresión.");
        console.groupEnd();
        return;
      }

      // Asegurar impresora
      if (!getSelectedPrinter()) {
        console.log("🔍 No hay impresora activa. detectPrinter()...");
        try {
          await detectPrinter();
        } catch (e) {
          console.error("❌ No se detectó impresora:", e);
          alert("No se detectó impresora. Usa 'Detectar impresoras' o revisa BrowserPrint service.");
          console.groupEnd();
          return;
        }
      }

      await sendToPrinter(zpl);

      const printerName = getSelectedPrinter()?.name || "desconocida";
      alert("Etiqueta enviada a la impresora: " + printerName);
      console.log("🟢 Envío correcto a:", printerName);

    } catch (err) {
      console.error("❌ [printNow] Error:", err);
      alert("🖨️ Error: " + (err.message || err));
    }

    console.groupEnd();
  }


  /********************************************************************
   * 15. LISTENERS EN CONFIG
   *     - TODOS los cambios refrescan el canvas EN TIEMPO REAL
   *       (márgenes y oscuridad incluidos)
   ********************************************************************/
  if (esConfig) {
    console.log("🔵 [CONFIG] Registrando listeners en tiempo real...");

    // cambios lógicos de datos PTI
    [selVariedad, selLdp, selAcopioPA, selAcopioProd, selRancho, inpFecha].forEach(el => {
      if (!el) return;
      el.addEventListener("change", () => {
        console.log("🔄 [UI CHANGE]", el.id, "-> redibujarCanvasPreview()");
        dibujarCanvasPreview();
      });
    });

    // márgenes y oscuridad (en vivo)
    [mL, mR, mT, mB, dark].forEach(el => {
      if (!el) return;
      const evt = (el === dark) ? "input" : "input";
      el.addEventListener(evt, () => {
        console.log("🎚️ [LIVE TUNING]", el.id, "cambió => redibujarCanvasPreview()");
        dibujarCanvasPreview();
      });
    });

    // botón Preview
    if (btnPreview) {
      btnPreview.addEventListener("click", async () => {
        console.log("👁️ [btnPreview] click");
        await handlePreviewClick();
      });
    }

    // botón Imprimir
    let printing = false;
    if (btnImprimir) {
      btnImprimir.addEventListener("click", async (e) => {
        e.preventDefault();
        if (printing) {
          console.warn("⏳ [btnImprimir] doble click bloqueado.");
          return;
        }
        printing = true;
        try {
          await printNow();
        } finally {
          setTimeout(() => { printing = false; }, 1200);
        }
      });
    }

    // botón Cerrar
    if (btnCerrar) {
      btnCerrar.addEventListener("click", () => {
        console.log("🟠 [btnCerrar] Click. Volviendo a index.html...");
        window.location.href = "index.html";
      });
    }
  }


  /********************************************************************
   * 16. LOG READY
   ********************************************************************/
  if (esIndex) {
    console.log("✅ [READY INDEX] Tabla lista, listener activo.");
  }
  if (esConfig) {
    console.log("✅ [READY CONFIG] Form mapeado, canvas preview dinámico activo, preview/imprimir OK.");
  }

})(); // end IIFE
