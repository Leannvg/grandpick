const DriverCardDesktop = ({ driver }) => {
    const { full_name, number, trigram, img, country } = driver;

    // Split name: first words as firstname, last word as lastname
    const nameParts = full_name.split(" ");
    const lastName = nameParts.pop();
    const firstName = nameParts.join(" ");

    return (
        <article className="driver-card-horizontal">
            <div className="driver-info-horizontal">
                <span className="driver-number-horizontal">{number}</span>
                <h3 className="driver-name-horizontal">
                    <span className="driver-firstname-horizontal">{firstName}</span>
                    <span className="driver-lastname-horizontal"> {lastName}</span>
                </h3>
                <div className="driver-tags-horizontal">
                    <span className="tag-horizontal">{country}</span>
                    <span className="tag-horizontal team-tag-horizontal">
                        {/* Assuming team logo is available via team_id or similar. Using a generic path for now. */}
                        <img src={`${import.meta.env.VITE_API_URL}/api/static/teams/${driver.team_id}-iso.png`} className="team-logo-horizontal" alt="team" />
                    </span>
                    <span className="tag-horizontal">{trigram}</span>
                </div>
            </div>
            <div className="driver-photo-wrapper-horizontal">
                <img
                    src={`${import.meta.env.VITE_API_URL}/api/static/${img}`}
                    alt={full_name}
                    className="driver-photo-horizontal"
                />
            </div>
        </article>
    );
};

export default DriverCardDesktop;

