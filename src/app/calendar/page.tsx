"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

type CalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

type RbcEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: string;
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState<RbcEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/events");
        const text = await res.text();

        if (!res.ok) {
          setError(`Failed to load events (status ${res.status})`);
          return;
        }

        const data: CalEvent[] = JSON.parse(text);
        const rbcEvents: RbcEvent[] = (Array.isArray(data) ? data : []).map(
          (e) => {
            const start = new Date(e.start);
            const end = e.end ? new Date(e.end) : new Date(start.getTime() + 60 * 60 * 1000);
            return { title: e.title, start, end };
          }
        );
        setEvents(rbcEvents);
      } catch (err) {
        console.error("Error loading events", err);
        setError("Failed to load events");
      }
    }

    load();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>UCSD Academic Calendar (2025–2027)</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, height: "calc(100vh - 48px)" }}>
      <h1 style={{ marginBottom: 16, fontSize: 24 }}>UCSD Academic Calendar (2025–2027)</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "agenda"]}
        defaultView="month"
      />
    </div>
  );
}
