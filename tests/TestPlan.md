# Documento de Plan de Pruebas (CORREGIDO)

## Proyecto del equipo de desarrollo para el escaneo de códigos QR

Erick Daniel Martinez Martinez   
Ethan Yahel Sarricolea Cortes   
Elias Martinez Dominguez

## Propósito

El sistema a desarrollar tiene como propósito para el cliente la capacidad de crear un código QR que le permita conocer a sus compradores e interesados la información referente a los productos ofertados por el cliente, esto le permitirá realizar el proceso de venta y promoción de manera eficiente y cómoda.

## Requerimientos 

A continuación se presentan los siguientes artefactos los cuales exploran a detalle las funcionalidades que debe cumplir el sistema a desarrollar mediante los diferentes tipos de artefactos.

### Requerimientos funcionales 

| No. | Requisito | Tipo de requisito |
| :---- | :---- | :---- |
| 1. | El sistema debe permitir al usuario cliente acceder a la información de un producto al escanear un código QR. | Sistema |
| 2. | El sistema debe permitir al usuario administrador registrar un producto introduciendo la información (datos, id de producto, imagen, precio) y subiendo una imagen. | Sistema |
| 3. | El sistema debe permitir al usuario administrador guardar el código QR de un producto en cualquiera de los formatos listados (PNG, JPG o PDF) | Sistema |
| 4. | El sistema debe permitir al usuario administrador editar la información (datos, id de producto, imagen, precio) de un producto registrado. | Sistema |
| 5. | El sistema debe permitir al usuario administrador eliminar productos registrados. | Sistema |

### Criterios de calidad 

* **Usabilidad**: Fácil uso para el usuario administrador y buena experiencia de usuario para ambos tipos de usuario.  
* **Extensibilidad**: Debido a la posibilidad de mejoras del sistema, correcciones o adición de funcionalidades extra.  
* **Accesibilidad**: Página web de uso posible en dispositivos móviles y de escritorio.  
* **Seguridad**: La contraseña debe registrarse hasheada (bcrypt), prevención de inyecciones SQL/XSS, validación de tokens JWT.

## Arquitectura 

En base a los criterios de calidad establecidos se optó por el uso del Modelo Vista Controlador, el cual se define como una arquitectura tradicional apta para cualquier tipo de proyecto. A su vez, el sistema tendrá los siguientes endpoints del backend:

1. **Login (POST)** - Autenticación de usuarios
2. **Get All Concepts (GET)** - Obtener conceptos del usuario autenticado
3. **Post Create Concept (POST)** - Crear nuevo concepto
4. **Get Concept for Slug (GET)** - Obtener concepto público por slug (para QR)
5. **Update Concept (PATCH)** - Actualizar concepto existente
6. **Delete Concept (DELETE)** - Eliminación lógica de concepto
7. **Get Auth to Upload Image (GET)** - Obtener URL firmada para subida de imágenes

## Alcance

Las pruebas realizadas a este sistema se centran en probar aspectos visuales en el uso del markdown y en la sanitización del texto, así como pruebas para evitar posibles inyecciones HTML y SQL.

### Tipos de Pruebas

1. **Pruebas Unitarias**: Validación de endpoints individuales del backend
2. **Pruebas de Integración**: Flujos completos usuario-sistema-base de datos
3. **Pruebas de Seguridad**: Inyección SQL, XSS, validación de tokens
4. **Pruebas de Frontend**: Responsividad, renderizado de Markdown, UX

### Limitaciones

Para la realización de este plan de pruebas no se realizarán pruebas de carga/estrés masivo, pruebas de penetración avanzadas, ni pruebas de compatibilidad con una gran variedad de dispositivos físicos.

## Estrategia

Para el desenlace de estas pruebas se realizarán:

- **Pruebas unitarias** sobre los diferentes endpoints del backend usando Jest/Vitest
- **Pruebas de integración** validando flujos completos con base de datos de prueba
- **Pruebas de seguridad** específicas para inyección SQL, XSS y validación de tokens
- **Pruebas manuales** del frontend para validar responsividad y renderizado de Markdown

---

# Tablas de Casos de Prueba 

## BACKEND - Pruebas Unitarias

### 1. Endpoint: Iniciar Sesión (Login)

**Archivo:** `src/app/api/users/login/route.ts`  
**Método:** POST  
**Lógica clave:** Valida credenciales contra la tabla Account, verifica hash de contraseña con bcrypt y devuelve un token JWT firmado con tiempo de expiración.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| LOG-01 | Inicio de sesión exitoso | Usuario registrado en BD con contraseña hasheada | `{ "user": "admin", "password": "password123" }` | 1. Enviar petición POST<br>2. Backend verifica hash con bcrypt<br>3. Generar token JWT | **Status 200 OK**<br>JSON: `{ "account_id": 1, "access_token": "eyJhbG...", "account_type": "admin", "exp": 1735689600 }`<br>Token debe ser válido por 24h | Alta |
| LOG-02 | Credenciales faltantes | N/A | `{ "user": "admin" }` (Falta password) | 1. Enviar petición POST incompleta<br>2. Backend valida campos requeridos | **Status 400 Bad Request**<br>JSON: `{ "message": "Missing credentials", "missing_fields": ["password"] }` | Media |
| LOG-03 | Usuario no encontrado | BD operativa sin el usuario solicitado | `{ "user": "inexistente", "password": "123" }` | 1. Enviar credenciales de usuario no registrado<br>2. Prisma no encuentra registro | **Status 401 Unauthorized**<br>JSON: `{ "message": "Invalid credentials" }`<br>*(No revelar si usuario existe o no)* | Alta |
| LOG-04 | Contraseña incorrecta | Usuario "admin" existe en BD | `{ "user": "admin", "password": "incorrecta" }` | 1. Enviar usuario válido con contraseña errónea<br>2. bcrypt.compare() retorna false | **Status 401 Unauthorized**<br>JSON: `{ "message": "Invalid credentials" }` | Alta |
| LOG-05 | Error interno de BD | Simular fallo en conexión Prisma | `{ "user": "admin", "password": "123" }` | 1. Forzar error de conexión DB<br>2. Enviar POST | **Status 500 Internal Server Error**<br>JSON: `{ "message": "Internal error", "error": "Database connection failed" }` | Baja |
| LOG-06 | Token JWT generado correctamente | Usuario válido | `{ "user": "admin", "password": "password123" }` | 1. Login exitoso<br>2. Decodificar token recibido | Token debe contener: payload con `account_id`, `account_type`, `exp` (24h desde emisión), firma válida | Alta |

