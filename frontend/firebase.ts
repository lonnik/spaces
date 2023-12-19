// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3_cJJgEkDXegs4q5nQJelypdvpCNlBF4",
  authDomain: "spaces-prototype.firebaseapp.com",
  projectId: "spaces-prototype",
  storageBucket: "spaces-prototype.appspot.com",
  messagingSenderId: "761033409352",
  appId: "1:761033409352:web:bcda0f4296ec9f7ace697d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
