import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as authServices from "../services/auth.services"
import NotificationsBell from "./NotificationsBell.jsx";

function Nav({onLogout, autenticado, esAdmin} ) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand">
            GrandPick
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/drivers" className="nav-link">
                  Pilotos
                </Link>
              </li>
              {autenticado && 
              <li className="nav-item">
                <Link to="/predictions" className="nav-link">
                  Predicciones
                </Link>
              </li>
              } 
              {!autenticado && 
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Registrarse
                </Link>
              </li>
              } 
              {esAdmin &&
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-link">
                  Panel de control
                </Link>
              </li>
               }
              {!autenticado && 
                <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Iniciar Sesión
                </Link>
                </li>              
              }
              {autenticado && (
                <li className="nav-item d-flex align-items-center me-2">
                  <NotificationsBell />
                </li>
              )}
              {(autenticado) && 
                <li className="nav-item">
                <Link to="/profile" className="nav-link">
                  Mi Perfil
                </Link>
                </li>              
              }
              {autenticado && 
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link"
                    onClick={onLogout}
                  >
                    Cerrar Sesión
                  </button>
                </li>

              }

            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
