import { useCountry } from "../hooks/useCountry";

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
