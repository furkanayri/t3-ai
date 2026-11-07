import { useState, useEffect } from 'react';
import { cities } from '../data/cities'
export interface City {
    id: string;
    name: string;
}
export function useStaticCities() {

    const [citiesData, setCities] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCities() {
            const res = Object.entries(cities).map(([id, name]) => ({
                id,
                name,
            }));
            setCities(res);
        }

        fetchCities();
    }, []);

    return citiesData;
}