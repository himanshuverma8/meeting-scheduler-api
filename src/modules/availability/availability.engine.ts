import { DateTime } from "luxon";
import { localTimeToInstant } from "../../lib/time";

export type Interval = [number, number] ;

export function merge(intervals: Interval[]): Interval[] {
    const sorted = [...intervals].sort((a,b) => a[0]-b[0]);
    const first = sorted[0];
    if (!first) return [];
    let [start, end] = first;
    let mergeIntervals: Interval[] = [];
    for (const [currStart, currEnd] of sorted){
        if (end >= currStart) {
            end = Math.max(end, currEnd);
        } else {
            mergeIntervals.push([start, end]);
            start = currStart;
            end = currEnd;
        }
    }
    mergeIntervals.push([start, end]);
    return mergeIntervals;
};

export function subtract(window: Interval, blocked: Interval[]): Interval[] {
    const [windowStart, windowEnd] = window;
    const merged = merge(blocked);
    const freeGaps: Interval[] = [];
    let cursor = windowStart;

    for (const [blockStart, blockEnd] of merged) {
       const clipStart = Math.max(blockStart, windowStart);
       const clipEnd = Math.min(blockEnd, windowEnd);
       if (clipStart >= clipEnd) continue;
       if (clipStart > cursor) freeGaps.push([cursor, clipStart]);
       cursor = Math.max(cursor, clipEnd);  
    }
    if(cursor < windowEnd) {
        freeGaps.push([cursor, windowEnd]);
    }
    return freeGaps;
}

export function chunk(gap: Interval, duration: number): number[] {
    const [gapStart, gapEnd] = gap;
    let chunks: number[] = [];
    for(let i = gapStart; i + duration <=gapEnd; i+=duration) {
        chunks.push(i);
    }
    return chunks;
}

export type EventConfig = {
    duration: number;
    bufferBefore: number;
    bufferAfter: number;
    minNotice: number;
    maxDays: number;
};

export function computeSlots(params: {
    now: number;
    window: Interval;
    bookings: Interval[];
    config: EventConfig;
    queryStart: number;
    queryEnd: number;
}) : number[] {
    const { now, window, bookings, config, queryStart, queryEnd } = params;
    const [windowStart, windowEnd] = window;
    const startInterval = Math.max(windowStart, now + config.minNotice, queryStart);
    const endInterval = Math.min(windowEnd, now + config.maxDays, queryEnd);
    if (startInterval >= endInterval) return [];
    
    const blocked: Interval[] = bookings.map(([s, e]) => [s - config.bufferBefore, e + config.bufferAfter]);
    const freeGaps = subtract([startInterval, endInterval], blocked);
    let slots: number[] = [];
    for (const gap of freeGaps) {
        const chunks = chunk(gap, config.duration);
        slots.push(...chunks);
    }
    return slots;
 }

 export function resolveWindowsForDate(
  entries: { day_of_week: number | null; specific_date: string | null; start_time: string; end_time: string }[],
  date: string,      // "2026-07-16"
  zone: string,      // organizer's IANA zone
): Interval[] {
    //check for specific date
    const overrides = entries.filter(e => e.specific_date === date);
    const weekday = DateTime.fromISO(date).weekday % 7;
    //recurring rows for weekday
    const recurring = entries.filter(e => e.day_of_week === weekday);
    const matched = overrides.length ? overrides : recurring;
    return matched.map((e): Interval => [
        localTimeToInstant(date, e.start_time, zone),
        localTimeToInstant(date, e.end_time, zone)
    ])
}