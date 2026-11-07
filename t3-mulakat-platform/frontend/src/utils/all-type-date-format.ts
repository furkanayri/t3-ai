import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);


export function formatDateMonthYear(dateInput?: string | Date | null): string {
    if (!dateInput) return "";

    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) {
            return "";
        }
        return dayjs(dateInput).format("MMM YYYY");
    }


    if (typeof dateInput === "string") {
        if (/^\d{4}$/.test(dateInput)) {
            return dateInput;
        }


        const possibleFormats = [
            "YYYY-MM-DD", // 2023-10-05
            "YYYY-MM",    // 2024-08
            "MM.YYYY",    // 06.2023
            "DD.MM.YYYY", // 05.10.2023
            "MM/YYYY",    // 10/2023
            "DD/MM/YYYY", // 05/10/2023
            "MM-YYYY",    // 10-2023
            "DD-MM-YYYY", // 05-10-2023
        ];

        for (const fmt of possibleFormats) {
            const parsed = dayjs(dateInput, fmt, true);
            if (parsed.isValid()) {
                return parsed.format("MMM YYYY");
            }
        }

        return "";
    }

    return "";
}
