import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import teamsServices from "../services/teams.services";
import DriverCardMobile from "../components/drivers/DriverCardMobile";
import { useLoader } from "../context/LoaderContext";
import API_URL from "../services/api";

function TeamDetail() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadTeamData() {
            showLoader();
            try {
                const data = await teamsServices.findTeamById(id);
                setTeam(data);
            } catch (error) {
                console.error("Error al obtener el detalle del equipo:", error);
            } finally {
                hideLoader();
            }
        }

        loadTeamData();
    }, [id]);

    if (!team) return null;

    return (
        <main>
            <section className="teams-section text-center page-section container">
                <header className="page-header">
                    <p className="section-label">Escudería</p>
                    <h1 className="section-title">{team.name.toUpperCase()}</h1>
                    <p className="section-subtitle">
                        {team.full_name || `${team.name} Formula One Team`}
                    </p>
                </header>

                <section className="team-info-card">
                    <div className="team-logo-box" style={{ border: `4px solid ${team.color || '#fff'}` }}>
                        <img
                            src={`${API_URL}/storage/${team.img}`}
                            alt={team.name}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=Logo"; }}
                        />
                    </div>

                    <div className="team-info-group">
                        <div className="team-info-item">
                            <span className="team-info-label">Base</span>
                            <span className="team-info-value">{team.base || "N/A"}</span>
                        </div>
                        <div className="team-info-item">
                            <span className="team-info-label">Jefe de equipo</span>
                            <span className="team-info-value">{team.team_chief || "N/A"}</span>
                        </div>
                        <div className="team-info-item">
                            <span className="team-info-label">Motor</span>
                            <span className="team-info-value">{team.power_unit || "N/A"}</span>
                        </div>
                        <div className="team-info-item">
                            <span className="team-info-label">GP ganados</span>
                            <span className="team-info-value">{team.won_gps || "0"}</span>
                        </div>
                    </div>
                </section>

                <section className="team-drivers">
                    <h2 className="team-drivers-title">PILOTOS</h2>
                    <div className="team-drivers-article">
                        {team.drivers && team.drivers.map((driver) => (
                            <DriverCardMobile
                                key={driver._id}
                                driver={driver}
                                teamLogo={team.img_iso || team.img}
                            />
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}

export default TeamDetail;
