document.addEventListener("DOMContentLoaded", () => {
  const sel         = document.getElementById("selPrinter");
  const btnDetect   = document.getElementById("btnDetect");
  const btnAddIP    = document.getElementById("btnAddIP");
  const ipInput     = document.getElementById("ipInput");
  const printerName = document.getElementById("printerName");
  const indicator   = document.getElementById("printerIndicator");
  const toastBox    = document.getElementById("toastContainer");

  let devices = [];
  let device  = null;

  /** ========== Notificaciones Bootstrap ========== **/
  const showToast = (message, type = "info", duration = 2000) => {
    const colors = {
      success: "bg-success text-white",
      error: "bg-danger text-white",
      warning: "bg-warning text-dark",
      info: "bg-primary text-white"
    };

    const toast = document.createElement("div");
    toast.className = `toast align-items-center border-0 ${colors[type] || "bg-secondary text-white"}`;
    toast.role = "alert";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
      </div>
    `;
    toastBox.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();

    // Se elimina automáticamente del DOM al ocultarse
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  };

  /** ========== Utilitarios ========== **/
  const requireSDK = () => {
    if (!window.BrowserPrint) {
      showToast("⚠️ El SDK de BrowserPrint no está disponible. Inicia el servicio Zebra Browser Print.", "error");
      updateIndicator("gray");
      return false;
    }
    return true;
  };

  const updateIndicator = state => {
    const colors = {
      green: "limegreen",
      yellow: "#c9a400",
      red: "crimson",
      gray: "gray"
    };
    indicator.style.backgroundColor = colors[state] || "gray";
  };

  /** ========== Render de impresoras ========== **/
  const renderPrinters = printers => {
    sel.innerHTML = "";
    devices = printers.slice();

    if (devices.length > 0) {
      devices.forEach((d, i) => {
        const opt = document.createElement("option");
        const tag = (d.connection || d.deviceType || "").toUpperCase();
        opt.value = i;
        opt.textContent = `${d.name || d.uid || "Zebra #" + (i + 1)} [${tag}]`;
        sel.appendChild(opt);
      });
      sel.value = "0";
      device = devices[0];
      printerName.textContent = device.name || "Desconocida";
      checkPrinterStatus();
      showToast("✅ Primera impresora seleccionada automáticamente.", "success");
    } else {
      const opt = document.createElement("option");
      opt.textContent = "No hay impresoras Zebra detectadas";
      sel.appendChild(opt);
      device = null;
      printerName.textContent = "No detectada";
      updateIndicator("gray");
      showToast("⚠️ Ninguna impresora encontrada.", "warning");
    }
  };

  /** ========== Verificación de estado ========== **/
  const checkPrinterStatus = () => {
    if (!requireSDK() || !device) {
      updateIndicator("gray");
      return;
    }

    try {
      device.sendThenRead("~HQES", resp => {
        if (resp && resp.includes("OK")) {
          updateIndicator("green");
          showToast("🟢 Impresora en línea.", "success");
        } else {
          updateIndicator("yellow");
          showToast("🟡 Advertencia: posible problema de conexión.", "warning");
        }
      }, err => {
        updateIndicator("red");
        showToast("🔴 Error al leer estado: " + err, "error");
      });
    } catch (e) {
      updateIndicator("red");
      showToast("Error general: " + e, "error");
    }
  };

  /** ========== Botón Detectar ========== **/
  btnDetect.addEventListener("click", () => {
    if (!requireSDK()) return;
    showToast("🔍 Buscando impresoras locales...", "info");

    BrowserPrint.getLocalDevices(devs => {
      const printers = (devs || []).filter(d =>
        ["printer"].includes((d.device_type || d.deviceType || "").toLowerCase()) ||
        ["usb", "network", "driver"].includes((d.connection || "").toLowerCase())
      );
      showToast(`Encontradas: ${printers.length}`, "info");
      renderPrinters(printers);
    }, err => showToast("Error al detectar: " + err, "error"), "printer");
  });

  /** ========== Cambio de impresora seleccionada ========== **/
  sel.addEventListener("change", e => {
    const idx = parseInt(e.target.value, 10);
    device = devices[idx] || null;
    printerName.textContent = device?.name || "No detectada";
    showToast("🔄 Impresora seleccionada: " + (device?.name || "—"), "info");
    checkPrinterStatus();
  });

  /** ========== Agregar impresora manual por IP ========== **/
  btnAddIP.addEventListener("click", () => {
    if (!requireSDK()) return;
    const raw = (ipInput.value || "").trim();
    if (!raw) return showToast("Ingresa una IP:puerto válida.", "warning");

    const uid = raw.includes(":") ? raw : (raw + ":9100");
    try {
      const netDev = new BrowserPrint.Device({
        name: `Zebra @ ${uid}`,
        deviceType: "printer",
        connection: "network",
        uid: uid,
        provider: "manual",
        manufacturer: "Zebra"
      });
      devices.push(netDev);
      const opt = document.createElement("option");
      opt.value = (devices.length - 1).toString();
      opt.textContent = `${netDev.name} [NETWORK]`;
      sel.appendChild(opt);
      sel.value = opt.value;
      device = netDev;
      printerName.textContent = device.name;
      checkPrinterStatus();
      showToast(`🖧 Impresora añadida manualmente: ${uid}`, "success");
    } catch (e) {
      showToast("Error al agregar impresora IP: " + e, "error");
    }
  });

  /** ========== Inicialización ========== **/
  updateIndicator("gray");
  //showToast("🟢 Módulo de detección Zebra iniciado correctamente.", "success", 2000);
});
