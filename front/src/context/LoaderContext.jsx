import { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  function showLoader() {
    setLoading(true);
  }

  function hideLoader() {
    setLoading(false);
  }

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}

      {loading && (
        <div style={styles.overlay}>
          <div style={styles.box}>Cargando...</div>
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  box: {
    background: "white",
    padding: "20px 30px",
    borderRadius: "10px",
    fontSize: "20px",
    fontWeight: "bold"
  }
};
