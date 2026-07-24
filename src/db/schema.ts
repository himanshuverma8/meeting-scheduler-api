import { pgTable, uuid, text, integer, time, date, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    hashedPassword: text("hashed_password").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
})

export const schedules = pgTable("schedules", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade"}).notNull(),
    name: text("name").notNull(),
    timezone: text("timezone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
})

export const schedule_entries = pgTable("schedule_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    day_of_week: integer("day_of_week"),
    specific_date: date("specific_date"),
    start_time: time("start_time").notNull(),
    end_time: time("end_time").notNull(),
    schedule_id: uuid("schedule_id").references(() => schedules.id, { onDelete: "cascade" }).notNull()
})

export const event_types = pgTable("event_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    schedule_id: uuid("schedule_id").references(() => schedules.id).notNull(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    buffer_before: integer("buffer_before").notNull(),
    buffer_after: integer("buffer_after").notNull(),
    min_notice_minutes: integer("min_notice_minutes").notNull(),
    max_days_in_advance: integer("max_days_in_advance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
})

export const bookings = pgTable("bookings", {
    id: uuid("id").primaryKey().defaultRandom(),
    host_id: uuid("host_id").references(() => users.id).notNull(),
    idempotency_key: text("idempotency_key").unique(),
    event_type_id: uuid("event_type_id").references(() => event_types.id).notNull(),
    start_time: timestamp("start_time", {
        withTimezone: true
    }).notNull(),
    end_time: timestamp("end_time", {
        withTimezone: true
    }).notNull(),
    duration: integer("duration").notNull(),
    invitee_name: text("invitee_name").notNull(),
    invitee_email: text("invitee_email").notNull(),
    invitee_timezone: text("invitee_timezone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
})