---

### 2. Endpoint: Obtener Conceptos (Panel Admin)

**Archivo:** `src/app/api/concepts/get-concepts/route.ts`  
**Método:** GET  
**Lógica clave:** Obtiene los conceptos solo del usuario logueado (`where: { account_id: accountId, is_active: true }`). Requiere token JWT válido en header Authorization.

| ID | Título | Precondiciones | Entradas (Headers) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| CON-01 | Obtener lista de conceptos | Token válido de Admin<br>3 conceptos creados en BD (2 activos, 1 inactivo) | `Authorization: Bearer <token_valido>` | 1. Middleware verifica token<br>2. Enviar GET a `/api/concepts/get-concepts`<br>3. Prisma filtra por account_id y is_active | **Status 200 OK**<br>JSON: Array con 2 objetos `[{ "concept_id": 1, "date": "2024-01-15", "slug": "promo-verano", "content": "...", "image_url": "...", "color": "#FF0000" }, ...]`<br>Ordenados por fecha DESC | Alta |
| CON-02 | Sin conceptos registrados | Token válido<br>Usuario sin conceptos en BD | `Authorization: Bearer <token_valido>` | 1. Enviar GET<br>2. Prisma.findMany retorna array vacío | **Status 200 OK**<br>JSON: `[]`<br>*(Comportamiento correcto de Prisma)* | Media |
| CON-03 | Token inválido o expirado | N/A | `Authorization: Bearer <token_falso_o_expirado>` | 1. Enviar GET con token inválido<br>2. Middleware de autenticación rechaza | **Status 401 Unauthorized**<br>JSON: `{ "message": "Unauthorized", "error": "Invalid or expired token" }` | Alta |
| CON-04 | Sin header de autorización | N/A | *(Sin header Authorization)* | 1. Enviar GET sin token<br>2. Middleware detecta ausencia | **Status 401 Unauthorized**<br>JSON: `{ "message": "Authorization header missing" }` | Alta |
| CON-05 | Filtrado correcto por is_active | Token válido<br>Usuario con 1 concepto activo y 1 inactivo | `Authorization: Bearer <token_valido>` | 1. Enviar GET<br>2. Verificar que solo retorna conceptos con is_active: true | **Status 200 OK**<br>JSON debe contener solo el concepto activo, el inactivo no aparece | Media |

---

### 3. Endpoint: Obtener Concepto por Slug (Público/QR)

**Archivo:** `src/app/api/concepts/get-concept-by-slug/route.ts`  
**Método:** GET  
**Lógica clave:** Busca un concepto por su URL (slug). Usado cuando el cliente escanea el QR. **No requiere autenticación** (endpoint público).

| ID | Título | Precondiciones | Entradas (Query Params) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| SLG-01 | Escaneo exitoso | Concepto con slug "promo-2025" existe y es activo | `URL: /api/concepts/get-concept-by-slug?slug=promo-2025` | 1. Enviar GET con parámetro slug válido<br>2. Prisma busca con where: { slug, is_active: true } | **Status 200 OK**<br>JSON: `{ "concept_id": 5, "content": "**Oferta especial**", "color": "#00FF00", "image_url": "https://...", "date": "2024-12-01" }` | Alta |
| SLG-02 | Falta parámetro slug | N/A | `URL: /api/concepts/get-concept-by-slug` (Sin params) | 1. Enviar GET sin query string<br>2. Backend valida presencia de parámetro | **Status 400 Bad Request**<br>JSON: `{ "message": "Slug parameter is required" }` | Media |
| SLG-03 | Slug no encontrado | BD operativa | `URL: /api/concepts/get-concept-by-slug?slug=no-existe` | 1. Enviar GET con slug inexistente<br>2. Prisma no encuentra registro | **Status 404 Not Found**<br>JSON: `{ "message": "Concept not found" }`<br>*(Cambiar de array vacío a 404 para mejor semántica REST)* | Alta |
| SLG-04 | Concepto inactivo | Concepto existe pero is_active: false | `URL: /api/concepts/get-concept-by-slug?slug=slug-inactivo` | 1. Enviar GET<br>2. Prisma filtra por is_active: true | **Status 404 Not Found**<br>JSON: `{ "message": "Concept not found" }`<br>*(No revelar que existe pero está inactivo)* | Media |
| SLG-05 | Slug con caracteres especiales | N/A | `URL: /api/concepts/get-concept-by-slug?slug=promo%202025` (con espacio) | 1. Enviar GET con slug URL-encoded<br>2. Backend decodifica correctamente | **Status 200 OK** (si existe) o **404** (si no existe)<br>No debe producir error de sintaxis | Media |

---

### 4. Endpoint: Crear Concepto

