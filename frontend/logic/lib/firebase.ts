// Zero-side-effect Firebase compatibility stub.
// Prevents loading background device capability scanners, WebAuthn/FedCM, and installation tokens
// that trigger Chromium's "Access other apps and services on this device" dialog on site load.

export const firebaseApp = {} as any;
export const db = {} as any;

export const firebaseAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signOut: async () => {}
} as any;
