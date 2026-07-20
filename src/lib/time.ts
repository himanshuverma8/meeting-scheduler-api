import { DateTime } from "luxon";
import { AppError } from "./errors";


export function localTimeToInstant(date: string, time: string, zone: string): number {
  // date "2026-07-16", time "11:00", zone "America/New_York"  →  UTC epoch ms
    
    const dt = DateTime.fromISO( `${date}T${time}`, { zone });
    if (!dt.isValid) throw new AppError(500, "TIME_ERROR", `invalid time: ${date}T${time} in ${zone}`);
    return dt.toMillis(); //UTC instant
}


