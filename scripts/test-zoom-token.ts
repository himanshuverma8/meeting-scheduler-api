import { getZoomAccessToken, createZoomMeeting } from "../src/lib/zoom";

async function testZoomToken() {
    const token = await getZoomAccessToken();
    console.log(token);
}

// testZoomToken();



async function createZoomMeetingTest() {
    const response = await createZoomMeeting("Test meeting", "2026-08-22T19:29:08.246Z", 30);
    console.log(response);
}

createZoomMeetingTest();