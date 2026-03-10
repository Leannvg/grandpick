import { Link } from "react-router-dom";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/icons/logo_grandpick.svg";

function Nav({ onLogout, autenticado, esAdmin }) {
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
  };

  const handleMenuToggle = () => {
    closeNotifications();
    // Bootstrap handle the rest via data-bs-toggle, but we can ensure it here if needed.
    // However, data-bs-toggle="collapse" is already on the button.
    // If we want manual control, we'd remove data-bs-toggle and use the API.
  };


  const handleLogout = () => {
    onLogout();
    closeMenu();
  };

  return (
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
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
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
  );
}

export default Nav;
