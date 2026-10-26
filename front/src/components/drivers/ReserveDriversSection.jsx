import Reveal from "../Reveal";
import ReserveDriverCard from "./ReserveDriverCard";

const ReserveDriversSection = ({ drivers = [] }) => {
    if (drivers.length === 0) return null;

    return (
        <section className="reserve-section">
            <header className="reserve-header">
                <p className="section-label">Reservas</p>
                <h2 className="reserve-title">PILOTOS SUPLENTES</h2>
                <p className="section-subtitle">Siempre listos para entrar a la pista</p>
            </header>

            <div className="reserve-grid">
                {drivers.map((driver, index) => (
                    <Reveal key={driver._id} delay={Math.min(index * 0.05, 0.4)}>
                        <ReserveDriverCard driver={driver} />
                    </Reveal>
                ))}
            </div>
        </section>
    );
};

export default ReserveDriversSection;
