import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/*
 * ===================================================================
 * Konfigurasi Firebase (WAJIB ADA)
 * ===================================================================
 */
// Variabel global dari Canvas (JANGAN DIUBAH)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-admin-panel';
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "DEMO_API_KEY", authDomain: "DEMO.firebaseapp.com", projectId: "DEMO_PROJECT_ID" }; // Fallback untuk demo
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Path Database
export const USERS_COLLECTION = `artifacts/${appId}/public/data/admin_users`;
export const ROLES_COLLECTION = `artifacts/${appId}/public/data/admin_roles`;
export const PERMISSIONS_COLLECTION = `artifacts/${appId}/public/data/admin_api_permissions`;