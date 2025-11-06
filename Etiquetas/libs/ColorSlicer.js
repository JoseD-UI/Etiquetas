
const dark = document.getElementById("dark");
const darkValue = document.getElementById("darkValue");

dark.addEventListener("input", () => {
  const value = dark.value;
  darkValue.textContent = value;

  // Calcula el porcentaje de llenado
  const percent = (value / dark.max) * 100;
  dark.style.background = `linear-gradient(to right, #0d6efd ${percent}%, #dee2e6 ${percent}%)`;
});


