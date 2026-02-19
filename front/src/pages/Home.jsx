import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/icons/logo_grandpick.svg';
import tutorialesImg from '../assets/images/tutoriales.png';
// Asumiendo que styles/home.css se importa globalmente o aquí si es necesario, 
// pero en React suele importarse en App.js o index.css. 
// Si Home.html tenía <link> específicos, deberíamos ver donde ponerlos.
// El archivo original tenía: <link rel="stylesheet" href="styles/home.css">
// Voy a importar el CSS aquí para asegurar que se carguen los estilos.
import '../assets/styles/home.css';

const Home = () => {
    return (
        <>
            <header className="site-header">
                <nav className="navbar navbar-expand-lg navbar-dark">
                    {/* LOGO */}
                    <Link className="navbar-brand me-auto nav-logo" to="/">
                        <img src={logoImg} alt="GrandPick" height="32" />
                    </Link>

                    <div className="d-flex align-items-center ms-auto d-lg-none nav-mobile">
                        {/* TOGGLE */}
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>

                    {/* NAV */}
                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav ms-auto align-items-lg-center">

                            <li className="nav-item">
                                <Link className="nav-link" to="/calendar">CALENDARIO</Link>
                            </li>

                            {/* INFO */}
                            <li className="nav-item dropdown dropdown-mega">
                                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                    INFO
                                </a>

                                <div className="dropdown-menu mega-menu">
                                    <div className="container">
                                        <ul className="row justify-content-center text-center list-unstyled m-0">
                                            <li className="col-12 col-md-4"><Link to="/info/escuderias" className="mega-link">ESCUDERÍAS</Link></li>
                                            <li className="col-12 col-md-4"><Link to="/info/pilotos" className="mega-link">PILOTOS</Link></li>
                                            <li className="col-12 col-md-4"><Link to="/info/circuitos" className="mega-link">CIRCUITOS</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>

                            {/* TUTORIALES */}
                            <li className="nav-item dropdown dropdown-mega">
                                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                    TUTORIALES
                                </a>

                                <div className="dropdown-menu mega-menu">
                                    <div className="container">
                                        <ul className="row justify-content-center text-center list-unstyled m-0">
                                            <li className="col-12 col-md-4"><Link to="/como-jugar" className="mega-link">CÓMO JUGAR</Link></li>
                                            <li className="col-12 col-md-4"><Link to="/guia-f1" className="mega-link">GUÍA DE F1</Link></li>
                                            <li className="col-12 col-md-4"><Link to="/f1-tv" className="mega-link">F1 TV</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/register">REGISTRARSE</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link login" to="/login">INICIAR SESIÓN</Link>
                            </li>

                        </ul>
                    </div>
                </nav>
            </header>

            <main>
                <section className="nr-cta">
                    <div className="nr-cta__container">

                        {/* INFO */}
                        <div className="nr-cta__info">

                            <div className="nr-cta__country">
                                <img src="/img/australia.svg" alt="Australia" />
                                <span className="nr-cta__country-name">AUSTRALIA</span>
                            </div>

                            <div className="nr-cta__meta">
                                <span className="nr-cta__round">RONDA 11</span>
                                <span className="nr-cta__date">27–29 JUN</span>

                                <Link to="/predict" className="nr-cta__action">
                                    Predecí tus resultados <span aria-hidden="true">›››</span>
                                </Link>
                            </div>

                        </div>

                        {/* COUNTDOWN */}
                        <div className="nr-cta__countdown">

                            <div className="nr-cta__time">
                                <span className="nr-cta__time-value">01</span>
                                <span className="nr-cta__time-label">DÍAS</span>
                            </div>

                            <div className="nr-cta__time">
                                <span className="nr-cta__time-value">09</span>
                                <span className="nr-cta__time-label">HS</span>
                            </div>

                            <div className="nr-cta__time">
                                <span className="nr-cta__time-value">34</span>
                                <span className="nr-cta__time-label">MIN</span>
                            </div>

                            <div className="nr-cta__time">
                                <span className="nr-cta__time-value">50</span>
                                <span className="nr-cta__time-label">SEG</span>
                            </div>

                        </div>

                    </div>
                </section>

                <section className="home-hero">
                    {/* Imagen de fondo */}
                    <picture className="hero-bg">
                        <source srcSet="/img/home/hero-desktop.png" media="(min-width: 992px)" />
                        <source srcSet="/img/home/hero-tablet.png" media="(min-width: 576px)" />
                        <img
                            src="/img/home/hero-mobile.png"
                            alt="Circuito de Fórmula 1"
                            loading="eager"
                        />
                    </picture>

                    {/* Overlay */}
                    <div className="hero-overlay"></div>

                    {/* Contenido */}
                    <div className="home-hero__content">

                        <h2 className="home-hero__eyebrow">UN JUEGO DE PREDICCIÓN PARA LA F1</h2>

                        <h3 className="home-hero__title">CONVERTÍ TU PASIÓN EN PUNTOS.</h3>
                    </div>

                    <Link to="/predicciones" className="cta-predictions">

                        {/* Flechas iniciales (2) */}
                        <span className="cta-arrows cta-arrows--start"></span>

                        {/* Texto */}
                        <span className="cta-content">
                            <span className="cta-title">Predecí tus próximos resultados</span>
                            <span className="cta-timer">7D:6HS:10MIN:32S</span>
                        </span>

                        {/* Flechas finales (auto fill) */}
                        <span className="cta-arrows cta-arrows--end"></span>

                    </Link>
                </section>

                <section className="how-it-works">
                    {/* BLOQUE AZUL */}
                    <div className="how-it-works__text-wrapper">
                        <div className="how-it-works__text">
                            <h2>¿CÓMO FUNCIONA?</h2>
                            <p>
                                Participá antes de cada carrera, sumá puntos con tus
                                predicciones y subí en el ranking.
                            </p>

                            <Link to="/como-funciona" className="cta how-it-works__link">
                                Conocé más
                                <span className="cta__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* BLOQUE BLANCO */}
                    <div className="how-it-works__steps-wrapper">
                        <div className="how-it-works__steps">

                            <div className="step">
                                <div className="step__icon">
                                    <svg width="49"
                                        height="61"
                                        viewBox="0 0 49 61"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.747 2.20427C23.1199 2.20427 26.2998 3.05681 29.076 4.5561C28.8536 5.86431 28.4207 6.79034 27.8297 7.38712C27.463 7.74506 27.0282 8.02502 26.5514 8.21026C24.7258 7.34858 22.7493 6.85667 20.7346 6.76263C18.7198 6.66859 16.7064 6.97426 14.8093 7.66218C12.9121 8.3501 11.1683 9.4068 9.67754 10.772C8.18675 12.1371 6.97813 13.784 6.12067 15.6185C5.26322 17.4531 4.77373 19.4394 4.68015 21.464C4.58658 23.4887 4.89074 25.512 5.57529 27.4186C6.25983 29.3251 7.31135 31.0774 8.6698 32.5756C10.0282 34.0737 11.667 35.2883 13.4926 36.15C15.5072 36.9359 17.3657 37.3739 19.0683 37.4641L19.747 37.4817C21.6348 37.4817 23.7186 37.0388 25.9985 36.1529C28.6649 34.9496 30.9385 33.0133 32.5571 30.5673C34.4294 31.2141 36.679 30.8202 38.0978 29.3885C36.8904 32.4297 34.9539 35.124 32.4606 37.2318L37.2026 51.5339C37.5801 52.6721 37.55 53.9071 37.1173 55.0253C36.6846 56.1435 35.8766 57.0746 34.8331 57.6575C30.8224 59.9005 25.7849 61 19.747 61C13.7091 61 8.67158 59.9005 4.66092 57.6575C3.6174 57.0746 2.80941 56.1435 2.37672 55.0253C1.94402 53.9071 1.91384 52.6721 2.29138 51.5339L7.03338 37.2318C3.93429 34.6115 1.71196 31.0968 0.667674 27.1643C-0.376614 23.2318 -0.192346 19.0718 1.1955 15.2481C2.58334 11.4244 5.10763 8.12208 8.42614 5.78879C11.7447 3.45549 15.6969 2.2041 19.747 2.20427ZM28.6898 39.8071L27.6367 40.2451L27.584 40.2686C25.4058 41.216 23.0745 41.7578 20.7036 41.8679H20.6539L20.4403 41.8796L19.747 41.8914L19.1736 41.8796L18.7933 41.8649C16.4216 41.7562 14.0893 41.2153 11.91 40.2686L11.8573 40.2451C11.5037 40.1054 11.1526 39.9593 10.8042 39.8071L6.45416 52.9303C6.40049 53.0924 6.40472 53.2683 6.46612 53.4276C6.52751 53.587 6.64225 53.7199 6.79058 53.8034C10.0962 55.6467 14.4053 56.5903 19.747 56.5903C25.0887 56.5903 29.4007 55.6496 32.7034 53.8034C32.8517 53.7199 32.9665 53.587 33.0279 53.4276C33.0893 53.2683 33.0935 53.0924 33.0398 52.9303L28.6898 39.8071ZM18.8401 41.8708L19.1736 41.8796L19.2702 41.8855L19.747 41.8914C19.4428 41.8914 19.1405 41.8845 18.8401 41.8708ZM37.2757 1.8515L37.2991 2.20427C37.2991 5.58503 38.089 7.96625 39.5809 9.46554C40.9588 10.8472 43.0855 11.6322 46.046 11.7439L46.8065 11.7586C49.609 11.7586 49.7261 15.8096 47.1576 16.1447L46.8065 16.1683C43.4424 16.1683 41.0728 16.962 39.5809 18.4613C38.206 19.8489 37.4249 21.9832 37.3138 24.9582L37.2991 25.7226C37.2991 28.6624 32.9111 28.6624 32.9111 25.7226C32.9111 22.3418 32.1212 19.9606 30.6293 18.4613C29.2485 17.0796 27.1247 16.2947 24.1643 16.183L23.4037 16.1683C20.6012 16.1683 20.4842 12.1172 23.0526 11.7821L23.4037 11.7586C26.7678 11.7586 29.1374 10.9648 30.6293 9.46554C32.1212 7.96625 32.9111 5.58503 32.9111 2.20427C32.9111 -0.612042 36.9422 -0.729634 37.2757 1.8515ZM35.1051 10.8855L34.6839 11.4822C33.9514 12.4564 33.0567 13.2959 32.0393 13.9634C33.2625 14.7647 34.3066 15.8129 35.1051 17.0414C35.9028 15.8132 36.9458 14.765 38.168 13.9634C37.1517 13.2956 36.258 12.4562 35.5264 11.4822L35.1051 10.8855Z" fill="white" />
                                    </svg>
                                </div>
                                <span>PREDICÍ</span>
                            </div>

                            <div className="step">
                                <div className="step__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span>ACERTÁ</span>
                            </div>

                            <div className="step">
                                <div className="step__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                                    </svg>
                                </div>
                                <span>GANÁ</span>
                            </div>

                        </div>
                    </div>

                </section>

                <section className="info-cards">
                    <Link to="/info/pilotos" className="info-card">
                        <img src="/img/home/pilotos.png" alt="Pilotos de F1" />

                        <div className="info-card__overlay"></div>

                        <div className="info-card__content">
                            <h2 className="info-card__title">PILOTOS</h2>
                            <h3 className="info-card__subtitle">
                                LOS VERDADEROS PROTAGONISTAS DE LA PISTA
                            </h3>

                            <span className="cta">
                                <span className="info-card__text">Más información</span>

                                <span className="cta__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </span>
                            </span>
                        </div>
                    </Link>

                    <Link to="/info/circuitos" className="info-card">
                        <img src="/img/home/circuitos.png" alt="Circuitos de F1" />
                        <div className="info-card__overlay"></div>

                        <div className="info-card__content">
                            <h2 className="info-card__title">CIRCUITOS</h2>
                            <h3 className="info-card__subtitle">
                                LOS TEMPLOS DE LA VELOCIDAD
                            </h3>

                            <span className="cta">
                                <span className="info-card__text">Más información</span>

                                <span className="cta__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </span>
                            </span>
                        </div>
                    </Link>

                    <Link to="/info/escuderias" className="info-card">
                        <img src="/img/home/escuderias.png" alt="Escuderías de F1" />
                        <div className="info-card__overlay"></div>

                        <div className="info-card__content">
                            <h2 className="info-card__title">ESCUDERÍAS</h2>
                            <h3 className="info-card__subtitle">
                                QUIENES FORMAN A LOS CAMPEONES
                            </h3>

                            <span className="cta">
                                <span className="info-card__text">Más información</span>

                                <span className="cta__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </span>
                            </span>
                        </div>
                    </Link>

                </section>

                <section className="ranking">
                    <div className="ranking__container">
                        <h2 className="ranking__title">RANKING GLOBAL</h2>

                        <div className="ranking__podium">

                            <div className="podium__item podium__item--pos2">
                                <img className="podium__flag" src="/img/australia.svg" alt="pais" />
                                <div className="podium__avatar">
                                    <img src="/img/gasly.png" alt="Nombre del usuario" />
                                </div>
                                <p className="podium__name">Pierre <strong>Gasly</strong></p>
                            </div>

                            <div className="podium__item podium__item--pos1">
                                <img className="podium__flag" src="/img/japan.png" alt="pais" />
                                <div className="podium__avatar">
                                    <img src="/img/hamilton.png" alt="Nombre del usuario" />
                                </div>
                                <p className="podium__name">Lewis <strong>Hamilton</strong></p>
                            </div>

                            <div className="podium__item podium__item--pos3">
                                <img className="podium__flag" src="/img/belgica.png" alt="pais" />
                                <div className="podium__avatar">
                                    <img src="/img/leclerc.png" alt="Nombre del usuario" />
                                </div>
                                <p className="podium__name">Charles <strong>Leclrec</strong></p>
                            </div>

                        </div>

                        <div className="ranking__card">
                            <table className="ranking__table">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Nombre</th>
                                        <th>País</th>
                                        <th>Aciertos</th>
                                        <th>Predicciones</th>
                                        <th>Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="ranking__posicion">1</td>
                                        <td>Leandro <span className="ranking__apellido">Vedia</span></td>
                                        <td><img src="/img/belgica.png" className="race-flag" /></td>
                                        <td>10</td>
                                        <td>3</td>
                                        <td className="ranking__points">23</td>
                                    </tr>
                                    <tr>
                                        <td className="ranking__posicion">2</td>
                                        <td>Julieta <span className="ranking__apellido">Arias</span></td>
                                        <td><img src="/img/japan.png" className="race-flag" /></td>
                                        <td>5</td>
                                        <td>2</td>
                                        <td className="ranking__points">19</td>
                                    </tr>
                                    <tr>
                                        <td className="ranking__posicion">3</td>
                                        <td>Franco <span className="ranking__apellido">Vedia</span></td>
                                        <td><img src="/img/belgica.png" className="race-flag" /></td>
                                        <td>3</td>
                                        <td>4</td>
                                        <td className="ranking__points">14</td>
                                    </tr>
                                    <tr>
                                        <td className="ranking__posicion">4</td>
                                        <td>Juan<span className="ranking__apellido">Perez</span></td>
                                        <td><img src="/img/belgica.png" /></td>
                                        <td>1</td>
                                        <td>3</td>
                                        <td className="ranking__points">9</td>
                                    </tr>
                                    <tr>
                                        <td className="ranking__posicion">5</td>
                                        <td>Maria <span className="ranking__apellido">Gonzalez</span></td>
                                        <td><img src="/img/japan.png" /></td>
                                        <td>1</td>
                                        <td>2</td>
                                        <td className="ranking__points">8</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <Link to="/ranking" className="cta">
                            Ver todas las posiciones
                            <span className="cta__icon">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </section>

                <section className="split-section split-section--light">
                    <div className="split-section__content">
                        <h2 className="split-section__title">¿SOS NUEVO?</h2>
                        <p className="split-section__text">
                            Todo lo que necesitás saber para empezar a predecir como un experto.
                        </p>

                        <Link to="/como-funciona" className="cta cta--dark">
                            Conocé más
                            <span className="cta__icon">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </span>
                        </Link>
                    </div>

                    <div className="split-section__image">
                        <img src={tutorialesImg} alt="Tutoriales Grand Pick" />
                    </div>
                </section>
            </main>
        </>
    );
}

export default Home;
