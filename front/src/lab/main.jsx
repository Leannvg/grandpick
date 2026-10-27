import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from "../context/AlertContext.jsx";
import { DialogProvider } from "../context/DialogContext.jsx";
import { LoaderProvider } from "../context/LoaderContext.jsx";
import Lab from "./Lab.jsx";
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import "./lab.css";

polyfillCountryFlagEmojis();

ReactDOM.createRoot(document.getElementById("lab-root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>
        <AlertProvider>
          <DialogProvider>
            <Lab />
          </DialogProvider>
        </AlertProvider>
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>
);