**Archivo:** `src/app/api/concepts/create/route.ts`  
**Método:** POST  
**Lógica clave:** Valida campos obligatorios, verifica que el slug sea único (constraint UNIQUE en BD), sanitiza contenido Markdown y crea el registro asociado al usuario logueado.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| CRE-01 | Creación exitosa de concepto | Token válido<br>Slug "verano-2025" no existe en BD | `{ "content": "**Oferta de verano**", "slug": "verano-2025", "image_url": "https://img.example.com/promo.jpg", "color": "#FF0000" }` | 1. Middleware valida token<br>2. Validar campos requeridos<br>3. Verificar slug único<br>4. Sanitizar content<br>5. Prisma.create() | **Status 201 Created**<br>JSON: `{ "concept_id": 10, "slug": "verano-2025", "is_active": true, "date": "2024-12-31T10:30:00Z", ... }` | Alta |
| CRE-02 | Validación de campos faltantes | Token válido | `{ "slug": "test", "color": "#000000" }` (Faltan content e image_url) | 1. Backend valida campos requeridos<br>2. Rechaza petición antes de tocar BD | **Status 400 Bad Request**<br>JSON: `{ "message": "Missing required fields", "missing": ["content", "image_url"] }` | Alta |
| CRE-03 | Slug duplicado (Conflicto) | Ya existe un concepto con slug "promo-1" | `{ "slug": "promo-1", "content": "Nuevo contenido", "image_url": "https://...", "color": "#000000" }` | 1. Intentar crear concepto con slug repetido<br>2. Prisma detecta constraint UNIQUE violation | **Status 409 Conflict**<br>JSON: `{ "message": "Slug already exists", "slug": "promo-1" }` | Alta |
| CRE-04 | Creación sin token | N/A | Body válido pero sin header Authorization | 1. Enviar POST sin token<br>2. Middleware rechaza | **Status 401 Unauthorized**<br>JSON: `{ "message": "Unauthorized" }` | Alta |
| CRE-05 | Formato de color inválido | Token válido | `{ "content": "...", "slug": "test", "image_url": "...", "color": "rojo" }` | 1. Backend valida formato hexadecimal (regex: `^#[0-9A-Fa-f]{6}$`) | **Status 400 Bad Request**<br>JSON: `{ "message": "Invalid color format. Use hexadecimal (e.g., #FF0000)" }` | Media |
| CRE-06 | URL de imagen inválida | Token válido | `{ "content": "...", "slug": "test", "image_url": "not-a-url", "color": "#000000" }` | 1. Backend valida formato de URL (regex o librería `validator.js`) | **Status 400 Bad Request**<br>JSON: `{ "message": "Invalid image URL format" }` | Media |
| CRE-07 | Slug con formato inválido | Token válido | `{ "content": "...", "slug": "Slug con ESPACIOS!", "image_url": "...", "color": "#000000" }` | 1. Backend valida formato slug (solo lowercase, números, guiones: `^[a-z0-9-]+$`) | **Status 400 Bad Request**<br>JSON: `{ "message": "Invalid slug format. Use only lowercase letters, numbers and hyphens" }` | Alta |

---

### 5. Endpoint: Actualizar Concepto

**Archivo:** `src/app/api/concepts/update/route.ts`  
**Método:** PATCH  
**Lógica clave:** Verifica que el concept_id exista y pertenezca al usuario que hace la petición antes de editar. Permite actualización parcial de campos.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| UPD-01 | Actualización exitosa | Token válido<br>Concepto ID 10 pertenece al usuario | `{ "concept_id": 10, "content": "Nuevo texto actualizado", "color": "#00FF00" }` | 1. Verificar token<br>2. Verificar ownership (account_id)<br>3. Prisma.update() solo con campos enviados | **Status 200 OK**<br>JSON muestra datos actualizados: `{ "concept_id": 10, "content": "Nuevo texto actualizado", "color": "#00FF00", "updated_at": "..." }` | Alta |
| UPD-02 | Intento de edición ajena (Seguridad) | Token válido Usuario A<br>Concepto ID 50 pertenece a Usuario B | `{ "concept_id": 50, "content": "Hackeado" }` | 1. Usuario A intenta editar concepto de B<br>2. Backend verifica account_id no coincide | **Status 403 Forbidden**<br>JSON: `{ "message": "Access denied. You don't own this concept" }` | Crítica |
| UPD-03 | Falta ID de concepto | Token válido | `{ "content": "Texto suelto" }` (Sin concept_id) | 1. Enviar PATCH sin identificador<br>2. Backend valida campo requerido | **Status 400 Bad Request**<br>JSON: `{ "message": "Concept ID is required" }` | Media |
| UPD-04 | Concepto inexistente | Token válido | `{ "concept_id": 99999, "content": "..." }` | 1. Enviar PATCH a ID que no existe en BD<br>2. Prisma no encuentra registro | **Status 404 Not Found**<br>JSON: `{ "message": "Concept not found" }` | Media |
| UPD-05 | Actualización parcial (solo un campo) | Token válido<br>Concepto ID 10 del usuario | `{ "concept_id": 10, "color": "#0000FF" }` (Solo color, sin content) | 1. PATCH debe actualizar solo el campo enviado<br>2. Los demás campos permanecen sin cambios | **Status 200 OK**<br>JSON: concepto con color actualizado, content y otros campos sin modificar | Alta |
| UPD-06 | Intentar cambiar slug a uno duplicado | Token válido<br>Slug "promo-1" ya existe | `{ "concept_id": 10, "slug": "promo-1" }` | 1. Intentar actualizar slug<br>2. Verificar constraint UNIQUE | **Status 409 Conflict**<br>JSON: `{ "message": "Slug already exists" }` | Media |
| UPD-07 | Validación de formato en actualización | Token válido | `{ "concept_id": 10, "color": "azul" }` (formato inválido) | 1. Validar formato de campos enviados | **Status 400 Bad Request**<br>JSON: `{ "message": "Invalid color format" }` | Media |

