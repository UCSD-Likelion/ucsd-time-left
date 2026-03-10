import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const revalidate = 2592000; // 30 days in seconds

interface MajorsMinorsData {
  majors: string[];
  minors: string[];
  lastUpdated: string;
}

async function scrapeMajorsAndMinors(): Promise<MajorsMinorsData> {
  try {
    const response = await fetch(
      "https://students.ucsd.edu/academics/advising/majors-minors/undergraduate-majors.html",
      { next: { revalidate: 2592000 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const majors = new Set<string>();
    const minors = new Set<string>();

    // Parse majors from the page structure
    // Majors are listed in paragraphs with degree designations like (B.A.), (B.S.), etc.
    $('p').each((_, element) => {
      const text = $(element).text();
      
      // Match patterns like "Major Name (B.A.)" or "Major Name (B.S.)"
      const majorMatches = text.matchAll(/([A-Za-z\s&,'-]+)\s*\((B\.A\.|B\.S\.|B\.A\.\/B\.S\.)\)/g);
      
      for (const match of majorMatches) {
        let majorName = match[1].trim();
        
        // Clean up duplicate department names (e.g., "Chemistry Chemistry" -> "Chemistry")
        const words = majorName.split(/\s+/);
        if (words.length >= 2 && words[0] === words[words.length - 1]) {
          majorName = words[0];
        }
        
        // Remove extra spaces and clean up
        majorName = majorName.replace(/\s+/g, ' ').trim();
        
        // Filter out non-major text
        if (
          majorName.length > 3 &&
          !majorName.toLowerCase().includes('available to') &&
          !majorName.toLowerCase().includes('admitted to') &&
          !majorName.toLowerCase().includes('earlier') &&
          !majorName.toLowerCase().includes('later')
        ) {
          majors.add(majorName);
        }
      }
    });

    // If scraping was successful, get minors from the minors page
    if (majors.size > 10) {
      try {
        const minorsResponse = await fetch(
          "https://students.ucsd.edu/academics/advising/majors-minors/minors.html",
          { next: { revalidate: 2592000 } }
        );
        
        if (minorsResponse.ok) {
          const minorsHtml = await minorsResponse.text();
          const $minors = cheerio.load(minorsHtml);
          
          $minors('p').each((_, element) => {
            const text = $minors(element).text();
            const minorMatches = text.matchAll(/([A-Za-z\s&,'-]+)\s*\(Minor\)/g);
            
            for (const match of minorMatches) {
              const minorName = match[1].trim();
              if (minorName.length > 3) {
                minors.add(minorName);
              }
            }
          });
        }
      } catch {
        console.log("Could not fetch minors, using defaults");
      }
    }

    // Use fallback data if scraping didn't get enough results
    if (majors.size < 10) {
      return getFallbackData();
    }

    const minorsArray = minors.size > 5 ? Array.from(minors) : [
      "Mathematics",
      "Computer Science",
      "Business",
      "Data Science",
      "Psychology",
      "Economics",
      "Music",
      "Visual Arts",
      "Biology",
      "Chemistry",
    ];

    return {
      majors: Array.from(majors).sort(),
      minors: ["None", ...minorsArray.sort()],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error scraping majors/minors:", error);
    return getFallbackData();
  }
}

function getFallbackData(): MajorsMinorsData {
  return {
    majors: [
      "Computer Science",
      "Data Science",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Biology",
      "Chemistry",
      "Mathematics",
      "Physics",
      "Economics",
      "Psychology",
      "Cognitive Science",
      "Business Economics",
    ].sort(),
    minors: [
      "None",
      "Mathematics",
      "Computer Science",
      "Business",
      "Data Science",
      "Psychology",
      "Economics",
      "Music",
      "Visual Arts",
      "Biology",
      "Chemistry",
    ].sort(),
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  const data = await scrapeMajorsAndMinors();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400',
    },
  });
}





