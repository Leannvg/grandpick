import { Link } from "react-router-dom";
import "../assets/styles/notfound.css";

const NotFound = () => {
    return (
        <main className="notfound-container">
            <div className="notfound-content">

                
                <h1 className="notfound-code">404</h1>
                <h2 className="notfound-title">¡Fuera de pista!</h2>
                
                <p className="notfound-text">
                    Parece que tomaste una curva demasiado abierta. <br />
                    La página que buscas no está en la grilla de partida.
                </p>
                
                <Link to="/" className="notfound-btn">
                    VOLVER A BOXES <span className="chevron">❯❯</span>
                </Link>
            </div>
        </main>
    );
};

export default NotFound;
