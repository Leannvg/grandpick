import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services";
import TeamsServices from "../services/teams.services";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

function Drivers() {
  const [teamsWithDrivers, setTeamsWithDrivers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    Promise.all([
      TeamsServices.findAllTeams(),
      DriversServices.findAll()
    ]).then(([teamsData, driversData]) => {
      // Group drivers by team_id
      const grouped = teamsData.map(team => {
        const teamId = team._id.$oid || team._id;
        return {
          ...team,
          drivers: driversData.filter(d => d.team_id === teamId)
        };
      }).filter(team => team.drivers.length > 0); // Only teams with drivers

      setTeamsWithDrivers(grouped);
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <section className="drivers-section text-center page-section container">
        <header className="page-header">
          <p className="section-label">Temporada actual</p>
          <h1 className="section-title">PILOTOS</h1>
          <p className="section-subtitle">Los verdaderos protagonistas de la pista</p>
        </header>

        <div className="teams-drivers-container">
          {teamsWithDrivers.map((team) => (
            <div key={team._id.$oid || team._id} className="team-group mb-5 p-4" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: `1px solid rgba(255, 255, 255, 0.08)`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="team-header-group d-flex align-items-center mb-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="team-accent-bar" style={{
                  width: '6px',
                  height: '32px',
                  backgroundColor: team.accent || '#ccc',
                  borderRadius: '4px',
                  marginRight: '15px'
                }}></div>
                <h2 className="team-name-title m-0" style={{
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  color: '#fff'
                }}>
                  {team.name}
                </h2>
              </div>

              <div className="drivers-grid-pairs" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '24px',
                justifyContent: 'center',
                alignItems: 'stretch'
              }}>
                {team.drivers.map((driver) => (
                  <div key={driver._id.$oid} className="driver-card-wrapper d-flex justify-content-center h-100">
                    {isMobile ? (
                      <DriverCardMobile driver={driver} />
                    ) : (
                      <DriverCardDesktop driver={driver} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

export default Drivers;


