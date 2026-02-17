import { Link } from "react-router-dom";
import logo from "../assets/icons/logo_grandpick.svg";
import instagram from "../assets/icons/instagram.png";
import xIcon from "../assets/icons/x.png";
import "../assets/styles/footer.css";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <h5>INFO</h5>
                        <ul className="footer-nav">
                            <li><Link to="/drivers">Pilotos</Link></li>
                            <li><Link to="/circuits">Circuitos</Link></li>
                            <li><Link to="/teams">Escuderías</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h5>TUTORIALES</h5>
                        <ul className="footer-nav">
                            <li><Link to="#">Cómo jugar</Link></li>
                            <li><Link to="#">Guía para principiantes</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h5>PREDICCIONES</h5>
                    </div>

                    <div className="footer-column">
                        <h5>CALENDARIO</h5>
                    </div>

                    <div className="footer-column footer-logo-col">
                        <Link to="/">
                            <img src={logo} alt="GrandPick" className="footer-logo" />
                        </Link>
                        <div className="footer-socials">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <img src={xIcon} alt="X" className="social-icon" />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <img src={instagram} alt="Instagram" className="social-icon" />
                            </a>
                        </div>
                    </div>
                </div>

                <hr className="footer-divider" />

                <p className="footer-copyright">
                    © 2025 Grand Pick Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
}

export default Footer;
