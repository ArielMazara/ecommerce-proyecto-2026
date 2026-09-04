export const ESTADOS_PEDIDO = {
  PENDIENTE: { etiqueta: "Pendiente de pago", clase: "border-gold/40 text-gold" },
  PAGADO: { etiqueta: "Pagado", clase: "border-emerald-500/40 text-emerald-400" },
  ENVIADO: { etiqueta: "Enviado", clase: "border-sky-500/40 text-sky-400" },
  CANCELADO: { etiqueta: "Cancelado", clase: "border-destructive/40 text-destructive" },
} as const;
