"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfDay, addDays, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

type ApiCalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

type RbcEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: string;
};

export default function CalendarBigView({
  embedded = false,
  title = "UCSD Academic Calendar (2025–2027)",
  defaultView = "month",
  views = ["month", "week", "agenda"],
}: {
  embedded?: boolean;
  title?: string;
  defaultView?: View;
  views?: View[];
}) {
  const [events, setEvents] = useState<RbcEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<View>(defaultView);

  const localizer = useMemo(() => {
    const locales = { "en-US": enUS };
    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek,
      getDay,
      locales,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/events");
        const text = await res.text();

        if (!res.ok) {
          if (!cancelled) setError(`Failed to load events (status ${res.status})`);
          return;
        }

        const data: ApiCalEvent[] = JSON.parse(text);
        const rbcEvents: RbcEvent[] = (Array.isArray(data) ? data : []).map((e) => {
          const rawStart = new Date(e.start);
          const rawEnd = e.end ? new Date(e.end) : null;

          const start = startOfDay(isValid(rawStart) ? rawStart : new Date());

          // Treat every event as all-day. For display consistency, ensure `end` is at least next day.
          // If an end is provided, we assume it's an inclusive end date and add 1 day.
          let endBase = rawEnd && isValid(rawEnd) ? startOfDay(rawEnd) : start;
          if (endBase.getTime() < start.getTime()) endBase = start;
          const end = addDays(endBase, 1);

          return { title: e.title, start, end, allDay: true };
        });

        if (!cancelled) setEvents(rbcEvents);
      } catch (err) {
        console.error("Error loading events", err);
        if (!cancelled) setError("Failed to load events");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: embedded ? 0 : 24 }}>
        {!embedded && <h1>{title}</h1>}
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", padding: embedded ? 0 : 24 }}>
      {!embedded && (
        <h1 style={{ marginBottom: 16, fontSize: 24 }}>
          {title}
        </h1>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={date}
        view={view}
        onNavigate={(nextDate) => setDate(nextDate)}
        onView={(nextView) => setView(nextView)}
        style={{ height: embedded ? "100%" : "calc(100% - 40px)" }}
        views={views}
      />
    </div>
  );
}

