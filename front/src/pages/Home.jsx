import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UsersServices from "../services/users.services";
import { getFlagEmoji } from "../utils/helpers";
import API_URL from "../services/api";
import logoImg from '../assets/icons/logo_grandpick.svg';
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../utils/cloudinary.js";
import '../assets/styles/home.css';
import '../assets/styles/home.css';

const Home = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await UsersServices.getAllUsersStats();
                const sortedData = [...data].sort((a, b) => {
                    const pointsA = a.stats?.points?.total || 0;
                    const pointsB = b.stats?.points?.total || 0;
                    if (pointsB !== pointsA) return pointsB - pointsA;

                    const successesA = a.stats?.successes?.total || 0;
                    const successesB = b.stats?.successes?.total || 0;
                    if (successesB !== successesA) return successesB - successesA;

                    const avgA = a.stats?.predictions?.total > 0 ? pointsA / a.stats.predictions.total : 0;
                    const avgB = b.stats?.predictions?.total > 0 ? pointsB / b.stats.predictions.total : 0;
                    return avgB - avgA;
                }).map((item, index) => ({
                    ...item,
                    globalRank: index + 1
                }));

                setStats(sortedData.slice(0, 10));
            } catch (error) {
                console.error("Error al cargar el ranking en Home:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const top3 = stats.slice(0, 3);
    // Orden para el podio: [2do, 1er, 3er]
    const podiumOrder = [
        top3.find(u => u.globalRank === 2),
        top3.find(u => u.globalRank === 1),
        top3.find(u => u.globalRank === 3)
    ].filter(Boolean);

    return (
        <div className="home-container">

            <main>
                <section className="home-hero">
                    {/* Imagen de fondo */}
                    <picture className="hero-bg">
                        <source srcSet={getImageUrl("hero-desktop.png")} media="(min-width: 992px)" />
                        <source srcSet={getImageUrl("hero-tablet.png")} media="(min-width: 576px)" />
                        <img
                            src={getImageUrl("hero-mobile.png")}
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

                    <Link to="/predictions" className="cta-predictions">

                        {/* Flechas iniciales (2) */}
                        <span className="cta-arrows cta-arrows--start"></span>

                        {/* Texto */}
                        <span className="cta-content">
                            <span className="cta-timer">Predecí tus próximos resultados</span>
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

                            <Link to="/calendar" className="cta how-it-works__link">
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
                    <Link to="/drivers" className="info-card">
                        <img src={getImageUrl("pilotos.png", 800)} alt="Pilotos de F1" />

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

                    <Link to="/circuits" className="info-card">
                        <img src={getImageUrl("circuitos.png", 800)} alt="Circuitos de F1" />
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

                    <Link to="/teams" className="info-card">
                        <img src={getImageUrl("escuderias.webp", 800)} alt="Escuderías de F1" />
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
                        <h2 className="ranking__title">TOP 10 - PUNTUACIÓN GLOBAL</h2>

                        <div className="ranking__podium">
                            {!loading && podiumOrder.map((user) => (
                                <div key={user._id} className={`podium__item podium__item--pos${user.globalRank}`}>
                                    <div className="d-flex justify-content-center">
                                        <span className="emoji-flag podium__flag" style={{ display: 'block', fontSize: '1.6rem' }}>
                                            {getFlagEmoji(user.country)}
                                        </span>
                                    </div>

                                    <div className="podium__avatar">
                                        <img
                                            src={getImageUrl(user.img_user, 200)}
                                            alt={`${user.name} ${user.last_name}`}
                                        />
                                    </div>
                                    <p className="podium__name">
                                        {user.name} <strong>{user.last_name}</strong>
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="ranking__card">
                            <div className="table-responsive">
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
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={`skeleton-${i}`} className="ranking__skeleton-row">
                                                    <td className="ranking__posicion"><div className="skeleton skeleton-pos"></div></td>
                                                    <td>
                                                        <div className="skeleton skeleton-text skeleton-name"></div>
                                                    </td>
                                                    <td><div className="skeleton skeleton-flag"></div></td>
                                                    <td><div className="skeleton skeleton-text skeleton-stat"></div></td>
                                                    <td><div className="skeleton skeleton-text skeleton-stat"></div></td>
                                                    <td><div className="skeleton skeleton-text skeleton-points"></div></td>
                                                </tr>
                                            ))
                                        ) : (
                                            stats.map((item) => (
                                                <tr key={item._id}>
                                                    <td className="ranking__posicion">{item.globalRank}</td>
                                                    <td>
                                                        {item.name} <span className="ranking__apellido">{item.last_name}</span>
                                                    </td>
                                                    <td>
                                                        <span className="emoji-flag" style={{ fontSize: '1.2rem' }}>
                                                            {getFlagEmoji(item.country)}
                                                        </span>
                                                    </td>
                                                    <td>{item.stats?.successes?.total || 0}</td>
                                                    <td>{item.stats?.predictions?.total || 0}</td>
                                                    <td className="ranking__points">{item.stats?.points?.total || 0}</td>
                                                </tr>
                                            ))
                                        )}
                                        {!loading && stats.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center p-4">No hay datos disponibles</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                        <img src={getImageUrl("tutoriales.webp", 600)} alt="Tutoriales Grand Pick" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
