# QR Generador - AvonQrTS

Este proyecto es una aplicación web construida con Next.js que permite la gestión de conceptos y usuarios, probablemente enfocada en la generación o gestión de códigos QR.

## 📂 Estructura del Proyecto

La estructura principal del proyecto es la siguiente:

- **`src/app`**: Contiene la lógica principal de la aplicación y el enrutamiento (App Router).
- **`src/app/api`**: Define los endpoints de la API (Backend).
- **`src/lib`**: Utilidades y configuraciones compartidas (ej. cliente de Prisma, autenticación).
- **`prisma`**: Esquema de la base de datos y migraciones.
- **`public`**: Archivos estáticos.

## 📦 Listado de Dependencias Principales

Las dependencias clave utilizadas en este proyecto son:

- **Framework**: `next`, `react`, `react-dom`
- **Base de Datos**: `prisma`, `@prisma/client`
- **Autenticación**: `jsonwebtoken`, `bcryptjs`
- **UI/Estilos**: `bootstrap`, `bootstrap-icons`
- **Utilidades**: `qrcode` (Generación de QRs), `react-markdown`

## 🛠 Instalación de Dependencias

Para instalar todas las dependencias necesarias, ejecuta el siguiente comando en la terminal:

```bash
npm install
```

> **Nota:** Este proyecto utiliza un script `postinstall` que ejecuta `prisma generate` automáticamente.

## 🚀 Correr la Aplicación

Para iniciar el servidor de desarrollo, utiliza:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 🔌 Rutas del Backend

A continuación se listan los endpoints disponibles en la API:

### Users (`/api/users`)
- `POST /api/users/login`: Iniciar sesión.
- `GET /api/users/get-auth`: Verificar estado de autenticación (Token válido).

### Concepts (`/api/concepts`)
- `GET /api/concepts/get-concepts`: Obtener lista de conceptos.
- `GET /api/concepts/get-concept-by-slug`: Obtener un concepto específico por slug.
- `POST /api/concepts/create-concept`: Crear un nuevo concepto.
- `PUT /api/concepts/update-concept`: Actualizar un concepto existente.
- `DELETE /api/concepts/delete-concept`: Eliminar un concepto.

### System
- `GET /api/health`: Comprobación de estado del sistema.