---

### 6. Endpoint: Eliminar Concepto

**Archivo:** `src/app/api/concepts/delete/route.ts`  
**Método:** DELETE  
**Lógica clave:** Realiza un **Borrado Lógico** (`is_active: false`) en lugar de eliminar el registro físico. Solo el dueño puede borrarlo.

| ID | Título | Precondiciones | Entradas (Query Params) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| DEL-01 | Eliminación exitosa (Soft Delete) | Token válido<br>Concepto ID 20 es del usuario y está activo | `URL: /api/concepts/delete?id=20` | 1. Verificar token y ownership<br>2. Prisma.update({ is_active: false })<br>3. Verificar en endpoint get-concepts | **Status 200 OK**<br>JSON: `{ "message": "Concept deleted successfully", "concept_id": 20 }`<br>Verificación: El concepto ya no aparece en lista pero existe en BD con is_active=false | Alta |
| DEL-02 | Eliminación de concepto ajeno | Token válido Usuario A<br>Concepto ID 30 es de Usuario B | `URL: /api/concepts/delete?id=30` | 1. Intentar borrar concepto de otro usuario<br>2. Backend verifica ownership | **Status 403 Forbidden**<br>JSON: `{ "message": "Access denied. You don't own this concept" }` | Crítica |
| DEL-03 | Falta parámetro ID | Token válido | `URL: /api/concepts/delete` (Sin params) | 1. Enviar DELETE sin ID<br>2. Backend valida parámetros requeridos | **Status 400 Bad Request**<br>JSON: `{ "message": "ID parameter is required" }` | Media |
| DEL-04 | Eliminación de concepto ya eliminado | Concepto ID 20 ya tiene is_active: false | `URL: /api/concepts/delete?id=20` | 1. Intentar borrar concepto ya borrado<br>2. Prisma.update ejecuta sin error (idempotencia) | **Status 200 OK**<br>JSON: `{ "message": "Concept already deleted", "concept_id": 20 }`<br>*(Operación idempotente, no genera error)* | Baja |
| DEL-05 | Concepto no encontrado | Token válido | `URL: /api/concepts/delete?id=99999` | 1. Intentar borrar ID inexistente | **Status 404 Not Found**<br>JSON: `{ "message": "Concept not found" }` | Media |

---

### 7. Endpoint: Obtener Autorización para Subir Imagen

**Archivo:** `src/app/api/concepts/upload-auth/route.ts`  
**Método:** GET  
**Lógica clave:** Genera una URL firmada (pre-signed URL) para que el cliente pueda subir una imagen directamente a un servicio de almacenamiento (ej: AWS S3, Cloudinary).

| ID | Título | Precondiciones | Entradas (Headers) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| UPL-01 | Generar URL firmada exitosamente | Token válido | `Authorization: Bearer <token_valido>` | 1. Verificar token<br>2. Generar pre-signed URL con SDK del servicio<br>3. URL válida por 15 minutos | **Status 200 OK**<br>JSON: `{ "upload_url": "https://s3.amazonaws.com/...", "expires_in": 900, "max_file_size": 5242880 }` (5MB) | Alta |
| UPL-02 | Sin token de autorización | N/A | *(Sin header Authorization)* | 1. Middleware detecta ausencia de token | **Status 401 Unauthorized**<br>JSON: `{ "message": "Unauthorized" }` | Alta |
| UPL-03 | Token expirado | Token JWT vencido | `Authorization: Bearer <token_expirado>` | 1. Middleware verifica expiración | **Status 401 Unauthorized**<br>JSON: `{ "message": "Token expired" }` | Media |

---

## BACKEND - Pruebas de Seguridad

### Tabla de Pruebas de Inyección y Sanitización

| ID | Título | Tipo de Ataque | Entrada Maliciosa | Endpoint Afectado | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| SEC-01 | Inyección SQL en Login (usuario) | SQL Injection | `{ "user": "admin' OR '1'='1", "password": "x" }` | POST /api/users/login | **Status 401 Unauthorized**<br>Prisma usa prepared statements (previene inyección por defecto)<br>No debe dar acceso | Crítica |
| SEC-02 | Inyección SQL en Login (password) | SQL Injection | `{ "user": "admin", "password": "x' OR '1'='1 --" }` | POST /api/users/login | **Status 401 Unauthorized**<br>bcrypt.compare() no es vulnerable a SQL injection | Crítica |
| SEC-03 | Inyección SQL en parámetro Slug | SQL Injection | `URL: /api/concepts/get-concept-by-slug?slug=test' OR '1'='1` | GET /api/.../get-concept-by-slug | **Status 404 Not Found** (o 400 si validas formato)<br>Prisma previene inyección | Crítica |
| SEC-04 | XSS en campo Content (Markdown) | XSS (Stored) | `{ "content": "<script>alert('XSS')</script>", ... }` | POST /api/concepts/create | **Status 201 Created**<br>El script debe ser **escapado/sanitizado** antes de guardar en BD<br>Al renderizar: usar librería como `DOMPurify` o `marked` con sanitize:true | Crítica |
| SEC-05 | XSS en campo Slug | XSS | `{ "slug": "<script>alert(1)</script>", ... }` | POST /api/concepts/create | **Status 400 Bad Request**<br>Validación de formato rechaza caracteres `<>` | Alta |
| SEC-06 | HTML Injection en Content | HTML Injection | `{ "content": "<iframe src='http://malicious.com'></iframe>", ... }` | POST /api/concepts/create | **Status 201 Created**<br>Al renderizar Markdown: librería debe filtrar tags peligrosos (iframe, object, embed) | Alta |
| SEC-07 | Path Traversal en Slug | Path Traversal | `{ "slug": "../../etc/passwd", ... }` | POST /api/concepts/create | **Status 400 Bad Request**<br>Validación rechaza caracteres `../` | Alta |
| SEC-08 | URL maliciosa en image_url | SSRF/Open Redirect | `{ "image_url": "javascript:alert(1)", ... }` | POST /api/concepts/create | **Status 400 Bad Request**<br>Validación solo acepta URLs HTTP/HTTPS | Media |
| SEC-09 | Token JWT falsificado | Token Tampering | Header: `Authorization: Bearer eyJhbGciOiJub25lIn0...` (alg:none) | Cualquier endpoint autenticado | **Status 401 Unauthorized**<br>Librería JWT debe rechazar tokens sin firma válida | Crítica |
| SEC-10 | ReproducciÃ³n de token (Replay Attack) | Token Reuse después de logout | Usar token válido después de simulado logout | Cualquier endpoint autenticado | **Status 401 Unauthorized**<br>*(Si implementan blacklist/logout)* O **Status 200 OK** si logout es solo client-side (Nota: JWT son stateless, considerar implementar refresh tokens) | Media |

