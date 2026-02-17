import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import teamsServices from "../services/teams.services";
import { useLoader } from "../context/LoaderContext";
import API_URL from "../services/api";
import helmet from "../assets/icons/helmet_white.svg";

function Teams() {
    const [teams, setTeams] = useState([]);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadTeams() {
            showLoader();
            try {
                const data = await teamsServices.findAllTeams();
                setTeams(data);
            } catch (error) {
                console.error("Error al obtener las escuderías:", error);
            } finally {
                hideLoader();
            }
        }

        loadTeams();
    }, []);

    return (
        <main>
            <section className="teams-list-section page-section container text-center">
                <header className="page-header">
                    <p className="section-label">Donde la magia sucede</p>
                    <h1 className="section-title">ESCUDERÍAS</h1>
                    <p className="section-subtitle">
                        Donde se forman los campeones
                    </p>
                </header>

                <section className="teams-list">
                    {teams.map((team) => (
                        <article className="team-list-card" key={team._id}>
                            <div className="team-logo">
                                <img
                                    src={`${API_URL}/storage/${team.img}`}
                                    alt={team.name}
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Team"; }}
                                />
                            </div>

                            <div className="team-list-info">
                                <h2 className="team-name">{team.name}</h2>

                                {team.drivers && team.drivers.map((driver) => (
                                    <div className="team-driver" key={driver._id}>
                                        {/* Using a placeholder if helmet icon is missing */}
                                        <img src={helmet} alt="Helmet" className="helmet-icon" />{driver.name} <span className="bold">{driver.lastname?.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={`/teams/${team._id}`}
                                className="team-accent"
                                style={{ "--accent": team.color || "#fff" }}
                            >
                                <span className="chevron">❯❯</span>
                            </Link>
                        </article>
                    ))}
                </section>
            </section>
        </main>
    );
}

export default Teams;
