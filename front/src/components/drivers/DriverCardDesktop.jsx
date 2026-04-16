import { getFlagEmoji } from "../../utils/helpers";
import { getImageUrl } from "../../utils/cloudinary";

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
                    <span className="tag-horizontal emoji-flag" title={country}>{getFlagEmoji(country)}</span>
                    <span className="tag-horizontal team-tag-horizontal">
                        {/* Assuming team logo is available via team_id or similar. Using a generic path for now. */}
                        {driver.team_info?.isologo && (
                            <img
                                src={getImageUrl(driver.team_info.isologo, 100)}
                                className="team-logo-horizontal"
                                alt="team"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </span>
                    <span className="tag-horizontal">{trigram}</span>
                </div>
            </div>
            <div className="driver-photo-wrapper-horizontal">
                <img
                    src={getImageUrl(img, 500)}
                    alt={full_name}
                    className="driver-photo-horizontal"
                />
            </div>
        </article>
    );
};

export default DriverCardDesktop;

