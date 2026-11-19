# EcoPost Gastro POS

EcoPost es una plataforma web de punto de venta para restaurantes y negocios de gastronomía. Permite gestionar varias empresas en una sola instalación, administrar usuarios y mesas, recibir pedidos y ventas, consultar reportes y controlar una rockola/Jukebox basada en YouTube.

El proyecto usa Next.js 14 (App Router), React 18, PostgreSQL y Prisma 7.

## Funcionalidades principales

- **Autenticación y roles:** inicio de sesión con JWT almacenado en una cookie HttpOnly. Los roles disponibles son `USER`, `ADMIN` y `SUPERADMIN`.
- **Arquitectura multi-negocio:** cada usuario puede estar asociado a un negocio; las mesas, productos, pedidos, ventas y suscripciones pertenecen a ese negocio.
- **Panel de comercio:** mesas, productos, ventas, configuración y planes.
- **Panel administrativo:** negocios, usuarios, facturación, suscripciones, reportes y configuración de la plataforma.
- **Pedidos por mesa:** creación y seguimiento de órdenes con estados como `PENDING`, `PREPARING`, `SERVED`, `PAID` y `CANCELLED`.
- **Rockola/Jukebox:** búsqueda de canciones en YouTube, cola de peticiones y control de reproducción.
- **Suscripciones:** planes `FREE`, `STANDARD`, `PRO` y `ENTERPRISE`, con períodos mensual o anual.
- **Pagos:** registro de comprobantes bancarios y integración opcional con el webhook de Wompi.

## Requisitos

- Node.js 18 o posterior.
- npm.
- PostgreSQL 14 o posterior.

## Instalación

Desde la carpeta del proyecto:

```bash
cd post
npm install
```

Copie el archivo de ejemplo de variables de entorno:

```powershell
Copy-Item .env.example .env
```

Configure las variables de `.env` antes de continuar.

## Configuración de PostgreSQL

Puede definir la conexión mediante `DATABASE_URL`:

```env
DATABASE_URL=postgres://postgres:tu_password@localhost:5432/ecopost
```

También puede usar las variables separadas:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=ecopost
DB_SSL=false
```

Si están presentes, `DATABASE_URL` tendrá prioridad sobre las variables `DB_*`.

Cree primero la base de datos:

```sql
CREATE DATABASE ecopost;
```

Luego aplique las migraciones:

```bash
npx prisma migrate deploy
```

Para un entorno nuevo también puede generar el cliente y cargar los datos iniciales:

```bash
npx prisma generate
npm run seed
```

La siembra crea el negocio demo `demo`, el usuario administrador configurado en `ADMIN_EMAIL`, categorías, productos y 12 mesas. Las credenciales predeterminadas son:

- Usuario: `admin@ecopost.local`
- Contraseña: `admin123`

Cambie estas credenciales en el `.env` antes de ejecutar `npm run seed`.

Como alternativa al flujo Prisma, el repositorio contiene un volcado SQL en `../base de datos/ecopost.sql`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | URL completa de conexión PostgreSQL. Tiene prioridad sobre `DB_*`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Parámetros alternativos de conexión. |
| `DB_SSL` | Activa SSL con el valor `true`. |
| `JWT_SECRET` | Secreto usado para firmar y verificar los tokens JWT. Debe ser único y privado en producción. |
| `YOUTUBE_API_KEY` | API key para buscar canciones en YouTube. |
| `ADMIN_SECRET` | Permite crear una cuenta con rol `ADMIN` desde el registro si se envía el mismo secreto. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credenciales usadas por `npm run seed`. |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Llave pública usada por el flujo de pago de Wompi. |
| `WOMPI_EVENTS_SECRET` | Secreto usado para validar eventos entrantes desde Wompi. |

No suba al repositorio el archivo `.env` ni las claves privadas reales.

## Ejecución local

Inicie el servidor de desarrollo:

```bash
npm run dev
```

Abra <http://localhost:3000>.

Scripts disponibles:

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Genera Prisma y crea el build de producción
npm run start     # Ejecuta el build generado
npm run lint      # Ejecuta ESLint
npm test          # Ejecuta las pruebas con Vitest
npm run seed      # Puebla PostgreSQL con datos demo
```

Para comprobar un build de producción:

```bash
npm run build
npm run start
```

## Arquitectura y funcionamiento

### Inicio de sesión

