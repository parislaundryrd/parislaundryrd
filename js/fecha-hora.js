function updateDateTime() {
  const now = new Date();

  // Formatear hora en formato de 12 horas
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // La hora 0 debería ser 12
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

  // Formatear fecha
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Los meses comienzan desde 0
  const year = now.getFullYear();
  const dateString = `${day}/${month}/${year}`;

  // Actualizar DOM
  document.getElementById("time").textContent = timeString;
  document.getElementById("date").textContent = dateString;
}

// Actualizar cada segundo
setInterval(updateDateTime, 1000);
updateDateTime(); // Llamada inicial