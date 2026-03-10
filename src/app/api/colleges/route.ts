import { NextResponse } from "next/server";

export const revalidate = 2592000; // 30 days in seconds

const UCSD_COLLEGES = [
  "Revelle College",
  "John Muir College",
  "Thurgood Marshall College",
  "Earl Warren College",
  "Eleanor Roosevelt College",
  "Sixth College",
  "Seventh College",
  "Eighth College",
];

export async function GET() {
  return NextResponse.json(
    {
      colleges: UCSD_COLLEGES,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400',
      },
    }
  );
}

