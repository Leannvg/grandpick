import { Link } from "react-router-dom";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/logo-grandpick_2.svg";

function Nav({ onLogout, autenticado, esAdmin }) {
  return (
    <header class="site-header">
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          {/* LOGO */}
          <Link className="navbar-brand me-auto nav-logo" to="/">
            <img src={logo} alt="GrandPick" height="32" />
          </Link>

          <div className="d-flex align-items-center ms-auto d-lg-none nav-mobile">
            {/* 🔔 NOTIFICACIONES MOBILE */}
            {autenticado && (
              <div className="nav-notifications d-lg-none me-2 dropdown">
                <NotificationsBell />
              </div>
            )}

            {/* TOGGLE */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* NAV */}
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  HOME
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/calendar">
                  CALENDARIO
                </Link>
              </li>

              {autenticado && (
                <li className="nav-item">
                  <Link className="nav-link" to="/predictions">
                    MIS PREDICCIONES
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link className="nav-link" to="#">
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
                        <Link to="#" className="mega-link">
                          ESCUDERÍAS
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="/drivers" className="mega-link">
                          PILOTOS
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link">
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
                        <Link to="#" className="mega-link">
                          CÓMO JUGAR
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link">
                          GUÍA DE F1
                        </Link>
                      </li>
                      <li className="col-12 col-md-4">
                        <Link to="#" className="mega-link">
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
                  <NotificationsBell />
                </li>
              )}

              {esAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    PANEL CONTROL
                  </Link>
                </li>
              )}

              {autenticado ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile">
                      MI PERFIL
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link logout"
                      onClick={onLogout}
                    >
                      CERRAR SESIÓN
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
                      REGISTRARSE
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link login" to="/login">
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
