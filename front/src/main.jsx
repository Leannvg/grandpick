import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from "react-router-dom"
import { AlertProvider } from "./context/AlertContext.jsx"
import { DialogProvider } from "./context/DialogContext.jsx"
import { LoaderProvider } from './context/LoaderContext.jsx'
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill"
polyfillCountryFlagEmojis()

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service Worker registrado con éxito:", registration);
      })
      .catch((error) => {
        console.log("Error al registrar el Service Worker:", error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>
        <AlertProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </AlertProvider>
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>
)
