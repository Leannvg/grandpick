import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NotificationsBell from "./NotificationsBell.jsx";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../utils/cloudinary.js";

function Nav({ onLogout, autenticado, esAdmin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hoveredMenu, setHoveredMenu] = useState(null); 
  const [activeMenu, setActiveMenu] = useState(null); 
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); 
  
  // Ref to track if we are on mobile to skip some delays
  const isMobile = useRef(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 992;
    };
    window.addEventListener("resize", handleResize);
    
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("body-scroll-lock");
    } else {
      document.body.classList.remove("body-scroll-lock");
    }
    return () => document.body.classList.remove("body-scroll-lock");
  }, [isMenuOpen]);

  // Sequential animation logic
  useEffect(() => {
    if (hoveredMenu === activeMenu) {
        setIsAnimatingOut(false);
        return;
    }

    // On mobile, we want a tiny delay so the browser paints the component in the DOM
    // before applying the 'show-active' class, ensuring the animation triggers.
    if (isMobile.current && hoveredMenu && !activeMenu) {
        const timer = setTimeout(() => {
          setActiveMenu(hoveredMenu);
          setIsAnimatingOut(false);
        }, 30); 
        return () => clearTimeout(timer);
    }

    if (activeMenu && hoveredMenu) {
      // Switching menus: Hide current first
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setActiveMenu(hoveredMenu);
        setIsAnimatingOut(false);
      }, 400); // Safer unmount buffer
      return () => clearTimeout(timer);
    } else if (activeMenu && !hoveredMenu) {
      // Closing all
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setActiveMenu(null);
        setIsAnimatingOut(false);
      }, 400); 
      return () => clearTimeout(timer);
    } else {
      // Direct opening
      setActiveMenu(hoveredMenu);
      setIsAnimatingOut(false);
    }
  }, [hoveredMenu]);

  const handleMouseEnter = (menu) => {
    if (!isMobile.current) {
      setHoveredMenu(menu);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile.current) {
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

  const renderMegaMenu = (menu, type) => {
    const isActive = activeMenu === menu && !isAnimatingOut;
    
    // Safety check: only keep in DOM if this specific menu is active or hovered
    if (activeMenu !== menu && hoveredMenu !== menu) return null;

    const items = menu === 'info' ? [
      { to: "/teams", label: "ESCUDERÍAS" },
      { to: "/drivers", label: "PILOTOS" },
      { to: "/circuits", label: "CIRCUITOS" }
    ] : [
      { to: "/how-to-play", label: "CÓMO JUGAR" },
      { to: "/f1-guide", label: "GUÍA DE F1" },
      { to: "/f1-tv", label: "F1 TV" }
    ];

    return (
      <div 
        className={`gp-mega-menu ${isActive ? 'show-active' : ''} ${type === 'floating' ? 'is-floating' : 'is-push'}`}
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
              <img src={getImageUrl(CLOUDINARY_DEFAULTS.LOGO)} alt="GrandPick" height="32" />
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
                <li className={`nav-item gp-nav-dropdown ${hoveredMenu === 'info' ? 'is-active' : ''}`}
                    onMouseEnter={() => handleMouseEnter('info')}
                    onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="nav-link gp-dropdown-toggle"
                    type="button"
                    onClick={() => {
                      if (isMobile.current) {
                        setHoveredMenu(hoveredMenu === 'info' ? null : 'info');
                      }
                    }}
                  >
                    INFO
                  </button>
                  {isMobile.current && renderMegaMenu('info', 'push')}
                </li>

                {/* TUTORIALES */}
                <li className={`nav-item gp-nav-dropdown ${hoveredMenu === 'tutorials' ? 'is-active' : ''}`}
                    onMouseEnter={() => handleMouseEnter('tutorials')}
                    onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="nav-link gp-dropdown-toggle"
                    type="button"
                    onClick={() => {
                      if (isMobile.current) {
                        setHoveredMenu(hoveredMenu === 'tutorials' ? null : 'tutorials');
                      }
                    }}
                  >
                    TUTORIALES
                  </button>
                  {isMobile.current && renderMegaMenu('tutorials', 'push')}
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
        
        {/* Absolute/Push container for desktop */}
        {!isMobile.current && (
          <div 
            className={`mega-menu-push-container d-none d-lg-block ${activeMenu ? 'is-active' : ''} ${!isAtTop ? 'is-floating-bar' : ''}`}
            onMouseEnter={() => {
                if (activeMenu) setHoveredMenu(activeMenu);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {renderMegaMenu('info', 'push')}
            {renderMegaMenu('tutorials', 'push')}
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
