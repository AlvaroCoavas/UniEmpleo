# Uniempleo móvil (Ionic + Firebase)

## Requisitos
- Node 18+
- `npm i -g @ionic/cli` (opcional, también funciona con `npx ionic`)
- `npm i -g firebase-tools`

## Configuración de Firebase
1. Crear proyecto en Firebase.
2. Activar Authentication con Email/Password.
3. Crear Firestore en modo producción.
4. Obtener `firebaseConfig` y pegarlo en `src/environments/environment.ts` y `environment.prod.ts`.
5. Definir reglas de Firestore iniciales (ajústalas según tus necesidades):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isEmpresa() { return request.auth.token.role == 'empresa'; }

    match /usuarios/{uid} {
      allow read: if isAuth();
      allow write: if isAuth() && request.auth.uid == uid;
    }

    match /empresas/{uid} {
      allow read: if isAuth();
      allow write: if isAuth() && request.auth.uid == uid;
    }

    match /vacantes/{id} {
      allow read: if true;
      allow create: if isAuth() && isEmpresa();
      allow update, delete: if isAuth() && isEmpresa() && request.resource.data.empresaId == request.auth.uid;
    }

    match /conversations/{conv} {
      allow read, write: if isAuth();
      match /messages/{msg} {
        allow read, write: if isAuth();
      }
    }
  }
}
```

## Roles
- Opción rápida: guardar `role` en documento (`usuarios` o `empresas`) y validar desde la app.
- Opción robusta: usar Custom Claims para `role` y reglas por token.

### Asignar Custom Claims
1. `firebase init functions` en la raíz del repo o en `uniempleo-mobile/functions`.
2. Instalar Admin SDK: `npm i firebase-admin` dentro de `functions`.
3. Crear función HTTP para setear rol de usuario:

```js
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '');
  if (context.auth.token.role !== 'admin') throw new functions.https.HttpsError('permission-denied', '');
  await admin.auth().setCustomUserClaims(data.uid, { role: data.role });
  return { ok: true };
});
```

## Cloud Function de Feed
1. `firebase init functions` si no lo hiciste.
2. Instalar dependencias necesarias (`node-fetch` o Axios y cualquier parser RSS).
3. Crear una función HTTP `getFeed` que lea Firestore (`vacantes` recientes), agregue noticias RSS y videos YouTube usando `GOOGLE_API_KEY` y devuelva JSON.
4. Pegar la URL de la función en `environment.functionsBaseUrl`.

## Migración de datos desde MySQL (vacantes/usuarios/empresas)
1. Exportar tablas a CSV/JSON.
2. Crear script Node con Admin SDK para importar:

```js
// import.js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function run() {
  const vacantes = require('./vacantes.json');
  for (const v of vacantes) {
    await db.collection('vacantes').add({
      empresaId: v.empresa_id,
      titulo: v.titulo,
      descripcion: v.descripcion,
      requisitos: v.requisitos,
      ubicacion: v.ubicacion,
      salario: Number(v.salario) || null,
      estado: v.estado || 'activa',
      createdAt: Date.now()
    });
  }
}
run();
```

## Desarrollo y pruebas
- `npm start` dentro de `uniempleo-mobile` o `npx ionic serve`.
- Navegar a `http://localhost:8100`.
- Rellenar `firebaseConfig` antes de probar login/CRUD/chat.

## Android/iOS
- `npx ionic build`
- `npx cap sync`
- `npx cap open android` / `npx cap open ios`

## Variables necesarias
- `firebaseConfig`: claves del proyecto Firebase.
- `functionsBaseUrl`: base de las Cloud Functions desplegadas.
- `GOOGLE_API_KEY`: si quieres agregar YouTube/News al feed.

## Qué necesito de ti
1. `firebaseConfig` del proyecto.
2. Decidir si usaremos Custom Claims o campo `role`.
3. `GOOGLE_API_KEY` para feed.
4. Exportar datos actuales de MySQL.
5. Icono y splash oficiales.
6. Aprobación de estructura de navegación.