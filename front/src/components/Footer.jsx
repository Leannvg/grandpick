import { Link } from "react-router-dom";
import logo from "../assets/icons/logo_grandpick.svg";
import instagram from "../assets/icons/instagram.png";
import xIcon from "../assets/icons/x.png";
import "../assets/styles/footer.css";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <h2>F1 ACTUAL</h2>
                        <ul className="footer-nav">
                            <li><Link to="/drivers">Pilotos</Link></li>
                            <li><Link to="/circuits">Circuitos</Link></li>
                            <li><Link to="/teams">Escuderías</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h2>TUTORIALES</h2>
                        <ul className="footer-nav">
                            <li><Link to="/how-to-play">Cómo jugar</Link></li>
                            <li><Link to="/f1-guide">Guía de F1</Link></li>
                            <li><Link to="/f1-tv">F1 TV</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h2>PREDECIR</h2>
                        <ul className="footer-nav">
                            <li><Link to="/predictions">Jugar</Link></li>
                            <li><Link to="/ranking">Ranking Global</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h2>CALENDARIO</h2>
                        <ul className="footer-nav">
                            <li><Link to="/calendar">Ver fechas</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column footer-logo-col">
                        <Link to="/">
                            <img src={logo} alt="GRANDPICK" className="footer-logo" />
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
                    © {new Date().getFullYear()} GRANDPICK Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
}

export default Footer;
