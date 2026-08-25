# Meeting Scheduler API

A Calendly-style scheduling backend. Organizers authenticate and define availability schedules and event types; anonymous invitees view dynamically computed open slots and book them — with correct timezone handling and guaranteed no double-booking, even under concurrent load.

**Live API:** https://meeting-scheduler-api-express.hv6.dev

**Stack:** Node.js · TypeScript · Express 5 · PostgreSQL · Drizzle ORM · Zod · argon2 · JWT · Luxon · Vitest

---

## The three things that make this more than CRUD

1. **Timezone correctness** — instants are stored in UTC; an organizer's zone is stored as an IANA name (e.g. `Asia/Kolkata`), never a fixed offset. Recurring "9:00–17:00" rules are resolved to real UTC instants against a specific date, so DST is handled correctly (9 AM New York is `13:00 UTC` in summer, `14:00 UTC` in winter). Slots are returned in the invitee's own timezone.

2. **Dynamic availability engine** — free slots are computed on the fly, never pre-stored, by a **pure, unit-tested function**: expand the day's working windows → subtract existing bookings and buffers → enforce min-notice and max-days-in-advance → chunk into duration-sized slots. Being pure (no DB calls inside) makes it fully testable in isolation, including DST edge cases.

3. **Concurrency / no double-booking** — the centerpiece. Two people hitting the same slot at the same millisecond resolve to **exactly one** booking, enforced at the database level. Retries are safe via idempotency keys. Details below.

---

## The double-booking problem (and how it's solved)

### The problem

Booking is a public endpoint: pick a slot, submit your details. To prevent double-booking, the naive approach is **check-then-insert** — first read the database to see if the slot is free (overlap check), and if it is, insert the booking.

That works for one request at a time. But it's **two separate operations**, and under concurrency they interleave. If two users request the same slot at the same instant:

```
User A: read  → slot is free ✓
User B: read  → slot is free ✓   (A hasn't written yet)
User A: write → booking created
User B: write → booking created   ← DOUBLE BOOKING
```

Both reads happen before either write commits, so both see an empty slot and both insert. The root cause: **check and write must be a single atomic operation**, but here they're two.

### Why you can't fix it in the app

- **In-memory locking?** You could lock the row/slot in application code — but real deployments run **multiple server instances** behind a load balancer. A lock in instance A means nothing to instance B. There's one database but many app processes, so an app-level lock doesn't span them, and the race returns.
- **`SELECT ... FOR UPDATE`?** That locks *existing* rows — but the conflict is about a row that **doesn't exist yet** (you're inserting). There's nothing to lock.

The gap between "check" and "write" is fundamental to application-level logic. The only place it can be closed is where every request converges and can be **serialized**: the database.

### The fix — a Postgres exclusion constraint

The database enforces the invariant "no two overlapping bookings for the same host" atomically on every insert, using an `EXCLUDE` constraint (via the `btree_gist` extension):

```sql
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    host_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  );
```

It's a generalized `UNIQUE` constraint: instead of "no two rows are equal," it says "no two rows *overlap in time for the same host*." When two concurrent inserts race, Postgres serializes them — the first commits, the second is checked *against the first* and rejected with error code `23P01`, which the API maps to `409 Conflict`. Check and write are now one atomic, DB-enforced operation. No gap.

### Proof

The repo includes [`scripts/race-check.js`](./scripts/race-check.js), which fires 10 concurrent booking requests at the same slot:

```
# Naive check-then-insert:
201 created: 10 | 409 conflict: 0        ← ten bookings for one slot

# With the exclusion constraint:
201 created: 1  | 409 conflict: 9        ← exactly one wins
```

### Retry safety — idempotency keys

The exclusion constraint stops *different* people from colliding. Idempotency solves a *different* failure: **the same person retrying.** If an invitee books a slot, the booking commits, but the response is lost to a network blip — their client retries. Without protection, the retry hits "slot already booked" (`409`) — confusing, because it was booked by *their own* first request.

With an idempotency key (a UUID the client sends in the `Idempotency-Key` header and reuses on retries), the server recognizes the repeat and **returns the original booking** instead of erroring or duplicating. A unique constraint on the key makes this safe even when the retry races the original. Result: **exactly-once** semantics.

---

## Architecture

Layered, feature-module structure — `route → controller → service → db`.controllers (HTTP only), services (all logic), separate data access. Requests validated with Zod at the boundary; one central error middleware; env vars validated at startup.

![Architecture diagram](./architecture.png)

## Data model

`bookings` carries a denormalized `host_id` (so the exclusion constraint can enforce per-host overlap in a single table) and a unique `idempotency_key` for retry safety. Schedule entries store **local** clock times + an IANA zone; bookings store **UTC** instants and snapshot their own duration so later event-type edits never rewrite a past booking.

![Database schema](./schema_v4.png)

---

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | public | Create an organizer account |
| `POST` | `/auth/login` | public | Log in, receive a JWT |
| `GET` | `/availability` | public | Compute open slots for an event type in a date range |
| `POST` | `/bookings` | public | Book a slot (double-booking-safe, idempotent) |
| `POST` `GET` `GET /:id` `PATCH` `DELETE` | `/schedules` | JWT | Manage availability schedules |
| `POST` `GET` `GET /:id` `PATCH` `DELETE` | `/event-types` | JWT | Manage bookable event types |
| `GET` | `/health` | public | Liveness check |

Protected routes require `Authorization: Bearer <token>` and are ownership-scoped (a user can only touch their own resources).

---

## Getting started

**Prerequisites:** Node.js 20+, a PostgreSQL database (e.g. Supabase).

```bash
git clone https://github.com/himanshuverma8/meeting-scheduler-api.git
cd meeting-scheduler-api
npm install
```

Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET_KEY=your-strong-secret
PORT=3000
```

Run migrations, then start the dev server:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate    
npm run dev
```

Production start: `npm start`.

---

## Testing

**Unit tests** (the availability engine — pure functions, including a DST case):
```bash
npm test
```

**API collection** — a ready-to-run [Bruno](https://www.usebruno.com/) collection lives in [`/meetingSchedulerAPI`](./meetingSchedulerAPI). Open it in Bruno (**Open Collection** → select the folder), set `baseUrl`, run **Signup** then **Login** to populate the auth token, and every endpoint is ready to exercise against the live API or your local server.

---

## Future Additions

- Multi-host / team scheduling & round-robin assignment
- Email / SMS notifications
- External calendar sync (Google/Outlook)
- A LLM layer that parses booking intent into validated constraints
