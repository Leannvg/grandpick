import { useCountry } from "../hooks/useCountry";

/**
 * Component to display a country's flag emoji and name.
 * @param {string} iso2 - The ISO2 country code.
 * @param {boolean} showName - Whether to show the country name (default: true).
 * @param {string} className - Optional CSS class for the container.
 */
const CountryDisplay = ({ iso2, showName = true, className = "" }) => {
    const { name, emoji, loading } = useCountry(iso2);

    if (!iso2) return null;

    return (
        <span className={`country-display ${className}`} title={name}>
            <span className="emoji-flag me-1">{emoji}</span>
            {showName && <span className="country-name">{loading ? "..." : name}</span>}
        </span>
    );
};

export default CountryDisplay;
