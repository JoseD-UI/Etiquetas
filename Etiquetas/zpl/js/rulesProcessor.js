// rulesProcessor.js
import {  getLotDateCodePSheng,getLotDateCodeGBerry, safeTextForZPL, ensurePrefixedColon } from './utils.js';

// === 🫐 REGLA: DRISCOLL'S ===
export function ruleDriscolls(formData) {
  const variedadSafe = safeTextForZPL(formData.variedad || "");
  const ldpWithColon = ensurePrefixedColon(formData.ldp || "");
  const plantaWithColon = ensurePrefixedColon(formData.planta || "");
  const autWithColon = ensurePrefixedColon(formData.aut || "");
  const acopioProdSafe = safeTextForZPL(formData.acopioProd || "");
  const julianoSafe = safeTextForZPL(formData.juliano || "");
  const ranchoSafe = safeTextForZPL(formData.rancho || "");
  const acopioSuffix = acopioProdSafe ? `A${acopioProdSafe}` : "";
  const julianoRancho = safeTextForZPL([julianoSafe, ranchoSafe, acopioSuffix].filter(Boolean).join(" "));

  return {
    cliente: "Driscolls",
    variedadCode: variedadSafe,
    ldp: ldpWithColon,
    planta: plantaWithColon,
    aut: autWithColon,
    julianoRancho: `: ${julianoRancho}`,
  };
}

// === 🍇 REGLA: PENG SHENG  4.4 oz y 4.4 oz jumbo 2025===
// Código de lote: 1 dígito año + 2 dígitos semana ISO + 2 dígitos día de semana (01-07)
// Ejemplo: 54201 = 2025, semana 42, lunes
// Fuente: https://www.pengsheng.com.pe/wp-content/uploads/2019/09/Manual-de-Calidad-Peng-Sheng.pdf (pág. 18)
export function rulePengSheng(formData) {
  const rancho = safeTextForZPL(formData.rancho || "");
  const acopio = safeTextForZPL(formData.acopioProd || "");
  const fechaCode = getLotDateCodePSheng(formData.fecha);
  const loteCode = `Lot 00${rancho}-${fechaCode}A${acopio}`;

  return {
    cliente: "Peng Sheng",
    ldp: safeTextForZPL(formData.ldp || ""), // sin prefijos
    planta: safeTextForZPL(formData.planta || ""),
    aut: safeTextForZPL(formData.aut || ""),
    variedadCode: safeTextForZPL(formData.variedad || ""),
    lote: loteCode,
  };
}

// === 🍇 REGLA: GLOBAL BERRY 125G, 125G JUMBO, 250G y 300G===

export function ruleGlobalBerry(formData) {

  const rancho = safeTextForZPL(formData.rancho || "");
  const acopio = safeTextForZPL(formData.acopioProd || "");
  const fechaCode = getLotDateCodeGBerry(formData.fecha);

  const producerCode = `00${rancho}-${fechaCode}A${acopio}`;
  const loteCode = `LOT: ${fechaCode}`;

  return {
    cliente: safeTextForZPL(formData.cliente || ""),
    variedadCode: safeTextForZPL(formData.variedad || ""),
    ldp: safeTextForZPL(formData.ldp || ""),
    planta: safeTextForZPL(formData.planta || ""),
    aut: safeTextForZPL(formData.aut || ""),
    lote: loteCode,
    producerCode: `${producerCode}`
  };
}

// === 🌎 PLANTILLA PARA NUEVOS CLIENTES ===

export function ruleGeneric(formData) {
  return {
    cliente: safeTextForZPL(formData.cliente || ""),
    variedadCode: safeTextForZPL(formData.variedad || ""),
    ldp: ensurePrefixedColon(formData.ldp || ""),
    planta: ensurePrefixedColon(formData.planta || ""),
    aut: ensurePrefixedColon(formData.aut || ""),
  };
}
