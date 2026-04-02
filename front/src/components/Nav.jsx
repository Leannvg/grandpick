import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationsBell from "./NotificationsBell.jsx";
import logo from "../assets/icons/logo_grandpick.svg";

function Nav({ onLogout, autenticado, esAdmin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("body-scroll-lock");
    } else {
      document.body.classList.remove("body-scroll-lock");
    }
    return () => document.body.classList.remove("body-scroll-lock");
  }, [isMenuOpen]);

  const handleMouseEnter = (menu) => {
    if (window.innerWidth >= 992) {
      setHoveredMenu(menu);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 992) {
      setHoveredMenu(null);
    }
  };

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
      window.dispatchEvent(new CustomEvent('close-all-drawers'));
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

  const renderMegaMenu = (menu) => {
    const items = menu === 'info' ? [
      { to: "/teams", label: "ESCUDERÍAS" },
      { to: "/drivers", label: "PILOTOS" },
      { to: "/circuits", label: "CIRCUITOS" }
    ] : [
      { to: "#", label: "CÓMO JUGAR" },
      { to: "#", label: "GUÍA DE F1" },
      { to: "#", label: "F1 TV" }
    ];

    return (
      <div 
        className={`dropdown-menu mega-menu show-hover ${!isAtTop ? 'is-floating' : 'is-push'}`}
        onMouseEnter={() => handleMouseEnter(menu)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="container">
          <ul className="row justify-content-center text-center list-unstyled m-0">
            {items.map((item, idx) => (
              <li key={idx} className="col-12 col-md-4">
                <Link to={item.to} className="mega-link" onClick={closeMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className={`site-header ${isAtTop ? 'at-top' : ''} ${hoveredMenu ? 'has-hovered-menu' : ''}`}>
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
                <li 
                  className="nav-item dropdown dropdown-mega"
                  onMouseEnter={() => handleMouseEnter('info')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="nav-link dropdown-toggle"
                    type="button"
                    onClick={() => window.innerWidth < 992 && setHoveredMenu(hoveredMenu === 'info' ? null : 'info')}
                  >
                    INFO
                  </button>
                  {/* Floating menu when NOT at top or on mobile */}
                  {(!isAtTop || window.innerWidth < 992) && hoveredMenu === 'info' && renderMegaMenu('info')}
                </li>

                {/* TUTORIALES */}
                <li 
                  className="nav-item dropdown dropdown-mega"
                  onMouseEnter={() => handleMouseEnter('tutorials')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="nav-link dropdown-toggle"
                    type="button"
                    onClick={() => window.innerWidth < 992 && setHoveredMenu(hoveredMenu === 'tutorials' ? null : 'tutorials')}
                  >
                    TUTORIALES
                  </button>
                   {/* Floating menu when NOT at top or on mobile */}
                   {(!isAtTop || window.innerWidth < 992) && hoveredMenu === 'tutorials' && renderMegaMenu('tutorials')}
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
        
        {/* Push menu when at top */}
        {isAtTop && hoveredMenu && (
          <div className="mega-menu-push-container d-none d-lg-block">
            {renderMegaMenu(hoveredMenu)}
          </div>
        )}
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
