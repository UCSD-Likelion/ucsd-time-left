import fs from "fs/promises";
import path from "path";

export type CalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

function parseIcsDate(value: string, isEndDate = false): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 8) {
    const y = parseInt(cleaned.slice(0, 4), 10);
    const m = parseInt(cleaned.slice(4, 6), 10);
    const d = parseInt(cleaned.slice(6, 8), 10);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (isEndDate) {
      date.setUTCDate(date.getUTCDate() - 1);
      date.setUTCHours(23, 59, 59, 999);
    } else {
      date.setUTCHours(12, 0, 0, 0);
    }
    return date.toISOString();
  }
  return value;
}

function getValue(line: string): string {
  const colon = line.indexOf(":");
  return colon >= 0 ? line.slice(colon + 1).trim() : "";
}

function parseIcsFile(icsText: string, idPrefix: string): CalEvent[] {
  const lines = icsText.split(/\r?\n/);
  const unfolded: string[] = [];
  let current = "";

  for (const line of lines) {
    if (/^[ \t]/.test(line)) {
      current += line.slice(1);
    } else {
      if (current) unfolded.push(current);
      current = line;
    }
  }
  if (current) unfolded.push(current);

  const events: CalEvent[] = [];
  let inEvent = false;
  let event: Partial<CalEvent> = {};
  let eventIndex = 0;

  for (const line of unfolded) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      event = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (event.title && event.start) {
        const uid = (event.id || `evt-${eventIndex}`).replace(/\s/g, "");
        events.push({
          id: `${idPrefix}-${uid}`,
          title: event.title,
          start: event.start,
          end: event.end,
        });
      }
      inEvent = false;
      eventIndex++;
    } else if (inEvent) {
      const upper = line.toUpperCase();
      if (upper.startsWith("DTSTART")) event.start = parseIcsDate(getValue(line));
      else if (upper.startsWith("DTEND")) event.end = parseIcsDate(getValue(line), true);
      else if (upper.startsWith("SUMMARY")) event.title = getValue(line) || "Untitled";
      else if (upper.startsWith("UID")) event.id = getValue(line).replace(/\s/g, "") || `evt-${eventIndex}`;
    }
  }

  return events;
}

const ICS_FILES = [
  "2025-2026-academic-calendar.ics",
  "2026-2027-academic-calendar.ics",
];

export async function getIcsEvents(): Promise<CalEvent[]> {
  const publicDir = path.join(process.cwd(), "public");
  const allEvents: CalEvent[] = [];

  for (const filename of ICS_FILES) {
    const icsPath = path.join(publicDir, filename);
    try {
      const icsText = await fs.readFile(icsPath, "utf8");
      const idPrefix = filename.replace(/\.ics$/, "").replace(/-/g, "_");
      const events = parseIcsFile(icsText, idPrefix);
      allEvents.push(...events);
    } catch (err) {
      console.warn(`Could not load ${filename}:`, err);
    }
  }

  allEvents.sort((a, b) => a.start.localeCompare(b.start));
  return allEvents;
}
