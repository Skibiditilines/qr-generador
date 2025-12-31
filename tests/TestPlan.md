# Documento de Plan de pruebas 

## Proyecto del equipo de desarrollo para el escaneo de códigos QR

Erick Daniel Martinez Martinez   
Ethan Yahel Sarricolea Cortes   
Elias Martinez Dominguez

## Propósito

El sistema a desarrollar tiene como propósito para el cliente la capacidad de crear un código QR que le permita conocer a sus compradores e interesados la información referente a los productos ofertados por el cliente , esto le permitirá realizar el proceso de venta y promocion de manera eficiente y cómoda

## Requerimientos 

A continuación se presentan los siguientes artefactos los cuales exploran a detalle las funcionalidades que debe cumplir el sistema a desarrollar mediante los diferentes tipos de artefactos

### Requerimientos funcionales 

| No. | Requisito. | Tipo de requisito |
| :---- | :---- | :---- |
| 1\. | El sistema debe permitir al usuario cliente acceder a la información de un producto al escanear un código QR. | Sistema |
| 2\. | El sistema debe permitir al usuario administrador registrar un producto introduciendo la información (datos, id de producto, imagen, precio) y subiendo una imagen. | Sistema |
| 3\. | El sistema debe permitir al usuario administrador guardar el código QR de un producto en cualquiera de los formatos listados (PNG, JPG o PDF) | Sistema |
| 4\. | El sistema debe permitir al usuario administrador editar la información (datos, id de producto, imagen, precio) de un producto registrado. | Sistema |
| 5\.  | El sistema debe permitir al usuario administrador eliminar productos registrados. | Sistema |

### Criterios de calidad 

* **Usabilidad**: Fácil uso para el usuario administrador y buena experiencia de usuario para ambos tipos de usuario.  
    
* **Extensibilidad**: Debido a la posibilidad de mejoras del sistema, correcciones o adición de funcionalidades extra.  
    
* **Accesibilidad**: página web de uso posible en dispositivos móviles y de escritorio.  
    
* **Seguridad**: La contraseña debe registrarse hasheada

## Arquitectura 

En base a los criterios de calidad establecidos se opto por el uso del Modelo Vista Controlador , el cual se define como una arquitectura tradicional apta para cualquier tipo de proyecto , a su vez , el sistema tendrá los siguientes endpoints del backend:

1. **Login (POST)**  
2. **Get All Concepts(GET)**  
3. **Post Create Concept(POST)**  
4. **Get Concept for Slug(GET)**  
5. **Update concept(PATCH)**  
6. **Delete conept(DELETE )**  
7. **Get auth to upload image(GET)**

## Alcance

Las pruebas realizadas a este sistema se centran en probar aspectos visuales en el uso del markdown y en la sanitización del texto, así como pruebas para evitar posibles inyecciones HTML y SQL

### Limitaciones

para la realización de este plan de pruebas no se realizarán pruebas de carga/estrés masivo, pruebas de penetración, ni pruebas de compatibilidad con una gran variedad de dispositivos físicos.

## Estrategia

Para el desenlace de estas pruebas se realizarán **pruebas unitarias** sobre los diferentes endpoints del backend 

Las pruebas principales se centraran en que el codigo backend pueda manejar errores en cuanto a la inyeccion de codigo HTML , o en otro caso la inyeccion SQL tratandose del inicio de sesion (login) 

De la misma forma se realizaran pruebas referentes al flujo de pantallas , dentro de las cuales se incluyen:

1. **Login**  
2. **Historial**  
3. **Pantalla de creación**  
4. **Visualización de concepto**

El propósito de las pruebas al frontend es asegurar la operación de todas las pantallas en un flujo conciso y claro , ademas , en cuanto a la creación de conceptos , se buscara control completo de todos los casos del formato , esto para que el cliente no note problemas en cuanto al tipado utilizado el cual se opto por markdown

De la misma manera se realizaran pruebas de integración observando la manera en la que la base de datos recibe el formato markdown de la manera correcta y de manera sanitizada , además se enfatiza en que el backend envie a la base de datos todos los campos requeridos para la realizacion de un concepto 

# Tablas de casos de prueba 

Los casos de prueba para el backend estan basados en los enpoints de desarrollo marcados

## Backend

### **1\. Endpoint: Iniciar Sesión (Login)**

Archivo: src/app/api/users/login/route.ts

Método: POST

