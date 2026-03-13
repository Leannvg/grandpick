import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/icons/logo_grandpick.svg";

function Nav({ onLogout, autenticado, esAdmin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("body-scroll-lock");
    } else {
      document.body.classList.remove("body-scroll-lock");
    }
    return () => document.body.classList.remove("body-scroll-lock");
  }, [isMenuOpen]);

  const closeNotifications = () => {
    const dropdown = document.querySelector(".notifications-dropdown");
    if (dropdown && dropdown.classList.contains("show")) {
      const btn = document.querySelector("[data-bs-toggle='dropdown']");
      if (btn && window.bootstrap && window.bootstrap.Dropdown) {
        const bsDropdown = window.bootstrap.Dropdown.getOrCreateInstance(btn);
        bsDropdown.hide();
      } else if (dropdown) {
        dropdown.classList.remove("show");
      }
    }
  };

  const closeMenu = () => {
    const navBar = document.getElementById("mainNav");
    if (navBar && navBar.classList.contains("show")) {
      if (window.bootstrap && window.bootstrap.Collapse) {
        const bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(navBar);
        bsCollapse.hide();
      } else {
        navBar.classList.remove("show");
      }
    }
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    closeNotifications();
    const navBar = document.getElementById("mainNav");
    const isOpening = !navBar.classList.contains("show");

    if (isOpening) {
      // Cierra cualquier solapa abierta antes de abrir el menú
      window.dispatchEvent(new CustomEvent('close-all-drawers'));
      
      // Pequeño delay para que se sienta la transición si es necesario
      setTimeout(() => {
        if (window.bootstrap && window.bootstrap.Collapse) {
          const bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(navBar);
          bsCollapse.show();
          setIsMenuOpen(true);
        } else {
          navBar.classList.add("show");
          setIsMenuOpen(true);
        }
      }, 50);
    } else {
      closeMenu();
    }
  };


  const handleLogout = () => {
    onLogout();
    closeMenu();
  };

  return (
    <>
      <header className="site-header">
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          {/* LOGO */}
          <Link className="navbar-brand me-auto nav-logo" to="/" onClick={closeMenu}>
            <img src={logo} alt="GrandPick" height="32" />
          </Link>

          <div className="d-flex align-items-center ms-auto d-lg-none nav-mobile">
            {/* 🔔 NOTIFICACIONES MOBILE */}
            {autenticado && (
              <div className="nav-notifications d-lg-none me-2 dropdown">
                <NotificationsBell onToggle={closeMenu} />
              </div>
            )}

            {/* TOGGLE */}
            <button
              className="navbar-toggler"
              type="button"
              onClick={handleMenuToggle}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* NAV */}
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={closeMenu}>
                  HOME
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/calendar" onClick={closeMenu}>
                  CALENDARIO
                </Link>
              </li>

              {autenticado && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/predictions" onClick={closeMenu}>
                      MIS PREDICCIONES
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/prediction-history" onClick={closeMenu}>
                      HISTORIAL
                    </Link>
                  </li>
                </>
              )}

              <li className="nav-item">
                <Link className="nav-link" to="/ranking" onClick={closeMenu}>
                  RANKING
                </Link>
              </li>

              {/* INFO */}
              <li className="nav-item dropdown dropdown-mega">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                >
                  INFO
                </a>
                <div className="dropdown-menu mega-menu">
                  <div className="container">
                    <ul className="row justify-content-center text-center list-unstyled m-0">
                      <li className="col-12 col-md-4">
                        <Link to="/teams" className="mega-link" onClick={closeMenu}>
                          ESCUDERÍAS
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="/drivers" className="mega-link" onClick={closeMenu}>
                          PILOTOS
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="/circuits" className="mega-link" onClick={closeMenu}>
                          CIRCUITOS
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              {/* TUTORIALES */}
              <li className="nav-item dropdown dropdown-mega">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                >
                  TUTORIALES
                </a>
                <div className="dropdown-menu mega-menu">
                  <div className="container">
                    <ul className="row justify-content-center text-center list-unstyled m-0">
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link" onClick={closeMenu}>
                          CÓMO JUGAR
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link" onClick={closeMenu}>
                          GUÍA DE F1
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link" onClick={closeMenu}>
                          F1 TV
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              {/* 🔔 NOTIFICACIONES DESKTOP */}
              {autenticado && (
                <li className="nav-item dropdown nav-notifications d-none d-lg-block">
                  <NotificationsBell onToggle={closeMenu} />
                </li>
              )}

              {esAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard" onClick={closeMenu}>
                    PANEL CONTROL
                  </Link>
                </li>
              )}

              {autenticado ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" onClick={closeMenu}>
                      MI PERFIL
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link logout"
                      onClick={handleLogout}
                    >
                      CERRAR SESIÓN
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register" onClick={closeMenu}>
                      REGISTRARSE
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link login" to="/login" onClick={closeMenu}>
                      INICIAR SESIÓN
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
    {/* Overlay para cerrar el menú al hacer clic fuera */}
    {isMenuOpen && (
      <div 
        className="menu-overlay d-lg-none" 
        onClick={closeMenu}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1020 // Below header (2030)
        }}
      ></div>
    )}
    </>
  );
}

export default Nav;
