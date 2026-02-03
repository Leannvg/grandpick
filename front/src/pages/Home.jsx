import { Link } from 'react-router-dom';

function Home() {
  return (
      <div className='bg-secondary-dark'>
        <section className="position-relative hero-height overflow-hidden bg-primary-dark">
            
            <div className="position-absolute w-100 h-100" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}></div>

            <div className="container-fluid container-xl h-100 d-flex flex-column justify-content-center text-center text-md-start position-relative">
                <h1 className="display-4 fw-bolder text-light text-uppercase mt-5">
                    <span className="d-block">EL JUEGO DE PREDICCIÓN.</span>
                    <span className="d-block text-highlight mt-2">CONVERTÍ TU PASIÓN EN PUNTOS.</span>
                </h1>
                <div className="mt-3 fs-5 text-secondary">
                    <p>Predicí tus próximos resultados: 7D:6HS | 10MIN:32S</p>
                </div>
            </div>
        </section>

        <div className="diagonal-separator bg-primary-dark">
            <section className="container-fluid container-xl pt-5 pb-5 position-relative" style={{marginTop: '-5rem'}}>

                <h2 className="fs-4 fw-bold text-light text-uppercase mb-5 border-start border-highlight border-4 ps-3">¿CÓMO FUNCIONA?</h2>

                <p className="text-secondary mb-4 col-lg-6">
                    Participá antes de cada carrera, sumá puntos con tus predicciones y subí en el ranking.
                </p>
                <Link to="/about" className="text-highlight small fw-semibold text-decoration-none hover-underline">
                    Conocé más &gt;
                </Link>

                <div className="row mt-5 text-center g-4">
                    <div className="col-md-4">
                        <div className="p-4 bg-secondary-dark rounded shadow-lg">
                            <div className="mx-auto" style={{width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bs-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
                                <span className="fs-3">🎯</span>
                            </div>
                            <h3 className="fs-5 fw-semibold text-light">PREDECÍ</h3>

                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 bg-secondary-dark rounded shadow-lg">
                            <div className="mx-auto" style={{width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bs-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
                                <span className="fs-3">✅</span>
                            </div>
                            <h3 className="fs-5 fw-semibold text-light">ACERTÁ</h3>

                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 bg-secondary-dark rounded shadow-lg">
                            <div className="mx-auto" style={{width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bs-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
                                <span className="fs-3">🏆</span>
                            </div>
                            <h3 className="fs-5 fw-semibold text-light">GANÁ</h3>

                        </div>
                    </div>
                </div>
            </section>
        </div>

        <section className="container-fluid container-xl py-5">
            <div className="row g-4">

                <div className="col-lg-4">
                    <div className="position-relative overflow-hidden rounded-3 shadow" style={{height: '250px'}}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}></div>
                        <div className="position-absolute bottom-0 p-4">
                            <h3 className="fs-5 fw-bold text-light">PILOTOS</h3>
                            <p className="text-highlight fw-semibold mb-2">LOS VERDADEROS PROTAGONISTAS DE LA PISTA</p>
                            <Link to="/drivers" className="small text-light text-decoration-none hover-underline">
                                Más información &gt;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="position-relative overflow-hidden rounded-3 shadow" style={{height: '250px'}}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}></div>
                        <div className="position-absolute bottom-0 p-4">
                            <h3 className="fs-5 fw-bold text-light">CIRCUITOS</h3>
                            <p className="text-highlight fw-semibold mb-2">LOS TEMPLOS DE LA VELOCIDAD</p>
                            <Link to="/circuits" className="small text-light text-decoration-none hover-underline">
                                Más información &gt;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="position-relative overflow-hidden rounded-3 shadow" style={{height: '250px'}}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}></div>
                        <div className="position-absolute bottom-0 p-4">
                            <h3 className="fs-5 fw-bold text-light">ESCUDERIAS</h3>
                            <p className="text-highlight fw-semibold mb-2">QUIENES FORMAN A LOS CAMPEONES</p>
                            <Link to="/teams" className="small text-light text-decoration-none hover-underline">
                                Más información &gt;
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        <section className="bg-primary-dark py-5">
            <div className="container-fluid container-xl text-center">
                <h2 className="fs-3 fw-bolder text-light text-uppercase mb-5">PUNTUACIÓN GLOBAL</h2>

                <div className="row g-4 justify-content-center align-items-end">
                    <div className="col-12 col-sm-4 order-sm-1">
                        <div className="d-flex flex-column align-items-center">
                            <div className="rounded-circle border border-4 border-secondary bg-secondary-dark mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <span className="fs-4 text-secondary">🥈</span>
                            </div>
                            <p className="fs-6 fw-semibold text-light mb-0">JULIETA ARIAS</p>
                            <div className="mt-4 w-100 bg-secondary-dark rounded-top d-flex align-items-center justify-content-center" style={{height: '8rem', backgroundColor: 'rgba(108, 117, 125, 0.3)'}}>
                                <p className="fs-4 fw-bold mb-0 text-light">950 PTS</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 order-sm-2">
                        <div className="d-flex flex-column align-items-center">
                            <div className="rounded-circle border border-4 border-highlight bg-secondary-dark mb-3 border-danger" style={{width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <span className="fs-3 text-highlight">🥇</span>
                            </div>
                            <p className="fs-5 fw-bold text-light mb-0">LEANDRO VEDIA</p>
                            <div className="mt-4 w-100 rounded-top d-flex align-items-center justify-content-center" style={{height: '10rem', backgroundColor: 'rgba(239, 68, 68, 0.7)'}}>
                                <p className="fs-3 fw-bolder text-light mb-0">1120 PTS</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 order-sm-3">
                        <div className="d-flex flex-column align-items-center">
                            <div className="rounded-circle border border-4 border-warning bg-secondary-dark mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <span className="fs-4 text-warning">🥉</span>
                            </div>
                            <p className="fs-6 fw-semibold text-light mb-0">FRANCO COLAPINTO</p>
                            <div className="mt-4 w-100 rounded-top d-flex align-items-center justify-content-center" style={{height: '6rem', backgroundColor: 'rgba(255, 193, 7, 0.5)'}}>
                                <p className="fs-4 fw-bold mb-0 text-light">780 PTS</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 bg-secondary-dark p-4 rounded shadow-lg border border-secondary-dark">
                    <h3 className="fs-5 fw-semibold mb-4 text-start text-light">Ranking General (Simulación de Tabla)</h3>
                    <div className="table-responsive">
                        <table className="table table-dark table-striped text-start">
                            <thead>
                                <tr className="text-secondary small">
                                    <th scope="col" className="fw-bold">#</th>
                                    <th scope="col" className="fw-bold" colSpan="2">Usuario</th>
                                    <th scope="col" className="fw-bold">Carreras</th>
                                    <th scope="col" className="fw-bold">Puntos</th>
                                    <th scope="col" className="fw-bold">Acertadas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td colspan="2">Leandro Vedia</td>
                                    <td>12</td>
                                    <td>1120</td>
                                    <td>10</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td colspan="2">Julieta Arias</td>
                                    <td>12</td>
                                    <td>950</td>
                                    <td>8</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td colspan="2">Franco Colapinto</td>
                                    <td>11</td>
                                    <td>780</td>
                                    <td>7</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Link to="/ranking" className="mt-3 d-block text-highlight small text-decoration-none hover-underline text-start">
                        Ver Ranking Completo &gt;
                    </Link>
                </div>
            </div>
        </section>

        <section className="container-fluid container-xl py-5">
            <div className="row g-5 align-items-center">
                <div className="col-lg-6">
                    <h2 className="fs-4 fw-bold text-light text-uppercase mb-4 border-start border-highlight border-4 ps-3">¿SOS NUEVO?</h2>
                    <p className="text-secondary fs-6 mb-4 col-lg-10">
                        Todo lo que necesitas saber para empezar a predecir como un experto. 
                    </p>
                    <Link to="/news" className="btn btn-danger fw-bold py-2 px-4 rounded-3 shadow">
                        Conocé mas &gt;
                    </Link>
                </div>
                <div className="col-lg-6">
                    <div className="placeholder-image rounded-3 shadow-lg border border-secondary-dark" style={{height: '250px', backgroundColor: '#374151'}}>
                        
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}

export default Home;