Lógica clave: Valida credenciales contra la tabla Account y devuelve un token firmado.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| LOG-01 | Inicio de sesión exitoso | \- Usuario registrado en BD. | { "user": "admin", "password": "password123" } | 1\. Enviar petición POST. 2\. Validar respuesta. | Status 200 OK. JSON incluye: account\_id, access\_token, account\_type y exp1. | Alta |
| LOG-02 | Credenciales faltantes | N/A | { "user": "admin" } (Falta password) | 1\. Enviar petición POST incompleta. | Status 400 Bad Request. JSON: { "message": "Missing credentials" }2. | Media |
| LOG-03 | Usuario no encontrado | \- BD operativa. | { "user": "inexistente", "password": "123" } | 1\. Enviar credenciales de usuario no registrado. | Status 401 Unauthorized. JSON: { "message": "Invalid credentials" }3. | Alta |
| LOG-04 | Contraseña incorrecta | \- Usuario "admin" existe. | { "user": "admin", "password": "incorrecta" } | 1\. Enviar usuario válido con contraseña errónea. | Status 401 Unauthorized. JSON: { "message": "Invalid credentials" }4. | Alta |
| LOG-05 | Error Interno | \- Simular fallo en Prisma/BD. | { "user": "admin", "password": "123" } | 1\. Forzar error de conexión DB. 2\. Enviar POST. | Status 500 Internal Server Error. JSON: { "message": "Internal error" }5. | Baja |

---

### 2\. Endpoint: Obtener Conceptos (Panel Admin)

Archivo: src/app/api/concepts/get-concepts/route.ts  
Método: GET  
Lógica clave: Obtiene los conceptos solo del usuario logueado (where: { account\_id: accountId }). Requiere token.

| ID | Título | Precondiciones | Entradas (Headers) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| CON-01 | Obtener lista de conceptos | \- Token válido de Admin. \- Conceptos creados en BD. | Authorization: Bearer \<token\_valido\> | 1\. Enviar GET a /api/concepts/get-concepts. | Status 200 OK. JSON: Array de objetos con concept\_id, date, y slug6. Ordenados por fecha descendente. | Alta |
| CON-02 | Sin conceptos registrados | \- Token válido. \- Usuario sin conceptos. | Authorization: Bearer \<token\_valido\> | 1\. Enviar GET. | Status 200 OK. JSON: Array vacío \[\] (Prisma devuelve lista vacía si no hay coincidencias). | Media |
| CON-03 | Token inválido o expirado | N/A | Authorization: Bearer \<token\_falso\> | 1\. Enviar GET con token erróneo. | Status 401 Unauthorized. JSON: { "message": "Unauthorized or error" } (El catch captura el fallo de getAuthData)7. | Alta |
| CON-04 | Filtrado por Activo | \- Token válido. \- 1 concepto activo, 1 inactivo. | Authorization: Bearer \<token\_valido\> | 1\. Enviar GET. 2\. Verificar items. | Status 200 OK. El JSON solo debe mostrar el concepto donde is\_active: true8. | Media |

---

### **3\. Endpoint: Obtener Concepto por Slug (Público/QR)**

Archivo: src/app/api/concepts/get-concept-by-slug/route.ts

Método: GET

Lógica clave: Busca un concepto por su URL (slug). Usado cuando el cliente escanea el QR.

| ID | Título | Precondiciones | Entradas (Query Params) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| SLG-01 | Escaneo Exitoso | \- Concepto con slug "promo-2025" existe y es activo. | URL: .../route?slug=promo-2025 | 1\. Enviar GET con parámetro slug válido. | Status 200 OK. JSON: Array con detalles completos (content, color, image\_url, etc.)9. | Alta |
| SLG-02 | Falta parámetro Slug | N/A | URL: .../route (Sin params) | 1\. Enviar GET sin query string. | Status 400 Bad Request. JSON: { "message": "Slug parameter is required" }. | Media |
| SLG-03 | Slug No Encontrado | \- BD operativa. | URL: .../route?slug=no-existe | 1\. Enviar GET con slug inexistente. | Status 200 OK. JSON: Array vacío \[\]. (Nota: El código usa findMany, por lo que devuelve un array vacío, no un 404). | Alta |
| SLG-04 | Concepto Inactivo | \- Concepto existe pero is\_active: false. | URL: .../route?slug=slug-inactivo | 1\. Enviar GET. | Status 200 OK. JSON: Array vacío \[\] (Filtrado por is\_active: true en la query)12. | Media |

### 

### **4\. Endpoint: Crear Concepto**

Ruta sugerida: /api/concepts/create

Método: POST

Lógica clave: Valida campos obligatorios, verifica que el slug sea único y crea el registro asociado al usuario logueado.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **CRE-01** | Creación Exitosa de Concepto | \- Token válido. \- Slug no existe en BD. | { "content": "\*\*Oferta\*\*", "slug": "verano-2025", "image\_url": "https://img...", "color": "\#FF0000" } | 1\. Enviar POST con datos válidos. 2\. Validar respuesta. | **Status 201 Created.**  JSON retorna el objeto creado con concept\_id y is\_active: true. | Alta |
| **CRE-02** | Validación de Campos Faltantes | \- Token válido. | { "slug": "test", "color": "\#000" } (Faltan content e image\_url) | 1\. Enviar POST incompleto. | **Status 400 Bad Request.**  JSON: { "message": "Missing required fields" }. | Alta |
| **CRE-03** | Slug Duplicado (Conflicto) | \- Ya existe un concepto con slug "promo-1". | { "slug": "promo-1", "content": "...", "image\_url": "..." } | 1\. Intentar crear concepto con slug repetido. | **Status 409 Conflict.**  JSON: { "message": "Slug already exists" }. | Alta |
| **CRE-04** | Creación sin Token | N/A | Body válido. | 1\. Enviar POST sin header Authorization. | **Status 401 Unauthorized.**  JSON: { "message": "Unauthorized" }. | Alta |

