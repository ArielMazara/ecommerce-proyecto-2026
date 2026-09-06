const COSTO_ENVIO = Number(process.env.COSTO_ENVIO || 3000);
const ENVIO_GRATIS_DESDE = Number(process.env.ENVIO_GRATIS_DESDE || 50000);

function calcularCostoEnvio(subtotal) {
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
}

module.exports = { calcularCostoEnvio, COSTO_ENVIO, ENVIO_GRATIS_DESDE };
