// printerManager.js
import { $ } from './utils.js';

const printerNameEl = $("printerName");
let browserPrinter = null;

function updatePrinterNameUI(name) {
  if (printerNameEl) printerNameEl.textContent = name || "No detectada";
}

export function detectPrinter() {
  return new Promise((resolve, reject) => {
    if (typeof BrowserPrint === "undefined") {
      return reject(new Error("BrowserPrint no está cargado. Incluye BrowserPrint y ejecuta BrowserPrint service."));
    }
    BrowserPrint.getDefaultDevice("printer", device => {
      if (device && device.name) {
        browserPrinter = device;
        updatePrinterNameUI(device.name);
        console.log("Impresora detectada:", device.name);
        resolve(device);
      } else {
        updatePrinterNameUI("No detectada");
        reject(new Error("No se detectó impresora por defecto."));
      }
    }, err => {
      updatePrinterNameUI("No detectada");
      reject(err || new Error("Error detectando impresora."));
    });
  });
}

export function sendToPrinter(zpl) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!browserPrinter) {
        await detectPrinter().catch(err => { throw err; });
      }
      if (!browserPrinter) throw new Error("No hay impresora seleccionada.");
      browserPrinter.send(zpl, () => {
        console.log("ZPL enviado correctamente.");
        resolve();
      }, (err) => {
        console.error("Error enviando ZPL:", err);
        reject(err || new Error("Error enviando a impresora."));
      });
    } catch (err) {
      reject(err);
    }
  });
}

// exportar estado para debug
export function getSelectedPrinter() { return browserPrinter; }
