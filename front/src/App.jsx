import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthListener from "./components/AuthListener";
import { NotificationsProvider } from "./context/NotificationsContext";
// Pages

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Drivers from "./pages/Drivers";
import Dashboard from "./pages/admin/Dashboard";
import Predictions from "./pages/Predictions";
// Admin pages
import TeamCreate from "./pages/admin/team/TeamCreate";
import TeamEdit from "./pages/admin/team/TeamEdit";
import DriverCreate from "./pages/admin/driver/DriverCreate";
import DriverEdit from "./pages/admin/driver/DriverEdit";
import CircuitCreate from "./pages/admin/circuit/CircuitCreate";
import CircuitEdit from "./pages/admin/circuit/CircuitEdit";
import RaceCreate from "./pages/admin/race/RaceCreate";
import RaceEdit from "./pages/admin/race/RaceEdit";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import { connectSocket, disconnectSocket} from "./socket";
import { useAlert } from "./context/AlertContext";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import UsersServices from "./services/users.services.js";


function App() {

  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [estaAutenticado, setAutenticado] = useState(false);
  const [esAdmin, setAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const perfil = await UsersServices.getUserProfile();

        setAutenticado(true);
        setUserId(perfil._id);
        connectSocket(perfil._id);

        if (perfil.rol === "admin") {
          setAdmin(true);
        }

      } catch (error) {
        console.error("Error al restaurar sesión:", error);
        localStorage.clear();
      } finally {
        setCargando(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      disconnectSocket();
      return;
    }

    connectSocket(userId);

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  function onLogin(user, token) {
    setAutenticado(true);
    setUserId(user._id);

    if (user.rol === 'admin') {
      setAdmin(true);
    }

    localStorage.setItem('auth-token', token);

    navigate('/');
  }



  function onLogout() {
    setAutenticado(false);
    setUserId(null);
    setAdmin(false);

    localStorage.clear();

    showAlert("Te esperamos para tu próxima visita!", "success", false);
    navigate("/login", { replace: true });
  }

  if (cargando) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <NotificationsProvider userId={estaAutenticado ? userId : null}>
      <AuthListener />
        <Nav onLogout={onLogout} autenticado={estaAutenticado} esAdmin={esAdmin}></Nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={onLogin}/>} />
          <Route path="/" element={<Home />} />

          <Route path="/profile" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin}><Profile /></ProtectedRoute>} />
          <Route path="/predictions" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin}><Predictions /></ProtectedRoute>} />


          <Route path="/admin/dashboard" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/team/create" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><TeamCreate /></ProtectedRoute>} />
          <Route path="/team/:id/edit" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><TeamEdit /></ProtectedRoute>} />
          <Route path="/driver/create" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><DriverCreate /></ProtectedRoute>} />
          <Route path="/driver/:id/edit" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><DriverEdit /></ProtectedRoute>} />
          <Route path="/circuit/create" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><CircuitCreate /></ProtectedRoute>} />
          <Route path="/circuit/:id/edit" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><CircuitEdit /></ProtectedRoute>} />
          <Route path="/race/create" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><RaceCreate action="create"/></ProtectedRoute>} />
          <Route path="/race/:id/edit/:year" element={<ProtectedRoute isAuthenticated={estaAutenticado} isAdmin={esAdmin} adminOnly><RaceEdit action="edit"/></ProtectedRoute>} />


          <Route path="/drivers" element={<Drivers />} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        <Footer></Footer>
      </NotificationsProvider>
    </>
  )
}

export default App
