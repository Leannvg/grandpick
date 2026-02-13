const DriverCardMobile = ({ driver }) => {
    const { full_name, number, trigram, img, country } = driver;

    // Split name: first words as firstname, last word as lastname
    const nameParts = full_name.split(" ");
    const lastName = nameParts.pop();
    const firstName = nameParts.join(" ");

    return (
        <article className="driver-card-vertical">
            <div className="driver-photo-wrapper-vertical">
                <img
                    src={`${import.meta.env.VITE_API_URL}/api/static/${img}`}
                    alt={full_name}
                    className="driver-photo-vertical"
                />

                {/* Top Overlay: Number and Tags */}
                <div className="driver-top-overlay-vertical">
                    <span className="driver-number-vertical">{number}</span>
                    <div className="driver-tags-vertical">
                        <span className="tag-vertical">{country}</span>
                        <span className="tag-vertical team-tag-vertical">
                            <img src={`${import.meta.env.VITE_API_URL}/api/static/teams/${driver.team_id}-iso.png`} className="team-logo-vertical" alt="team" />
                        </span>
                        <span className="tag-vertical">{trigram}</span>
                    </div>
                </div>

                {/* Bottom Overlay: Name */}
                <div className="driver-bottom-overlay-vertical">
                    <h3 className="driver-name-vertical">
                        <span className="driver-firstname-vertical">{firstName}</span><br />
                        <span className="driver-lastname-vertical">{lastName}</span>
                    </h3>
                </div>
            </div>
        </article>
    );
};

export default DriverCardMobile;
