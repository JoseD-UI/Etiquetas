// utils.js
export const $ = id => document.getElementById(id);
export const pad3 = n => String(n).padStart(3, "0");

export function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// Limpia texto para evitar caracteres que rompen el ZPL (^, ~, saltos, etc.)
export function safeTextForZPL(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\^/g, " ")
    .replace(/~/g, " ")
    .replace(/[^\x20-\x7EffñÑáéíóúÁÉÍÓÚüÜº°]/g, "") //permite caracteres acentuados y ñ 
    .trim();
}


// Asegura que un texto tenga prefijo ": " si no lo tiene
export function ensurePrefixedColon(s) {
  if (!s && s !== 0) return "";
  const t = String(s).trim();
  if (t === "") return "";
  return t.startsWith(":") ? t : `: ${t}`;
}

// ==========================================================
// 📅 Utilidades de Fecha – PTI Utils
// ==========================================================

// Convierte "YYYY-MM-DD" a fecha *local* sin convertir a UTC
export function parseLocalDateYYYYMMDD(s) {
  if (!s) return new Date();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date(s);
  const [, Y, M, D] = m;
  // 👇 Aquí forzamos la creación local exacta (sin desfase horario)
  return new Date(Number(Y), Number(M) - 1, Number(D), 12); // 12h evita errores UTC
}

// Calcula la semana ISO correcta
export function getISOWeek(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

// Día ISO (lunes=1 ... domingo=7) pero *local real*
export function getISODayLocal(date) {
  let day = date.getDay();
  if (day === 0) day = 7;
  return day;
}

// fecha en ISO local sin desfase UTC peng sheng
export function getLotDateCodePSheng(fechaStr) {
  const fecha = parseLocalDateYYYYMMDD(fechaStr);
  const year = String(fecha.getFullYear()).slice(-1);
  const week = String(getISOWeek(fecha)).padStart(2, "0");
  const day = String(getISODayLocal(fecha)).padStart(2, "0");
  return `${year}${week}${day}`;
  }

  // fecha en ISO local sin desfase UTC global berry
export function getLotDateCodeGBerry(fechaStr) {
  const fecha = parseLocalDateYYYYMMDD(fechaStr);
  const week = String(getISOWeek(fecha)).padStart(2, "0");
  const day = String(getISODayLocal(fecha)).padStart(2, "0");
  return `${week}${day}`;
  }

        
    
  
