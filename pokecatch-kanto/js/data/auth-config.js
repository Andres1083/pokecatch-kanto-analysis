// Configuración de Firebase para "Iniciar sesión con Google".
// Mientras sea null, el botón de Google muestra un aviso y solo funciona el modo invitado.
//
// Cómo activarlo (5 min, gratis):
//  1. https://console.firebase.google.com → Añadir proyecto.
//  2. Compilación → Authentication → Comenzar → Método de acceso → Google → Habilitar.
//  3. Authentication → Configuración → Dominios autorizados: añade el dominio donde publiques
//     (localhost ya viene incluido).
//  4. Configuración del proyecto → Tus apps → Web (</>) → copia el objeto firebaseConfig aquí abajo.
export const FIREBASE_CONFIG = null;
// Ejemplo:
// export const FIREBASE_CONFIG = {
//   apiKey: "...", authDomain: "tu-proyecto.firebaseapp.com", projectId: "tu-proyecto",
//   appId: "...",
// };
