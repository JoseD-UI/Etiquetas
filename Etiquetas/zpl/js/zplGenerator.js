// ==========================================================
// 🧩 Generador ZPL - Controlador maestro mejorado
// ==========================================================

import { obtenerTextoPlantilla } from './ptiLoader.js'
import { processFormForZPL, getFormData } from './formProcessor.js';

// Configuración inicial
let plantillaConfig = {};

try {
  const res = await fetch('./zpl/plantillas/configPlantillas.json');
  if (!res.ok) throw new Error('No se pudo cargar configPlantillas.json');
  plantillaConfig = await res.json();
  console.log('✅ Configuración de plantillas cargada correctamente.');
} catch (err) {
  console.error('❌ Error cargando configPlantillas.json:', err);
}

// ==========================================================
// 🚀 FUNCIÓN PRINCIPAL
// ==========================================================
export async function generarZPLFinal() {
  try {
    console.group("🧩 Generador ZPL - Proceso Iniciado");

    // ---------------------------
    // 1️⃣ PLANTILLA
    // ---------------------------
    const zplOriginal = await obtenerTextoPlantilla();
    if (!zplOriginal) throw new Error("Plantilla .PRN no encontrada.");
    console.log("📄 Plantilla base obtenida correctamente.");

    // ---------------------------
    // 2️⃣ FORMULARIO
    // ---------------------------
    const formData = getFormData();;
    console.log("🧾 Datos originales del formulario:", formData);
    const cliente = (formData.cliente || "").toLowerCase();
    const formato = (formData.formato || "").toLowerCase();
    const region = (formData.region || "").toLowerCase();
    console.log(`🔍 Datos para configuracion de paltilla: Cliente: ${cliente}, Formato: ${formato}, Región: ${region}`);

    // ---------------------------
    // 3️⃣ FORMATO NORMALIZADO
    // ---------------------------
    const valores = processFormForZPL(formData);
    console.log("🔍 Datos procesados:", valores);

    // ---------------------------
    // 4️⃣ CONFIGURACIÓN DEL FORMATO
    // ---------------------------
    const claveConfig = `${cliente}-${region}-${formato}`;
    const config = plantillaConfig[claveConfig];
    if (!config) console.warn(`⚠️ No se encontró configuración específica para ${claveConfig}`);

    const estiloGeneral = config?.general || { font: "Arial", fontSize: 20, bold: false, alineacion: "left" };  // Fuente más grande
    const estiloVariedad = config?.variedadCode || estiloGeneral;
    const estiloFecha = config?.fecha || estiloGeneral;
    const estiloLote = config?.lote || estiloGeneral;

    console.table({
      "🖋️ General": JSON.stringify(estiloGeneral),
      "🧬 Variedad": JSON.stringify(estiloVariedad),
      "📆 Fecha": JSON.stringify(estiloFecha),
      "🏷️ Lote": JSON.stringify(estiloLote)
    });

    // ==========================================================
    // 5️⃣ FUNCIÓN DE CONVERSIÓN A IMAGEN MONOCROMÁTICA Z64
    // ==========================================================
    function generarChecksum(bytes) {
      let sum = 0;
      for (let i = 0; i < bytes.length; i++) sum = (sum + bytes[i]) & 0xFFFF;
      return sum.toString(16).toUpperCase().padStart(4, '0');
    }

    async function textoAImagenZ64(texto, estilo = {}) {
      if (!texto) return "";

      // Parámetros de la impresora y fuente
      const PRINTER_DPI = 300;  // DPI de la impresora (más alto para mayor resolución)
      const BASE_DPI = 96;      // Resolución base para el canvas
      const scale = Math.round(PRINTER_DPI / BASE_DPI); // Escala para coincidir con el DPI de la impresora
      const font = estilo.font || "Arial";  // Fuente
      const fontSize = estilo.fontSize || 40;  // Tamaño de la fuente (aumentado a 40 para mejor visibilidad)
      const fontColor = estilo.fontColor || "#000000";  // Color de la fuente
      const bold = estilo.bold ? "bold " : "";  // Si es negrita
      const align = estilo.alineacion || "left";  // Alineación del texto
      const margin = 2; // mínimo padding para evitar recortes

      // --- Crear canvas y medir texto con métricas precisas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = `${bold}${fontSize * scale}px ${font}`;
      const metrics = ctx.measureText(texto);

      // Preferir métricas precisas si están disponibles
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || (fontSize * scale * 0.8));
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || (fontSize * scale * 0.2));
      const textWidth = Math.ceil(metrics.width);
      const textHeight = ascent + descent;

      // Añadir padding a ambos lados para que no se recorte
      const paddingX = Math.max(margin, Math.round(fontSize * scale * 0.00));
      const paddingY = Math.max(margin, Math.round(fontSize * scale * 0.00));

      // --- Redimensionar canvas (usar enteros)
      canvas.width = Math.max(1, Math.ceil(textWidth + paddingX * 4));
      canvas.height = Math.max(1, Math.ceil(textHeight + paddingY * 6));

      // Si se proporciona un ancho máximo para la impresora, ajustamos el tamaño
      if (estilo.maxWidthDots && canvas.width > estilo.maxWidthDots) {
        const target = estilo.maxWidthDots;
        const reduction = target / canvas.width;
        const newScale = (fontSize * scale) * reduction / fontSize;
        ctx.font = `${bold}${Math.max(1, Math.floor(fontSize * newScale))}px ${font}`;
        const metrics2 = ctx.measureText(texto);
        const textWidth2 = Math.ceil(metrics2.width);
        const ascent2 = Math.ceil(metrics2.actualBoundingBoxAscent || (fontSize * newScale * 0.8));
        const descent2 = Math.ceil(metrics2.actualBoundingBoxDescent || (fontSize * newScale * 0.2));
        const textHeight2 = ascent2 + descent2;
        const paddingX2 = Math.max(margin, Math.round(fontSize * newScale * 0.15));
        const paddingY2 = Math.max(margin, Math.round(fontSize * newScale * 0.12));
        canvas.width = Math.max(1, Math.ceil(textWidth2 + paddingX2 * 2));
        canvas.height = Math.max(1, Math.ceil(textHeight2 + paddingY2 * 3));
        ctx.font = `${bold}${Math.max(1, Math.floor(fontSize * newScale))}px ${font}`;
      }

      // Aplicar la configuración después de redimensionar
      ctx.font = `${bold}${fontSize * scale}px ${font}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = align;
      ctx.textBaseline = "top";  // Alineación superior para más precisión

      // Fondo blanco
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Texto negro
      ctx.fillStyle = "#000000";
      const x = align === "center" ? canvas.width / 2 : align === "right" ? canvas.width - paddingX : paddingX;
      const y = paddingY; // Dibujar desde el top + padding
      ctx.fillText(texto, x, y);

      // Obtener los datos de la imagen (píxeles)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      const bytesPerRow = Math.ceil(canvas.width / 8);  // Cada byte representa 8 píxeles
      const totalBytes = bytesPerRow * canvas.height;  // Total de bytes para la imagen
      const monoBytes = new Uint8Array(totalBytes);  // Arreglo para los datos binarios

      // Convertir la imagen a monocromo (1-bit)
      const threshold = 128;  // Umbral para blanco o negro
      for (let py = 0; py < canvas.height; py++) {
        for (let px = 0; px < canvas.width; px++) {
          const idx = (py * canvas.width + px) * 4;  // Acceso a los datos RGB del píxel
          const avg = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;  // Promedio de R, G, B
          if (avg < threshold) {  // Si el píxel es más oscuro, se pone negro
            const byteIndex = py * bytesPerRow + (px >> 3);  // Calculamos el índice en bytes
            monoBytes[byteIndex] |= 0x80 >> (px & 7);  // Establecer el bit correspondiente
          }
        }
      }

      // Comprimir los datos de la imagen usando Pako
      const compressed = pako.deflate(monoBytes);
      const base64 = btoa(String.fromCharCode(...compressed));  // Convertir a base64
      const checksum = generarChecksum(monoBytes);  // Calcular el checksum

      // Crear la cadena ZPL para el comando GFA
      const z64 = `GFA,${compressed.length},${monoBytes.length},${bytesPerRow},:Z64:${base64}:F${checksum}`;
      console.log("🧾 Imagen comprimida → Bytes originales:", monoBytes.length, "bytes comprimidos:", compressed.length);
      return z64;  // Devuelve el comando ZPL con la imagen en formato Z64
    }
    
    // ==========================================================
    // ==========================================================
    // 6️⃣ GENERAR LAS IMÁGENES SEGÚN CAMPOS
    // ==========================================================
    //GENERICOS
    const imgVariedad = await textoAImagenZ64(valores.variedadCode, estiloVariedad);
    const imgLDP = await textoAImagenZ64(valores.ldp, estiloGeneral);
    const imgPlanta = await textoAImagenZ64(valores.planta, estiloGeneral);
    const imgAut = await textoAImagenZ64(valores.aut, estiloGeneral);
    const imgLote = await textoAImagenZ64(valores.lote, estiloLote);

    //DRISCOLLS
    const imgJulianoRancho = await textoAImagenZ64(valores.julianoRancho, estiloFecha);
    const imgFecha = await textoAImagenZ64(valores.fecha, estiloFecha);

    //PENG SHENG
    // const imgLote = await textoAImagenZ64(valores.lote, estiloLote);

    //GLOBAL BERRY
    
    const imgProducerCode = await textoAImagenZ64(valores.producerCode, estiloGeneral);

    // ==========================================================
    // 7️⃣ REEMPLAZAR MARCADORES EN PLANTILLA
    // ==========================================================
    let zplFinal = zplOriginal
      //GENERICOS
      .replace(/\$\{varietyCodeImagezpl\}/g, imgVariedad)
      .replace(/\$\{placeproductCodeImagezpl\}/g, imgLDP)
      .replace(/\$\{packinghouseCodeImagezpl\}/g, imgPlanta)
      .replace(/\$\{sanitaryauthorizationCodeImagezpl\}/g, imgAut)
      .replace(/\$\{copias\}/g, formData.copias || 1)

      //DRISCOLLS
      .replace(/\$\{produtionCodeImagezpl\}/g, imgJulianoRancho)
      .replace(/\$\{dateCodeImagezpl\}/g, imgFecha)

      //peng sheng
      .replace(/\$\{lotCodeImagezpl\}/g, imgLote)

      //global berry
      .replace(/\$\{lotCodeImagezplGB\}/g, valores.lote)
      .replace(/\$\{producerCodeGB\}/g, imgProducerCode);

    console.groupEnd();
    console.log("🎉 ZPL Final Generado Correctamente ✅");
    return zplFinal;

  } catch (err) {
    console.error("❌ Error generando ZPL final:", err);
    console.groupEnd();
    return '';
  }
}