---

## BACKEND - Pruebas de Integración

### Flujos Completos Usuario-Sistema-Base de Datos

| ID | Título | Precondiciones | Pasos del Flujo | Puntos de Verificación | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| INT-01 | Flujo completo: Login → Crear → Listar | BD limpia<br>Usuario registrado | 1. POST /api/users/login<br>2. Guardar token recibido<br>3. POST /api/concepts/create (con token)<br>4. GET /api/concepts/get-concepts (con token) | ✓ Login retorna token válido<br>✓ Concepto se crea en BD<br>✓ Lista muestra el concepto creado | **Éxito en todos los pasos**<br>El concepto creado aparece en la lista con todos sus campos correctos | Crítica |
| INT-02 | Flujo QR: Crear → Generar QR → Escanear → Visualizar | Token válido | 1. POST /api/concepts/create<br>2. Frontend genera QR con slug recibido<br>3. Simular escaneo: GET /api/concepts/get-concept-by-slug?slug=...<br>4. Verificar rendering del Markdown | ✓ Concepto se crea correctamente<br>✓ Slug es accesible públicamente<br>✓ Markdown se renderiza sin etiquetas HTML peligrosas | **Status 200 OK** en paso 3<br>Cliente obtiene contenido completo y puede visualizarlo correctamente | Crítica |
| INT-03 | CRUD completo: Crear → Editar → Eliminar → Verificar | Token válido | 1. POST /api/concepts/create (concepto inicial)<br>2. PATCH /api/concepts/update (modificar contenido)<br>3. GET /api/concepts/get-concepts (verificar cambios)<br>4. DELETE /api/concepts/delete<br>5. GET /api/concepts/get-concepts (verificar eliminación) | ✓ Cada operación retorna status correcto<br>✓ BD refleja cambios en cada paso<br>✓ Concepto eliminado no aparece en lista | **Éxito en todo el flujo**<br>Paso 3: Cambios reflejados<br>Paso 5: Lista sin el concepto eliminado (is_active=false en BD) | Crítica |
| INT-04 | Validación de sanitización Markdown en BD | Token válido | 1. POST /api/concepts/create con content: `"# Título\n**Negrita**\n<script>alert(1)</script>"`<br>2. GET /api/concepts/get-concept-by-slug<br>3. Verificar contenido retornado | ✓ Script tag debe estar sanitizado/escapado en BD<br>✓ Markdown legítimo (# **) se preserva<br>✓ Al renderizar en frontend, no ejecuta JavaScript | **Status 201 y 200 OK**<br>Content en BD: tags peligrosos removidos/escapados<br>Markdown válido intacto | Alta |
| INT-05 | Validación de ownership entre usuarios | 2 tokens válidos (Usuario A y B) | 1. Usuario A: POST /api/concepts/create<br>2. Guardar concept_id retornado<br>3. Usuario B: Intentar PATCH /api/concepts/update con concept_id de A<br>4. Usuario B: Intentar DELETE con concept_id de A | ✓ Paso 3 debe fallar con 403<br>✓ Paso 4 debe fallar con 403<br>✓ Concepto de A permanece intacto | **Status 403 Forbidden** en pasos 3 y 4<br>JSON: `{"message": "Access denied"}`<br>Concepto de Usuario A sin modificaciones | Crítica |
| INT-06 | Flujo de token expirado durante operación | Token válido próximo a expirar | 1. POST /api/users/login<br>2. Simular paso del tiempo (token expira)<br>3. Intentar GET /api/concepts/get-concepts con token expirado<br>4. POST /api/users/login nuevamente<br>5. GET /api/concepts/get-concepts con nuevo token | ✓ Paso 3 debe fallar con 401<br>✓ Paso 5 debe tener éxito | **Paso 3: Status 401 Unauthorized**<br>**Paso 5: Status 200 OK**<br>Sistema maneja correctamente expiración de tokens | Alta |

---

## FRONTEND - Pruebas de Interfaz de Usuario

Se realizarán pruebas manuales y de flujo sobre las vistas desarrolladas en Next.js. El objetivo es validar la responsividad en móviles y la correcta interpretación visual del formato Markdown antes de la generación del QR.

### Tabla de Pruebas de Renderizado y UX

| ID | Título | Precondición | Pasos (Acción del Usuario) | Resultado Visual Esperado | Criterios de Aceptación | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| FE-01 | Renderizado de Markdown en tiempo real | Sesión iniciada en `/crear` | 1. Escribir `**Oferta**` en campo de contenido<br>2. Observar vista previa | La "Vista en Tiempo Real" muestra la palabra **Oferta** en negrita inmediatamente (sin recargar página) | ✓ Actualización en <500ms<br>✓ Librería: react-markdown o marked.js<br>✓ Sin tags HTML peligrosos visibles | Alta |
| FE-02 | Renderizado de múltiples elementos Markdown | Sesión iniciada | 1. Escribir en el editor:<br>`# Título Principal`<br>`## Subtítulo`<br>`- Item 1`<br>`- Item 2`<br>`**Negrita** y *cursiva*` | Vista previa muestra:<br>- H1 para Título Principal<br>- H2 para Subtítulo<br>- Lista con bullets<br>- Texto con estilos correctos | ✓ Jerarquía de headers correcta<br>✓ Listas renderizadas con `<ul><li>`<br>✓ Estilos aplicados correctamente | Alta |
| FE-03 | Subida de imagen (Previsualización) | Sesión iniciada | 1. Hacer clic en "Subir imagen"<br>2. Seleccionar archivo JPG válido (2MB)<br>3. Esperar carga | La imagen aparece dentro del contenedor de previsualización (simulación de celular) | ✓ Imagen se carga en <3s<br>✓ Mantiene aspect ratio<br>✓ Muestra loader durante carga | Alta |
| FE-04 | Validación de tamaño de imagen | Sesión iniciada | 1. Intentar subir imagen de 10MB | Aparece mensaje de error: "La imagen no debe exceder 5MB" | ✓ No se sube la imagen<br>✓ Error visible y claro<br>✓ Usuario puede intentar con otra imagen | Media |
| FE-05 | Validación de formato de imagen | Sesión iniciada | 1. Intentar subir archivo PDF en campo de imagen | Aparece mensaje de error: "Solo se permiten imágenes (JPG, PNG, WEBP)" | ✓ Validación antes de upload<br>✓ Input solo acepta image/* | Media |
| FE-06 | Validación de campos vacíos | Sesión iniciada | 1. Dejar campos vacíos<br>2. Clic en "Guardar y generar QR" | El botón no envía la petición y aparecen mensajes de error rojos bajo los campos requeridos: "Este campo es obligatorio" | ✓ Validación client-side<br>✓ Errores específicos por campo<br>✓ Botón deshabilitado o previene submit | Media |
| FE-07 | Selector de color funcional | Sesión iniciada | 1. Hacer clic en selector de color<br>2. Elegir color azul (#0000FF)<br>3. Observar vista previa | Vista previa del QR/concepto cambia su color de fondo o acento al azul seleccionado | ✓ Color picker nativo del navegador<br>✓ Actualización inmediata en preview<br>✓ Valor hexadecimal visible | Media |
| FE-08 | Generación de Slug automático | Sesión iniciada | 1. Dejar campo slug vacío<br>2. Escribir "Oferta de Verano 2025" en algún campo de título<br>3. Sistema genera slug automáticamente | Campo slug se auto-completa con: `oferta-de-verano-2025` (lowercase, sin espacios, con guiones) | ✓ Slug editable después<br>✓ Validación de unicidad al guardar<br>✓ Sigue formato correcto | Baja |
| FE-09 | Responsividad en móvil (320px) | Sesión iniciada | 1. Abrir DevTools<br>2. Cambiar viewport a 320x568 (iPhone SE)<br>3. Navegar por formulario de creación | - Campos de formulario ocupan 100% del ancho<br>- Botones táctiles (mín 44x44px)<br>- Vista previa del celular se adapta<br>- Sin scroll horizontal | ✓ Sin elementos cortados<br>✓ Tipografía legible (mín 16px)<br>✓ Touch targets adecuados | Alta |
| FE-10 | Responsividad en tablet (768px) | Sesión iniciada | 1. Viewport a 768x1024 (iPad)<br>2. Navegar interfaz | Layout en 2 columnas: Editor (izq) y Preview (der) | ✓ Uso eficiente del espacio<br>✓ Formulario y preview visibles simultáneamente | Media |
| FE-11 | Respuesta a error de servidor (500) | Simular servidor caído | 1. Llenar datos correctamente<br>2. Clic en "Guardar"<br>3. Backend retorna 500 | Aparece notificación Toast/Alerta: "Error al conectar con el servidor. Por favor intenta de nuevo." | ✓ No crash de la app<br>✓ Usuario puede reintentar<br>✓ Datos del formulario se preservan | Media |
| FE-12 | Respuesta a error de validación (400) | Sesión iniciada | 1. Llenar formulario con slug duplicado<br>2. Clic en "Guardar"<br>3. Backend retorna 409 Conflict | Aparece error específico bajo campo slug: "Este slug ya existe, elige otro" | ✓ Error claro y accionable<br>✓ Otros campos permanecen llenos<br>✓ Focus automático en campo con error | Alta |
| FE-13 | Logout y limpieza de sesión | Sesión iniciada | 1. Clic en botón "Cerrar sesión"<br>2. Verificar redirección | - Redirige a /login<br>- Token JWT removido de localStorage/cookies<br>- No se puede acceder a rutas protegidas | ✓ Token eliminado completamente<br>✓ Intentar /crear redirige a /login<br>✓ Mensaje de confirmación (opcional) | Media |

---

### Tabla de Pruebas de Flujo de Pantallas

| ID | Título | Precondición | Pasos del Flujo | Puntos de Verificación | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| FLU-01 | Flujo de Login exitoso | Usuario registrado | 1. Navegar a `/login`<br>2. Ingresar credenciales válidas<br>3. Clic en "Iniciar sesión" | ✓ Página de login muestra formulario<br>✓ Botón se deshabilita durante petición<br>✓ Redirige a `/historial` al éxito | **Éxito**: Usuario en dashboard/historial con lista de conceptos | Alta |
| FLU-02 | Flujo de Login fallido | Usuario no registrado | 1. Navegar a `/login`<br>2. Ingresar credenciales incorrectas<br>3. Clic en "Iniciar sesión" | ✓ Backend retorna 401<br>✓ Aparece mensaje de error<br>✓ Usuario permanece en /login | Error visible: "Credenciales incorrectas"<br>Usuario puede reintentar | Alta |
| FLU-03 | Flujo completo de creación de concepto | Sesión iniciada | 1. Desde `/historial`, clic en "Crear nuevo"<br>2. Navega a `/crear`<br>3. Llenar todos los campos<br>4. Clic en "Guardar y generar QR"<br>5. Redirección a vista del QR generado | ✓ Formulario limpio en paso 2<br>✓ Validaciones en tiempo real<br>✓ Preview actualizado en paso 3<br>✓ QR generado y descargable en paso 5 | **Éxito**: QR generado con opciones de descarga (PNG/JPG/PDF)<br>Concepto visible en `/historial` | Crítica |
| FLU-04 | Flujo de edición de concepto existente | Sesión iniciada<br>Concepto creado previamente | 1. Desde `/historial`, clic en concepto existente<br>2. Navega a `/editar/:id`<br>3. Formulario pre-llenado con datos actuales<br>4. Modificar campo de contenido<br>5. Clic en "Actualizar"<br>6. Redirige a `/historial` | ✓ Datos se cargan correctamente en paso 3<br>✓ Preview refleja cambios en paso 4<br>✓ Backend retorna 200 en paso 5 | **Éxito**: Concepto actualizado visible en historial con cambios aplicados | Alta |
| FLU-05 | Flujo de eliminación de concepto | Sesión iniciada<br>Al menos 1 concepto en historial | 1. Desde `/historial`, clic en icono de eliminar<br>2. Aparece modal de confirmación<br>3. Clic en "Confirmar eliminación"<br>4. Modal se cierra<br>5. Concepto desaparece de la lista | ✓ Modal muestra advertencia clara<br>✓ Opción de cancelar disponible<br>✓ Eliminación lógica (is_active=false) | **Éxito**: Concepto removido de vista<br>Toast de confirmación: "Concepto eliminado exitosamente" | Alta |
| FLU-06 | Flujo de escaneo de QR (cliente) | QR generado y disponible | 1. Escanear QR con cámara de teléfono<br>2. Navega a URL: `/concepto/[slug]`<br>3. Página carga contenido del concepto | ✓ URL pública (sin autenticación)<br>✓ Contenido formateado correctamente<br>✓ Imagen visible y responsiva | **Éxito**: Cliente ve información completa del producto/concepto<br>Diseño mobile-friendly | Crítica |
| FLU-07 | Protección de rutas privadas | Sin sesión iniciada | 1. Intentar acceder directamente a `/crear`<br>2. Intentar acceder a `/historial` | ✓ Middleware verifica token<br>✓ Redirige a `/login` automáticamente | **Éxito**: Usuario no autenticado no puede acceder a rutas protegidas<br>Mensaje: "Debes iniciar sesión" | Alta |

---

## FRONTEND - Pruebas de Renderizado de Markdown

Validación específica de la librería de Markdown y su configuración de seguridad.

| ID | Entrada Markdown | Salida HTML Esperada | Validación de Seguridad | Prioridad |
| :---- | :---- | :---- | :---- | :---- |
| MD-01 | `**negrita**` | `<strong>negrita</strong>` | N/A | Alta |
| MD-02 | `*cursiva*` | `<em>cursiva</em>` | N/A | Alta |
| MD-03 | `# Título H1` | `<h1>Título H1</h1>` | N/A | Alta |
| MD-04 | `## Título H2` | `<h2>Título H2</h2>` | N/A | Media |
| MD-05 | `[Enlace](https://example.com)` | `<a href="https://example.com">Enlace</a>` | ✓ Validar que href no contenga `javascript:`<br>✓ Agregar `rel="noopener noreferrer"` si target="_blank" | Alta |
| MD-06 | `![Alt text](https://img.com/foto.jpg)` | `<img src="https://img.com/foto.jpg" alt="Alt text">` | ✓ Validar que src sea URL HTTPS válida | Media |
| MD-07 | `- Item 1\n- Item 2` | `<ul><li>Item 1</li><li>Item 2</li></ul>` | N/A | Media |
| MD-08 | `1. Primero\n2. Segundo` | `<ol><li>Primero</li><li>Segundo</li></ol>` | N/A | Baja |
| MD-09 | `` `código en línea` `` | `<code>código en línea</code>` | N/A | Baja |
| MD-10 | `<script>alert('XSS')</script>` | Tags `<script>` deben ser **escapados o removidos** | ✓ **CRÍTICO**: No debe ejecutar JavaScript<br>✓ Usar `DOMPurify` o configurar `marked` con `sanitize: true` | Crítica |
| MD-11 | `<iframe src="malicious.com"></iframe>` | Tag `<iframe>` debe ser **removido** | ✓ Filtrar tags peligrosos: `<iframe>`, `<object>`, `<embed>` | Crítica |
| MD-12 | `<img src=x onerror="alert(1)">` | Atributo `onerror` debe ser **removido** | ✓ Sanitizar atributos de eventos (onclick, onerror, etc.) | Crítica |
| MD-13 | `[Click aquí](javascript:alert(1))` | Link debe ser **deshabilitado o removido** | ✓ Rechazar protocolo `javascript:` en hrefs | Alta |
| MD-14 | `<a href="http://phishing.com">Enlace</a>` (HTML directo) | HTML directo debe ser **escapado**, no interpretado | ✓ Solo permitir Markdown syntax, no HTML raw | Alta |

---

## MATRIZ DE TRAZABILIDAD

Vinculación entre Requerimientos Funcionales y Casos de Prueba.

| Req. ID | Requisito Funcional | Casos de Prueba Relacionados | Cobertura |
| :---- | :---- | :---- | :---- |
| RF-01 | El sistema debe permitir al usuario cliente acceder a la información de un producto al escanear un código QR | SLG-01, SLG-02, SLG-03, SLG-04, SLG-05<br>INT-02, INT-06<br>FLU-06<br>FE-09 (responsividad móvil) | ✅ 100% |
| RF-02 | El sistema debe permitir al usuario administrador registrar un producto introduciendo información y subiendo una imagen | CRE-01, CRE-02, CRE-03, CRE-04, CRE-05, CRE-06, CRE-07<br>UPL-01, UPL-02, UPL-03<br>INT-01, INT-04<br>FLU-03<br>FE-01, FE-02, FE-03, FE-06 | ✅ 100% |
| RF-03 | El sistema debe permitir al usuario administrador guardar el código QR en formatos PNG, JPG o PDF | FLU-03 (paso 5: descarga de QR)<br>*(Nota: Requiere pruebas adicionales específicas de generación de QR en diferentes formatos)* | ⚠️ 70% |
| RF-04 | El sistema debe permitir al usuario administrador editar la información de un producto registrado | UPD-01, UPD-02, UPD-03, UPD-04, UPD-05, UPD-06, UPD-07<br>INT-03, INT-05<br>FLU-04 | ✅ 100% |
| RF-05 | El sistema debe permitir al usuario administrador eliminar productos registrados | DEL-01, DEL-02, DEL-03, DEL-04, DEL-05<br>INT-03, INT-05<br>FLU-05 | ✅ 100% |

**Criterios de Calidad - Cobertura:**

| Criterio | Casos de Prueba Relacionados | Cobertura |
| :---- | :---- | :---- |
| **Usabilidad** | FE-01 a FE-13, FLU-01 a FLU-07, MD-01 a MD-14 | ✅ Cubierto |
| **Seguridad** | SEC-01 a SEC-10, MD-10 a MD-14, INT-04, INT-05 | ✅ Cubierto |
| **Extensibilidad** | *(Arquitectura MVC facilita extensión, no requiere pruebas específicas)* | N/A |
| **Accesibilidad** | FE-09 (móvil 320px), FE-10 (tablet 768px), FLU-06 (QR público responsive) | ✅ Cubierto |

---

## HERRAMIENTAS Y ENTORNO DE PRUEBAS

### Backend (Node.js/Next.js API Routes)
- **Framework de pruebas**: Jest o Vitest
- **Biblioteca de assertions**: expect (integrada)
- **Mocking**: jest.mock() para Prisma y servicios externos
- **Base de datos**: PostgreSQL/MySQL con BD de prueba separada
- **Cobertura de código**: Istanbul (integrado en Jest)

### Frontend (Next.js/React)
- **Framework de pruebas**: Jest + React Testing Library
- **Pruebas E2E**: Playwright o Cypress (opcional para flujos críticos)
- **Renderizado de Markdown**: react-markdown con rehype-sanitize
- **Sanitización**: DOMPurify para prevención de XSS

### Seguridad
- **Validación de inputs**: zod o yup para schemas
- **Autenticación**: jsonwebtoken (JWT)
- **Hash de contraseñas**: bcrypt
- **Rate limiting**: Middleware para prevenir brute force

---

## CRITERIOS DE ACEPTACIÓN GLOBAL

Para considerar el sistema listo para producción:

1. ✅ **100% de pruebas críticas pasadas** (prioridad Alta y Crítica)
2. ✅ **≥ 90% de pruebas medias pasadas**
3. ✅ **0 vulnerabilidades críticas de seguridad** (SEC-01 a SEC-10 todas pasadas)
4. ✅ **Cobertura de código ≥ 80%** en backend
5. ✅ **Todos los flujos de integración funcionando** (INT-01 a INT-06)
6. ✅ **Responsividad validada** en al menos 3 tamaños de pantalla (móvil, tablet, desktop)
7. ✅ **Markdown renderiza correctamente** sin vulnerabilidades XSS (MD-10 a MD-14)

---

## NOTAS FINALES

### Recomendaciones Adicionales

1. **Implementar refresh tokens**: Los JWT son stateless, considerar sistema de refresh para logout real
2. **Rate limiting en Login**: Prevenir ataques de fuerza bruta (máximo 5 intentos por IP en 15 minutos)
3. **Logs de auditoría**: Registrar todas las operaciones CRUD con timestamp y user_id
4. **Backup de BD**: Plan de respaldo antes de operaciones masivas de testing
5. **Monitoreo**: Implementar Sentry o similar para tracking de errores en producción

### Casos de Prueba Pendientes

- **QR-01 a QR-03**: Generación de QR en formatos PNG, JPG, PDF (requiere especificación de librería usada)
- **PERF-01**: Tiempo de respuesta de endpoints (< 200ms para GET, < 500ms para POST)
- **PERF-02**: Carga concurrente (10 usuarios simultáneos sin degradación)

---

**Documento preparado por**: Equipo de QA  
**Fecha**: 31 de Diciembre, 2024  
**Versión**: 2.0 (Corregida y Ampliada)