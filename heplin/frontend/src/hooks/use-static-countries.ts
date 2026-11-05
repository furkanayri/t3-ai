import { useState, useEffect } from 'react';
import { countries } from '../data/countries';

export function useStaticCountries() {
    interface Country {
        names: {
            en: string;
            tr: string;
        };
    }


    const [countriesData, setCountries] = useState<Country[]>([]);
    useEffect(() => {
        async function fetchCountries() {
            const res = countries.map((item: any) => ({
                names: {
                    en: item.names.en,
                    tr: item.names.tr,
                }
            }));
            setCountries(res);
        }

        fetchCountries();
    }, []);

    return countriesData;
}
