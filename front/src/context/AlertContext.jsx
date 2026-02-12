import { createContext, useContext, useState, useCallback } from "react";
import FloatingAlert from "../components/FloatingAlert.jsx";
import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const timeoutRef = useRef(null);
  const location = useLocation();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
    persistent: false,
  });



  useEffect(() => {
    // Si la alerta es persistente → debe ocultarse al cambiar la URL
    // Si NO es persistente → NO tocarla
    setAlert((prev) => {
      if (prev.persistent) {
        return { ...prev, show: false };
      }
      return prev; // ⬅ No hacer nada si no es persistente
    });

    if (alert.persistent && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [location.pathname]);


 

  const showAlert = useCallback((arg1, arg2, arg3) => {
    let config = {};

    // ----- Sintaxis antigua -----
    // showAlert("mensaje", "danger", true)
    if (typeof arg1 === "string") {
      config.message = arg1;
      config.type = arg2 || "success";
      config.persistent = Boolean(arg3);   // 👈 TERCER PARÁMETRO COMO PERSISTENTE
      config.duration = config.persistent ? null : 8000;
    }

    // ----- Sintaxis nueva -----
    // showAlert({ message, type, duration, persistent })
    else if (typeof arg1 === "object") {
      config = {
        message: arg1.message,
        type: arg1.type || "success",
        duration: arg1.duration ?? 3000,
        persistent: arg1.persistent ?? false
      };
    } else {
      return;
    }

    // Limpiar timeout previo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlert({
      show: true,
      message: config.message,
      type: config.type,
      persistent: config.persistent,
    });

    // Si NO es persistente, iniciar timeout
    if (!config.persistent && config.duration) {
      timeoutRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
        timeoutRef.current = null;
      }, config.duration);
    }
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}

      <FloatingAlert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        position="top-center"
        autoClose={null}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
