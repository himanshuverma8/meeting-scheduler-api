import { env } from "../config/env.js";
import { AppError } from "./errors.js";

const ZOOM_OAUTH_ENDPOINT = 'https://zoom.us/oauth/token'

export async function getZoomAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString("base64");

    const body = new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: env.ZOOM_ACCOUNT_ID,
    });

    const response = await fetch(ZOOM_OAUTH_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}`},
        body
    })

    if (!response.ok) {
        throw new AppError(502, 'ZOOM_AUTH_FAILED', `Token fetch failed: ${response.status}`, );
    }

    const data = await response.json();
    return data.access_token;
}


export async function createZoomMeeting(topic: string, startTime: string, duration: number) {
    const token = await getZoomAccessToken();
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            topic,
            type: 2,
            start_time: startTime,
            duration
        })
    });

    if (!response.ok) {
        throw new AppError(502, 'ZOOM_CREATE_MEETING_FAILED', `response failed: ${response.status}`);
    }

    const data = await response.json();

    return { joinLink: data.join_url, hostLink: data.start_url };
}