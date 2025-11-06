
// data.js

export const TIPODECLIENTE = ["DRISCOLLS", "TERCEROS"];

// === CONFIGURACIÓN GENERAL === //
export const CLIENTES_CONFIG = {
  // === CLIENTE PRINCIPAL: DRISCOLLS === //
  DRISCOLLS: {
    REGIONES: [ "CHINA", "USA"],
    VARIEDADES: [
      { code: 21, name: "ROSITA" },
      { code: 22, name: "RAYMI" },
      { code: 5, name: "TERRAPIN" },
      { code: 14, name: "DUPREE" },
      { code: 19, name: "ARANA" },
      { code: 4, name: "KIRRA" },
    ],
    RANCHOS: ["13197", "13480", "6794"],
    LDPS: ["009-00385-02","009-00385-04","009-00385-05","009-00385-06","009-00385-07"],
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
    { nombre: "4.4-oz", empaque: "Convencional" },
    { nombre: "4.4-oz-Jumbo", empaque: "Jumbo" },
    { nombre: "11-Oz-Sweetest-Batch", empaque: "SB" },
    { nombre: "18-Oz", empaque: "Convencional" },
    { nombre: "18-Oz-Sweetest-Batch", empaque: "SB" },
    { nombre: "Pinta", empaque: "Convencional" }
  ],

  },

  // === TIPO DE CLIENTE: TERCEROS === //
  TERCEROS: {
    // Aquí tienes varios subclientes, cada uno con su propia configuración
    CLIENTES: {
      // === CLIENTE 1 === //
      "SUN BELLE": {
        REGIONES: ["USA", "CHINA", "EUROPA"],
        VARIEDADES: [
          { code: 7, name: "BILOXI" },
          { code: 17, name: "BIANCA" },
          { code: 28, name: "ABRIL BLUE" },
        ],
        RANCHOS: ["6794"],
        FORMATOS: [
          "Caja chica abierta 4.4 oz/125 g",
          "Caja cerrada Pinta",
          "Caja grande 400 g",
        ],
      },

      // === CLIENTE 2 === //
      "PENG SHENG": {
        REGIONES: ["CHINA", "HONG KONG", "SINGAPUR"],
        VARIEDADES: [
          { code: 29, name: "ALEXIA BLUE" },
          { code: 30, name: "EB 9-2" },
          { code: 31, name: "MEGACRESP" },
        ],
        RANCHOS: ["6794"],
        FORMATOS: [
          { nombre: "4.4-oz", empaque: "Convencional" },
          { nombre: "4.4-oz-Jumbo", empaque: "Jumbo" },
        ],
      },

      // === CLIENTE 3 === //
      "OZ BLUE": {
        REGIONES: ["USA", "EUROPA", "OTROS"],
        VARIEDADES: [
          { code: 32, name: "MEGAEARLY" },
          { code: 34, name: "MEGAGIANT" },
          { code: 35, name: "MEGAONE" },
        ],
        RANCHOS: ["6794"],
        FORMATOS: [
          {nombre: "Caja SB 11 oz OZBLU", empaque:"SB"},
          {nombre: "Caja pinta Ozblu 9.8oz", empaque:"9.8oz"},
          {nombre: "Caja pinta punnet", empaque:"Punnet"}
        ],
      },

      //=== CLIENTE 4 ===//
    
    "GLOBAL BERRY": {
        REGIONES: ["EUROPA", "OTROS"],
        VARIEDADES: [
          { code: 7, name: "BILOXI" },
          { code: 17, name: "BIANCA" },
          
        ],
        RANCHOS: ["6794"],
        FORMATOS: [
          { nombre: "125g", empaque: "Convencional" },
          { nombre: "125g-Jumbo", empaque: "Jumbo" },
          { nombre: "250g", empaque: "Convencional" },
          { nombre: "300g", empaque: "Convencional" }
        ],

      },
    },

    // Comunes a todos los terceros
    LDPS: ["009-00385-02","009-00385-04","009-00385-05","009-00385-06","009-00385-07"],
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
