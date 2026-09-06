-- AlterTable
ALTER TABLE "pedidos"
ADD COLUMN "direccion_calle" TEXT NOT NULL DEFAULT '',
ADD COLUMN "direccion_ciudad" TEXT NOT NULL DEFAULT '',
ADD COLUMN "direccion_provincia" TEXT NOT NULL DEFAULT '',
ADD COLUMN "direccion_codigo_postal" TEXT NOT NULL DEFAULT '',
ADD COLUMN "transportista" TEXT,
ADD COLUMN "numero_seguimiento" TEXT;

-- Los pedidos existentes (de pruebas) quedan con dirección vacía; a partir de
-- ahora el checkout siempre la completa, así que no hace falta un default.
ALTER TABLE "pedidos"
ALTER COLUMN "direccion_calle" DROP DEFAULT,
ALTER COLUMN "direccion_ciudad" DROP DEFAULT,
ALTER COLUMN "direccion_provincia" DROP DEFAULT,
ALTER COLUMN "direccion_codigo_postal" DROP DEFAULT;
