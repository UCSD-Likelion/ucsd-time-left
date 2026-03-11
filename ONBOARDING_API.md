# Onboarding API Documentation

## Overview
Backend-for-Frontend (BFF) API endpoints that scrape UCSD's official website for up-to-date academic program data, with automatic monthly revalidation.

## Endpoints

### GET /api/majors
Scrapes and returns UCSD undergraduate majors and minors.

**Response:**
```json
{
  "majors": ["Computer Science", "Data Science", ...],
  "minors": ["None", "Mathematics", "Computer Science", ...],
  "lastUpdated": "2026-03-05T03:13:38.091Z"
}
```

**Features:**
- Scrapes from: https://students.ucsd.edu/academics/advising/majors-minors/undergraduate-majors.html
- Also scrapes minors from: https://students.ucsd.edu/academics/advising/majors-minors/minors.html
- Parses degree programs with (B.A.), (B.S.), or (B.A./B.S.) designations
- Cleans up duplicate department names
- Falls back to hardcoded data if scraping fails
- Revalidates every 30 days (2,592,000 seconds)

### GET /api/colleges
Returns UCSD college list.

**Response:**
```json
{
  "colleges": [
    "Revelle College",
    "John Muir College",
    "Thurgood Marshall College",
    "Earl Warren College",
    "Eleanor Roosevelt College",
    "Sixth College",
    "Seventh College",
    "Eighth College"
  ],
  "lastUpdated": "2026-03-05T03:13:38.091Z"
}
```

**Features:**
- Static list of UCSD's 8 colleges
- Revalidates every 30 days

## Cache Configuration
- **Revalidation Period:** 30 days (2,592,000 seconds)
- **Cache-Control Header:** `public, s-maxage=2592000, stale-while-revalidate=86400`
- **Next.js ISR:** Uses `export const revalidate = 2592000`

## Usage in Frontend

See `/src/app/onboarding/2/page.tsx` for example usage:

```typescript
const [collegesRes, majorsRes] = await Promise.all([
  fetch("/api/colleges"),
  fetch("/api/majors"),
]);

const collegesData = await collegesRes.json();
const majorsData = await majorsRes.json();
```

## Dependencies
- **cheerio**: HTML parsing for web scraping
- **next**: Built-in fetch with ISR support

## Error Handling
Both endpoints include fallback data if scraping fails, ensuring the application always has data to display.

