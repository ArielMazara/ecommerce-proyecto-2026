function esMayorDeEdad(fechaNacimiento, edadMinima = 18) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noCumplioAnioTodavia =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

  if (noCumplioAnioTodavia) {
    edad--;
  }

  return edad >= edadMinima;
}

module.exports = { esMayorDeEdad };
