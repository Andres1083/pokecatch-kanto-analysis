// Sesión: invitado (local) o Google (Firebase Auth). La partida sigue guardándose en este dispositivo.
import { FIREBASE_CONFIG } from "../data/auth-config.js?v=137";

const KEY = "pokecatch-session-v1";
const FB = "https://www.gstatic.com/firebasejs/10.12.2";
let fb = null;

export function googleAvailable() { return !!FIREBASE_CONFIG; }

export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) { return null; }
}
function setSession(s) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (_) {}
  return s;
}

export function playAsGuest() { return setSession({ mode: "guest", name: "Invitado" }); }
export function signOut() {
  const was = getSession();
  setSession(null);
  if (was?.mode === "google" && fb) fb.mod.signOut(fb.auth).catch(() => {});
}

async function loadFirebase() {
  if (fb) return fb;
  const [appM, authM] = await Promise.all([import(`${FB}/firebase-app.js`), import(`${FB}/firebase-auth.js`)]);
  const app = appM.initializeApp(FIREBASE_CONFIG);
  fb = { mod: authM, auth: authM.getAuth(app) };
  return fb;
}

/** Abre el login de Google. Lanza Error con mensaje en español si falla. */
export async function signInWithGoogle() {
  if (!FIREBASE_CONFIG) throw new Error("Google aún no está configurado (falta js/data/auth-config.js).");
  const { mod, auth } = await loadFirebase();
  try {
    const r = await mod.signInWithPopup(auth, new mod.GoogleAuthProvider());
    const u = r.user;
    return setSession({ mode: "google", uid: u.uid, name: (u.displayName || u.email || "Entrenador").split(" ")[0], photo: u.photoURL || "", email: u.email || "" });
  } catch (e) {
    if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") throw new Error("Inicio de sesión cancelado.");
    if (e?.code === "auth/unauthorized-domain") throw new Error("Este dominio no está autorizado en Firebase.");
    if (e?.code === "auth/popup-blocked") throw new Error("El navegador bloqueó la ventana de Google. Permite ventanas emergentes.");
    throw new Error("No se pudo iniciar sesión con Google.");
  }
}