---

### **5\. Endpoint: Actualizar Concepto**

Ruta sugerida: /api/concepts/update

Método: PUT (o PATCH)

Lógica clave: Verifica que el concept\_id exista y pertenezca al usuario que hace la petición antes de editar.

| ID | Título | Precondiciones | Entradas (Body JSON) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **UPD-01** | Actualización Exitosa | \- Token válido. \- Concepto ID 10 pertenece al usuario. | { "concept\_id": 10, "content": "Nuevo texto", "color": "\#00FF00" } | 1\. Enviar PUT con datos nuevos. 2\. Validar respuesta. | **Status 200 OK.**  JSON muestra los datos actualizados. | Alta |
| **UPD-02** | Intento de Edición Ajena (Seguridad) | \- Token válido Usuario A. \- Concepto ID 50 pertenece a Usuario B. | { "concept\_id": 50, "content": "Hackeado" } | 1\. Usuario A intenta editar concepto de B. | **Status 404 Not Found** (o 403). JSON: { "message": "Concept not found or access denied" }. | Crítica |
| **UPD-03** | Falta ID de Concepto | \- Token válido. | { "content": "Texto suelto" } (Sin concept\_id) | 1\. Enviar PUT sin identificador. | **Status 400 Bad Request.**  JSON: { "message": "Concept ID is required" }. | Media |
| **UPD-04** | Concepto Inexistente | \- Token válido. | { "concept\_id": 99999, "content": "..." } | 1\. Enviar PUT a ID que no existe en BD. | **Status 404 Not Found.**  JSON: { "message": "Concept not found or access denied" }. | Media |

---

### **6\. Endpoint: Eliminar Concepto**

Ruta sugerida: /api/concepts/delete

Método: DELETE

Lógica clave: Realiza un Borrado Lógico (is\_active: false) en lugar de eliminar el registro físico. Solo el dueño puede borrarlo.

| ID | Título | Precondiciones | Entradas (Query Params) | Pasos | Resultado Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| DEL-01 | Eliminación Exitosa (Soft Delete) | \- Token válido. \- Concepto ID 20 es del usuario y está activo. | URL: .../delete?id=20 | 1\. Enviar DELETE. 2\. Verificar en BD (o endpoint get-concepts). | Status 200 OK. JSON: { "message": "Concept deleted successfully" }. (Verificación: El concepto ya no sale en la lista, pero sigue en BD con is\_active=false). | Alta |
| DEL-02 | Eliminación de Concepto Ajeno | \- Token válido Usuario A. \- Concepto ID 30 es de Usuario B. | URL: .../delete?id=30 | 1\. Intentar borrar concepto de otro usuario. | Status 404 Not Found. JSON: { "message": "Concept not found or access denied" }. | Crítica |
| DEL-03 | Falta Parámetro ID | \- Token válido. | URL: .../delete (Sin params) | 1\. Enviar DELETE sin ID. | Status 400 Bad Request. JSON: { "message": "ID parameter is required" }. | Media |
| DEL-04 | Eliminación Doble | \- Concepto ya eliminado (is\_active: false). | URL: .../delete?id=20 | 1\. Intentar borrar un concepto ya borrado. | Status 404 Not Found (El findFirst filtra por lo que esté activo/visible para el usuario, o simplemente actualiza de nuevo a false sin error, dependiendo de tu lógica exacta). | Baja |

# Pruebas de Interfaz de Usuario

Se realizarán pruebas manuales y de flujo sobre las vistas desarrolladas en [Next.js](http://Next.js).

El objetivo es validar la responsividad en móviles y la correcta interpretación visual del formato Markdown antes de la generación del QR.

| ID | Título | Precondición | Pasos (Acción del Usuario) | Resultado Visual Esperado | Prioridad |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FE-01 | Renderizado de Markdown en Tiempo Real | Sesión iniciada en /crear | 1\. Escribir \*\*Oferta\*\* en el campo de contenido. | La "Vista en Tiempo Real" muestra la palabra Oferta en negrita inmediatamente. | Alta |
| FE-02 | Subida de Imagen (Previsualización) | Sesión iniciada | 1\. Hacer clic en "Subir imagen". 2\. Seleccionar un archivo JPG válido. | La imagen aparece cargada dentro del contenedor del celular en la pantalla. | Alta |
| FE-03 | Validación de Campos Vacíos | Sesión iniciada | 1\. Dejar campos vacíos. 2\. Clic en "Guardar y generar QR". | El botón no envía la petición y aparecen mensajes de error rojos bajo los campos requeridos. | Media |
| FE-04 | Respuesta a Error de Servidor | Simular servidor caído | 1\. Llenar datos correctamente. 2\. Clic en "Guardar". | Debe aparecer una notificación (Toast/Alerta) diciendo "Error al conectar con el servidor", no debe quedarse la pantalla blanca. | Media |

