# Altos del Uco

E-commerce de vinos de bodegas boutique del Valle de Uco, Mendoza. Proyecto integrador universitario.

## Stack

- **Frontend**: Next.js 15 (App Router) + JavaScript + Tailwind CSS v4
- **Componentes UI**: [cult-ui](https://cult-ui.com) (`TextureCard` en las tarjetas de producto) + [shadcn/ui](https://ui.shadcn.com) para el resto (botones, inputs, selects, badges)
- **Backend**: Node.js + Express (JavaScript), API REST
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT + bcrypt
- **Pagos**: SDK oficial de Mercado Pago, Checkout Pro (sandbox)

## Estructura del repo

```
/frontend    → Next.js
/backend     → Express + controllers/routes/middleware
/prisma      → schema.prisma y migraciones (compartido, fuera de /backend)
```

`backend/prisma.config.js` apunta el CLI de Prisma hacia `../prisma/schema.prisma`, así que todos los comandos `npx prisma ...` se corren parados en `/backend`.

## Modelo de datos

4 entidades (`prisma/schema.prisma`): `Usuario`, `Producto`, `Pedido`, `PedidoItem`, más `CarritoItem` (carrito persistente por usuario, separado de `PedidoItem` porque representa un pedido *sin confirmar*). Los modelos están en PascalCase/inglés técnico (convención de Prisma) pero mapeados a tablas en snake_case (`usuarios`, `productos`, etc.) vía `@@map`.

## Setup

### 1. Base de datos

Crear un rol y una base en el Postgres local:

```sql
CREATE ROLE altos_uco WITH LOGIN PASSWORD 'tu_clave' CREATEDB;
CREATE DATABASE altos_del_uco OWNER altos_uco;
```

### 2. Variables de entorno

**`backend/.env`** (no se commitea):

```bash
DATABASE_URL="postgresql://altos_uco:tu_clave@localhost:5432/altos_del_uco?schema=public"
PORT=4000
JWT_SECRET="un_secreto_random"
MP_ACCESS_TOKEN="TEST-..."   # credenciales de prueba de Mercado Pago
MP_PUBLIC_KEY="TEST-..."
FRONTEND_URL="http://localhost:3000"
RESEND_API_KEY="re_..."      # para el email de recuperación de contraseña
COSTO_ENVIO=3000             # envío fijo en ARS
ENVIO_GRATIS_DESDE=50000     # a partir de este subtotal, envío gratis
```

**`frontend/.env.local`**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Instalar y migrar

```bash
cd backend && npm install
npx prisma migrate dev   # crea las tablas
npm run prisma:seed      # carga 8 vinos de ejemplo
```

```bash
cd frontend && npm install
```

### 4. Correr

```bash
cd backend && npm run dev    # http://localhost:4000
cd frontend && npm run dev   # http://localhost:3000
```

## Credenciales de Mercado Pago (sandbox)

1. Entrar a [mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel) con una cuenta de Mercado Pago existente (no hace falta crear una cuenta aparte).
2. "Crear aplicación" → integración "Pagos online" → producto "Checkout Pro".
3. Pestaña **"Credenciales de prueba"** → copiar `Public Key` y `Access Token` (empiezan con `TEST-`) a `backend/.env`.
4. Opcional: "Cuentas de prueba" para tener un usuario comprador de test (no se puede pagar con la propia cuenta vendedora).

La integración usa Checkout Pro: el backend crea una "preferencia" y redirige al comprador a la página de pago hospedada por Mercado Pago — la app nunca toca ni almacena datos de tarjeta. La confirmación de pago (`POST /api/checkout/confirmar` y el webhook) siempre revalida el estado contra la API de Mercado Pago desde el servidor antes de marcar un pedido como pagado; nunca confía en los query params que vuelven por el navegador.

## Recuperación de contraseña (Resend)

1. Crear una cuenta gratis en [resend.com](https://resend.com).
2. "API Keys" → crear una → copiarla a `RESEND_API_KEY` en `backend/.env`.
3. Sin verificar un dominio propio, Resend sólo entrega emails a la dirección con la que te registraste (modo de prueba) — alcanza para probar el flujo en desarrollo. Para que le llegue a cualquier usuario en producción hay que verificar un dominio en Resend y usarlo en `RESEND_FROM_EMAIL`.

El flujo: `POST /api/auth/solicitar-recuperacion` genera un token aleatorio con expiración de 1 hora y manda el link por mail (responde el mismo mensaje exista o no la cuenta, para no filtrar qué emails están registrados); `POST /api/auth/resetear-contrasena` valida el token y actualiza la contraseña.

## Panel de administración

`/admin` permite crear, editar y borrar productos (incluido el stock). Sólo lo pueden ver usuarios con `rol = ADMIN` — no hay forma de auto-promoverse desde la app (por seguridad), así que para convertir tu propia cuenta en admin hay que hacerlo directo contra la base, por ejemplo con Prisma Studio (`npm run prisma:studio` desde `/backend`, editar el usuario, cambiar `rol` a `ADMIN`) o con SQL:

```sql
UPDATE usuarios SET rol = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

También se puede definir `ADMIN_EMAILS` en `backend/.env` (emails separados por coma) — cualquiera que se registre con uno de esos emails queda como `ADMIN` automáticamente, sin tocar la base. Sólo aplica al registrarse, no a cuentas ya existentes.

Después hay que volver a iniciar sesión para que el nuevo JWT incluya el rol actualizado.

`/admin/pedidos` muestra todos los pedidos de todos los usuarios con su dirección de envío. Para los que están `PAGADO`, el admin carga transportista + número de seguimiento y los marca como `ENVIADO`; el cliente ve esa info en el detalle de su pedido. La dirección se pide en el checkout (carrito) antes de generar la preferencia de Mercado Pago.

El costo de envío es una tarifa fija (`COSTO_ENVIO`) con envío gratis a partir de cierto subtotal (`ENVIO_GRATIS_DESDE`), configurables por variable de entorno. Se cobra como un ítem separado ("Envío") en la preferencia de Mercado Pago, y se guarda en `Pedido.costoEnvio` para poder mostrar el desglose subtotal/envío/total en el carrito y en el historial de pedidos.

## Funcionalidades implementadas

1. Setup del proyecto (Next.js, Express, Prisma, Postgres)
2. Modelo de datos y migración inicial
3. Registro y login con verificación de mayoría de edad (18+) y JWT
4. Catálogo con filtros (varietal, bodega, añada, precio)
5. Ficha de producto (bodega, región, varietal, notas de cata, maridaje)
6. Carrito de compras persistente por usuario (agregar/quitar/modificar cantidad)
7. Checkout con Mercado Pago (Checkout Pro, sandbox)
8. Panel de usuario con historial de pedidos
9. Recuperación de contraseña por email (Resend)
10. Panel de administración para crear, editar y borrar productos (stock incluido)
11. Dirección de envío en el checkout y gestión de envíos (transportista + seguimiento) desde el panel admin

## Decisiones y notas técnicas

- **Node 18**: el entorno de desarrollo corre Node 18.19.1, mientras que las últimas versiones de varias herramientas (Next.js 16, Prisma 7, la CLI de shadcn) ya requieren Node 20+. Se pinearon versiones compatibles: **Next.js 15**, **Prisma 6**, **shadcn CLI 3.8.5**.
- **JavaScript en el frontend**: el proyecto arrancó con TypeScript pero se migró íntegramente a JavaScript plano (`.js`/`.jsx`, sin `tsconfig.json` ni paquetes `@types/*`) para mantener consistencia con el backend, que ya está en JavaScript. El alias `@/*` se resuelve vía `jsconfig.json` en vez de `tsconfig.json`.
- **Ruta de salida explícita del cliente de Prisma**: como `schema.prisma` vive en `/prisma` (fuera de `/backend`), sin una ruta de salida explícita el generador resuelve de forma ambigua dónde escribir el cliente — funcionaba distinto según el entorno (en Render terminaba escribiendo en un `node_modules` distinto al que usa el servidor en runtime, dejando el cliente desactualizado en cada deploy aunque `prisma generate` no fallara). Se fijó `output = "../backend/generated/prisma-client"` en el generador y `backend/src/lib/prisma.js` importa desde ahí en vez de `@prisma/client`, eliminando la ambigüedad.
- **cult-ui**: su CLI (`npx shadcn add @cult-ui/...`) queda detrás de un checkpoint anti-bot de Vercel que bloquea clientes no-browser (curl, npx) con 429. El componente `TextureCard` se instaló copiando su código fuente directamente desde el navegador — la vía "Manual Installation" que cult-ui documenta oficialmente como alternativa.
- **Precios en `Decimal`**: se usa el tipo `Decimal` de Prisma (no `Float`) para evitar errores de redondeo con dinero.
- **Compensación en el checkout**: si la creación de la preferencia en Mercado Pago falla, el pedido recién creado se elimina en vez de dejar al usuario con un pedido fantasma y el carrito ya vaciado.
- **Fotos del hero**: como no hay fotografía propia de la bodega, se usan fotos de stock de licencia gratuita (uso comercial permitido, sin atribución obligatoria) de [Pexels](https://www.pexels.com/license/): `frontend/public/hero/valle-de-uco-andes.jpg` (Mariana La Regina, viñedos de Tunuyán con la Cordillera de los Andes de fondo) y `frontend/public/hero/barricas-bodega.jpg` (Lisa Dol). Para un proyecto real habría que reemplazarlas por fotos propias de la bodega.
- **Fotos de producto**: cada uno de los 8 vinos tiene su propia foto de botella con etiqueta propia (nombre, varietal y añada del producto), generadas con IA (Gemini) y recortadas a formato retrato para el catálogo. El varietal/añada de dos productos (Corazón de Piedra, Trece Hileras) se ajustó para que coincida con lo impreso en la etiqueta. El selector de fotos del panel admin (`/admin`) sigue ofreciendo además 5 fotos de stock de Pexels con etiqueta en blanco (Christopher Welsch Leveroni), para productos nuevos que todavía no tengan una etiqueta propia.