1. El usuario envía correo y contraseña a `/api/auth/login`.
2. La API compara la contraseña con el hash almacenado mediante `bcryptjs`.
3. Si las credenciales son válidas, crea un JWT con el identificador, el rol y el negocio del usuario.
4. El token se guarda en una cookie `HttpOnly` llamada `token`, válida durante siete días.
5. El middleware protege las rutas `/client` y `/admin` y redirige a `/login` cuando no existe una sesión válida.

Los usuarios con `ADMIN` o `SUPERADMIN` acceden al área `/admin`. Los demás usuarios acceden al área `/client`.

Las API que utilizan datos protegidos consultan el usuario desde la cookie y pueden aplicar validaciones adicionales de rol o pertenencia al negocio.

### Registro

El flujo de `/api/auth/register`:

- Crea el usuario con contraseña cifrada.
- Si recibe un código promocional válido, lo vincula al negocio correspondiente.
- Si no recibe un negocio válido, crea un negocio nuevo con siete días de prueba.
- Crea seis mesas iniciales y las categorías predeterminadas para ese negocio.
- Entrega una sesión JWT al usuario recién creado.

Un valor secreto de `ADMIN_SECRET` permite asignar el rol `ADMIN` durante el registro. Sin ese secreto coincidente, el usuario se crea con rol `USER`.

### Organización de datos

Prisma define las entidades principales en `prisma/schema.prisma`:

- `Business`: comercio, plan, estado y configuración.
- `User`: usuario, contraseña, rol y negocio.
- `TableSession`: mesa, capacidad, estado y comensales.
- `Category` y `Product`: categorías y catálogo.
- `Order` y `OrderItem`: pedidos y sus productos.
- `Sale`: ventas facturadas.
- `SongRequest`: canciones solicitadas a la rockola.
- `SubscriptionInvoice`: facturas de suscripción.

Las relaciones entre usuarios, mesas, productos y ventas están asociadas a un `Business`, por lo que las operaciones deben filtrar siempre por `businessId`.

### Pedidos y ventas

Las rutas principales de API son:

- `/api/tables`: consulta y actualización de mesas.
- `/api/products` y `/api/products/[id]`: catálogo de productos.
- `/api/orders`: pedidos y comandas.
- `/api/sales`: registro de ventas.
- `/api/jukebox/*`: registro, cola y búsqueda de canciones.
- `/api/business/*`: configuración y plan del negocio.
- `/api/admin/*`: administración global de la plataforma.

Los datos de pedidos usan los estados definidos en el modelo Prisma y conservan el nombre y precio del producto en `OrderItem`, evitando que cambios posteriores del catálogo alteren el historial.

### Configuración de plataforma

La configuración visible en el panel administrativo se guarda en `system_config.json`. Este archivo controla datos como nombre de plataforma, soporte, moneda, precios de planes, cuentas de pago e instrucciones de transferencia.

Si el archivo no existe o contiene datos incompletos, `src/lib/systemConfig.ts` combina su contenido con los valores predeterminados.

## Estructura del proyecto

```text
post/
├── prisma/
│   ├── schema.prisma       # Modelos de datos
│   ├── seed.js             # Datos demo iniciales
│   └── migrations/         # Migraciones de PostgreSQL
├── src/
│   ├── app/
│   │   ├── api/            # Rutas REST de Next.js
│   │   ├── admin/          # Panel de administración
│   │   ├── client/         # Panel del comercio
│   │   ├── b/              # Rutas públicas por código de negocio
│   │   └── jukebox/        # Interfaz de rockola
│   ├── components/         # Componentes React
│   ├── context/            # Estado compartido
│   ├── hooks/              # Hooks de API y formularios
│   └── lib/                # Prisma, JWT y configuración
├── public/                 # Recursos estáticos
├── .env.example
├── package.json
└── system_config.json
```

## Problemas comunes

### Error de conexión a PostgreSQL

Compruebe que PostgreSQL esté iniciado y que `DATABASE_URL` o `DB_*` coincidan con la base creada.

### Error después de cambiar el esquema

Ejecute:

```bash
npx prisma generate
npx prisma migrate deploy
```

### El administrador no puede entrar

Ejecute `npm run seed` con las credenciales deseadas en `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### La búsqueda de canciones no funciona

Configure `YOUTUBE_API_KEY` con una clave válida de Google y reinicie el servidor.

### Wompi no valida pagos

Configure `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` y `WOMPI_EVENTS_SECRET`, y asegure que la ruta `/api/webhooks/wompi` sea accesible públicamente desde el proveedor.
