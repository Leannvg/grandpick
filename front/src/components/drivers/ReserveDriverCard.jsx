import { getImageUrl } from "../../utils/cloudinary";
import CountryDisplay from "../CountryDisplay.jsx";
import suplenteImg from "../../assets/icons/suplente.png";

// Misma estructura que DriverCardMobile, sin número y con imagen genérica.
const ReserveDriverCard = ({ driver }) => {
    const { full_name, trigram, country, team_info } = driver;
    const nameParts = full_name.split(" ");
    const lastName = nameParts.pop();
    const firstName = nameParts.join(" ");

    return (
        <article className="driver-card-vertical reserve-card">
            <div className="driver-photo-wrapper-vertical">
                <img src={suplenteImg} alt={full_name} className="driver-photo-vertical" />

                <div className="driver-top-overlay-vertical">
                    <div className="driver-tags-vertical">
                        <CountryDisplay iso2={country} showName={false} className="tag-vertical" />
                        <span className="tag-vertical team-tag-vertical">
                            {team_info?.isologo ? (
                                <img
                                    src={getImageUrl(team_info.isologo, 100)}
                                    className="team-logo-vertical"
                                    alt="team"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : team_info?.name}
                        </span>
                        <span className="tag-vertical">{trigram}</span>
                    </div>
                </div>

                <div className="driver-bottom-overlay-vertical">
                    <h2 className="driver-name-vertical">
                        <span className="driver-firstname-vertical">{firstName.toUpperCase()}</span><br />
                        <span className="driver-lastname-vertical">{lastName.toUpperCase()}</span>
                    </h2>
                </div>
            </div>
        </article>
    );
};

export default ReserveDriverCard;
