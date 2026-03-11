"use client";

import { useEffect, useState } from "react";

type CalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

export default function CalendarView() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">Loading calendar…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          UCSD Academic Calendar (2025–2027)
        </h2>
      </div>
      <ul className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
        {events.length === 0 ? (
          <li className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
            No events found
          </li>
        ) : (
          events.map((event) => (
            <li
              key={event.id}
              className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {event.title}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(event.start)}
                {event.end && ` – ${formatDate(event.end)}`}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
