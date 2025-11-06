// formProcessor.js
import { ruleDriscolls, rulePengSheng,ruleGlobalBerry, ruleGeneric } from './rulesProcessor.js';


  const ACOPIOS = {
    1: { planta: "N° 009-00056-PE", aut: "000407-MINAGRI-SENASA-LA LIBERTAD" },
    2: { planta: "N° 009-00058-PE", aut: "000814-MIDAGRI-SENASA-LA LIBERTAD" },
    3: { planta: "N° 009-00063-PE", aut: "000816-MIDAGRI-SENASA-LA LIBERTAD" },
    4: { planta: "N° 009-00061-PE", aut: "000817-MIDAGRI-SENASA-LA LIBERTAD" },
    5: { planta: "N° 009-00028-PE", aut: "000063-MINAGRI-SENASA-LA LIBERTAD" },
    6: { planta: "N° 009-00054-PE", aut: "000815-MIDAGRI-SENASA-LA LIBERTAD" },
    7: { planta: "N° 009-00062-PE", aut: "000818-MIDAGRI-SENASA-LA LIBERTAD" }
  };

    const selVariedad = document.getElementById("selVariedad");
    const selLdp = document.getElementById("selLdp");
    const selAcopioProd = document.getElementById("selAcopioProd");
    const inpFecha = document.getElementById("inpFecha");
    const selRancho = document.getElementById("selRancho");
    const outJuliano = document.getElementById("outJuliano");
    const copiasElem = document.getElementById("copiasId");
    let formData = {};

  export function setFormDataFromTable(datosTabla) {
    // Asignamos los datos de la tabla a formData
    formData = {
      ...formData,  // Mantener los datos previos
      cliente: datosTabla.cliente || "",  // Datos de cliente desde la tabla
      formato: datosTabla.formato || "",  // Datos de formato desde la tabla
      region: datosTabla.destino || "",  // Datos de región desde la tabla
    };
  }

 export function getFormData() {
    // Retornar todos los campos relevantes del formulario
    const selAcopioPA = document.getElementById("selAcopioPA");
    const acopioSel = selAcopioPA ? selAcopioPA.value : undefined;
    // Definir el acopio basado en el valor de acopioSel
    const acopio = ACOPIOS[acopioSel] || { planta: "---", aut: "---" };
    // === Producto y producción ===
    return {
     
    variedad: selVariedad ? selVariedad.value : "",
    variedadLabel: selVariedad
      ? (selVariedad.options[selVariedad.selectedIndex] || {}).text || ""
      : "",
    ldp: selLdp ? selLdp.value : "",
    acopioPA: selAcopioPA ? selAcopioPA.value : "",
    acopioProd: selAcopioProd ? selAcopioProd.value : "",
    planta: acopio.planta,
    aut: acopio.aut,

    // === Fecha y control ===
    fecha: inpFecha ? inpFecha.value : "",
    juliano: outJuliano ? outJuliano.textContent : "",
    rancho: selRancho ? selRancho.value : "",

    // === Copias de impresión ===
    copias: copiasElem ? parseInt(copiasElem.value, 10) || 1 : 1,
    cliente: formData.cliente || "",  // Aquí tomamos el valor de cliente actualizado desde la tabla
    formato: formData.formato || "",  // Lo mismo con formato
    region: formData.region || "",  // Y región
  };
  }


  export function obtenerDatosDeFila(btn) {
    const tr = btn.closest('tr'); // Encuentra la fila más cercana al botón
    const tds = tr.querySelectorAll('td'); // Obtiene todas las celdas (td) de la fila
    
    // Asumiendo que el orden es:
    // 0 -> Cliente, 1 -> Destino, 2 -> Consignatario, 3 -> Importador, 4 -> Formato, 5 -> Tipo de empaque
    const cliente = tds[0].textContent.trim();
    const destino = tds[1].textContent.trim();
    const consignatario = tds[2].textContent.trim();
    const importador = tds[3].textContent.trim();
    const formato = tds[4].textContent.trim();
    const tipoEmpaque = tds[5].textContent.trim();
    return { cliente, destino, consignatario, importador, formato, tipoEmpaque };
  }
// Módulo principal que decide qué regla aplicar
export function processFormForZPL(formData) {
  const cliente = (formData.cliente || "").toLowerCase();
  const formato = (formData.formato || "").toLowerCase();
  const region = (formData.region || "").toLowerCase();

  //Encadenar condiciones según necesidades
  //DRISCOLL'S driscoll's
  if (cliente.includes("driscoll")) {
    return ruleDriscolls(formData);
  }

  //PENG SHENG
  if (cliente.includes("peng sheng") || cliente.includes("pengsheng")) {
    return rulePengSheng(formData);
  }
  
  //GLOBAL BERRY
  if (cliente.includes("global berry") || cliente.includes("globalberry")) {
    return ruleGlobalBerry(formData);
  }

  // En caso de que no haya coincidencias
  return ruleGeneric(formData);
}




