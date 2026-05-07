import { useState, useEffect } from "react";
import { getCountries } from "../services/countries.services.js";
import { getFlagEmoji } from "../utils/helpers.js";

/**
 * Custom hook to get country details (name and emoji) from an ISO2 code.
 * @param {string} iso2 - The ISO2 country code (e.g., "AR", "ES").
 * @returns {Object} { name, emoji, loading }
 */
export function useCountry(iso2) {
    const [details, setDetails] = useState({
        name: iso2 || "",
        emoji: getFlagEmoji(iso2) || "",
        loading: true,
    });

    useEffect(() => {
        if (!iso2) {
            setDetails(prev => ({ ...prev, loading: false }));
            return;
        }

        let isMounted = true;

        getCountries()
            .then((countries) => {
                if (isMounted) {
                    const country = countries.find((c) => c.iso2 === iso2);
                    if (country) {
                        setDetails({
                            name: country.name,
                            emoji: country.emoji || getFlagEmoji(iso2),
                            loading: false,
                        });
                    } else {
                        setDetails(prev => ({ ...prev, loading: false }));
                    }
                }
            })
            .catch((err) => {
                console.error("Error fetching country details:", err);
                if (isMounted) setDetails(prev => ({ ...prev, loading: false }));
            });

        return () => {
            isMounted = false;
        };
    }, [iso2]);

    return details;
}
