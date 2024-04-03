// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// doesn't point to valid Firebase project anymore
const firebaseConfig = {
  apiKey: "AIzaSyAQnaSfi9aYTDM03Qbs5cEDAPnDznM_RDk",
  authDomain: "spaces-prototype-408615.firebaseapp.com",
  projectId: "spaces-prototype-408615",
  storageBucket: "spaces-prototype-408615.appspot.com",
  messagingSenderId: "717063629448",
  appId: "1:717063629448:web:be287e333c134a787a0d3d",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
