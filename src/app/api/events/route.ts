import { getIcsEvents } from "@/app/Functions/getIcsEvents";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await getIcsEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch ICS events:", error);
    return NextResponse.json(
      { error: "Failed to load calendar events" },
      { status: 500 }
    );
  }
}
