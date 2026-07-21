const URL = "http://localhost:3000/bookings";
const N = 10;

const payload = {
  event_type_id: "81934b77-e10c-497f-9ab9-6edb5315fcc9",
  start_time: "2026-07-22T09:30:00.000-04:00",   // a FRESH slot — not booked yet
  invitee_name: "Race Test",
  invitee_email: "race@example.com",
  invitee_timezone: "America/New_York",
};

// fire all N at once — Promise.all launches them concurrently

const statuses = await Promise.all(
  Array.from({ length: N }, () =>
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.status),
  ),
);

const created = statuses.filter((s) => s === 201).length;
const conflicts = statuses.filter((s) => s === 409).length;
console.log(`201 created: ${created} | 409 conflict: ${conflicts} | raw:`, statuses);

//output 1:
// himanshuverma@Himanshus-Air meeting-scheduler-api % node scripts/race-check.js 
// 201 created: 10 | 409 conflict: 0 | raw: [
//   201, 201, 201, 201,
//   201, 201, 201, 201,
//   201, 201
// ]

//output 2:
// himanshuverma@Himanshus-Air meeting-scheduler-api % node scripts/race-check.js 
// 201 created: 1 | 409 conflict: 9 | raw: [
//   201, 409, 409, 409,
//   409, 409, 409, 409,
//   409, 409
// ]