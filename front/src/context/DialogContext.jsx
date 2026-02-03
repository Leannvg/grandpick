import { createContext, useContext, useState, useCallback } from "react";
import FloatingDialog from "../components/FloatingDialog.jsx";

const DialogContext = createContext();

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    confirmVariant: "primary",
    onConfirm: null,
    onCancel: null,
  });

  const confirmDialog = useCallback(
    ({ title, message, confirmText, cancelText, confirmVariant }) => {
      return new Promise((resolve, reject) => {
        setDialog({
          show: true,
          title,
          message,
          confirmText,
          cancelText,
          confirmVariant,
          onConfirm: () => {
            setDialog((prev) => ({ ...prev, show: false }));
            resolve(true);
          },
          onCancel: () => {
            setDialog((prev) => ({ ...prev, show: false }));
            reject(false);
          },
        });
      });
    },
    []
  );

  return (
    <DialogContext.Provider value={{ confirmDialog }}>
      {children}
      <FloatingDialog
        show={dialog.show}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        confirmVariant ={dialog.confirmVariant}
        onCancel={dialog.onCancel}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
