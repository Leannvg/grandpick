import API_URL from "../../services/api";

const DriverCardMobile = ({ driver, teamLogo }) => {
    const { full_name, number, trigram, img, country, team_info } = driver;

    // Split name: first words as firstname, last word as lastname
    const nameParts = full_name.split(" ");
    const lastName = nameParts.pop();
    const firstName = nameParts.join(" ");

    // Use passed teamLogo or construct it from team_id
    const finalTeamLogoUrl = (team_info ? `${API_URL}/api/static/teams/${team_info.isologo}` : null)

    return (
        <article className="driver-card-vertical">
            <div className="driver-photo-wrapper-vertical">
                <img
                    src={`${API_URL}/api/static/drivers/${img}`}
                    alt={full_name}
                    className="driver-photo-vertical"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=Driver"; }}
                />

                {/* Top Overlay: Number and Tags */}
                <div className="driver-top-overlay-vertical">
                    <span className="driver-number-vertical">{number}</span>
                    <div className="driver-tags-vertical">
                        <span className="tag-vertical">{country}</span>
                        <span className="tag-vertical team-tag-vertical">
                            {finalTeamLogoUrl && (
                                <img
                                    src={finalTeamLogoUrl}
                                    className="team-logo-vertical"
                                    alt="team"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                        </span>
                        <span className="tag-vertical">{trigram}</span>
                    </div>
                </div>

                {/* Bottom Overlay: Name */}
                <div className="driver-bottom-overlay-vertical">
                    <h3 className="driver-name-vertical">
                        <span className="driver-firstname-vertical">{firstName.toUpperCase()}</span><br />
                        <span className="driver-lastname-vertical">{lastName.toUpperCase()}</span>
                    </h3>
                </div>
            </div>
        </article>
    );
};

export default DriverCardMobile;
