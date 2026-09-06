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

## Funcionalidades implementadas

1. Setup del proyecto (Next.js, Express, Prisma, Postgres)
2. Modelo de datos y migración inicial
3. Registro y login con verificación de mayoría de edad (18+) y JWT
4. Catálogo con filtros (varietal, bodega, añada, precio)
5. Ficha de producto (bodega, región, varietal, notas de cata, maridaje)
6. Carrito de compras persistente por usuario (agregar/quitar/modificar cantidad)
7. Checkout con Mercado Pago (Checkout Pro, sandbox)
8. Panel de usuario con historial de pedidos

## Decisiones y notas técnicas

- **Node 18**: el entorno de desarrollo corre Node 18.19.1, mientras que las últimas versiones de varias herramientas (Next.js 16, Prisma 7, la CLI de shadcn) ya requieren Node 20+. Se pinearon versiones compatibles: **Next.js 15**, **Prisma 6**, **shadcn CLI 3.8.5**.
- **JavaScript en el frontend**: el proyecto arrancó con TypeScript pero se migró íntegramente a JavaScript plano (`.js`/`.jsx`, sin `tsconfig.json` ni paquetes `@types/*`) para mantener consistencia con el backend, que ya está en JavaScript. El alias `@/*` se resuelve vía `jsconfig.json` en vez de `tsconfig.json`.
- **cult-ui**: su CLI (`npx shadcn add @cult-ui/...`) queda detrás de un checkpoint anti-bot de Vercel que bloquea clientes no-browser (curl, npx) con 429. El componente `TextureCard` se instaló copiando su código fuente directamente desde el navegador — la vía "Manual Installation" que cult-ui documenta oficialmente como alternativa.
- **Precios en `Decimal`**: se usa el tipo `Decimal` de Prisma (no `Float`) para evitar errores de redondeo con dinero.
- **Compensación en el checkout**: si la creación de la preferencia en Mercado Pago falla, el pedido recién creado se elimina en vez de dejar al usuario con un pedido fantasma y el carrito ya vaciado.
- **Fotos del hero**: como no hay fotografía propia de la bodega, se usan fotos de stock de licencia gratuita (uso comercial permitido, sin atribución obligatoria) de [Pexels](https://www.pexels.com/license/): `frontend/public/hero/valle-de-uco-andes.jpg` (Mariana La Regina, viñedos de Tunuyán con la Cordillera de los Andes de fondo) y `frontend/public/hero/barricas-bodega.jpg` (Lisa Dol). Para un proyecto real habría que reemplazarlas por fotos propias de la bodega.
- **Fotos de producto**: como los 8 vinos del seed son ficticios, no existe "la" foto real de cada botella. Se usan 3 fotos de stock de Pexels con etiqueta en blanco (sin marca real visible) — una botella tinta para los 6 vinos tintos y dos botellas claras para los blancos (Chardonnay y Torrontés) — en vez de una única ilustración repetida para los 8. Fotos de Christopher Welsch Leveroni. Para un proyecto real, cada producto debería tener su propia foto.
