const { Resend } = require("resend");

// Si no hay API key configurada, el cliente queda en null en vez de romper el
// arranque del servidor: el resto de la app (login, checkout, etc.) sigue
// funcionando aunque no se haya configurado el envío de mails todavía.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

module.exports = { resend };
