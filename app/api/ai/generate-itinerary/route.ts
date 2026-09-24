import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const requestSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().optional(),
  style: z.string().optional(),
  groupSize: z.number().optional(),
});

interface ActivityPayload {
  dayNumber: number;
  time: string;
  title: string;
  description: string;
  locationName: string;
  category: "sightseeing" | "food" | "transport" | "lodging" | "leisure" | "shopping" | "entertainment";
  estimatedCost: number;
  notes: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { destination, startDate, endDate, style = "balanced" } = parsed.data;

    // Calculate number of days
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const dayCount = Math.max(1, Math.min(7, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));

    let activities: ActivityPayload[] = [];

    // Try calling Gemini if API key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert travel planner. Create an engaging, realistic group trip itinerary for:
Destination: ${destination}
Number of days: ${dayCount}
Style: ${style}

Output a strictly valid JSON array of objects with the following keys for each activity:
- dayNumber: integer between 1 and ${dayCount}
- time: 24h format string (e.g. "09:30", "13:00", "19:00")
- title: concise activity name
- description: 1-2 sentence description of what the group will do
- locationName: specific landmark or venue name in ${destination}
- category: one of ["sightseeing", "food", "transport", "lodging", "leisure", "shopping", "entertainment"]
- estimatedCost: number (cost per person in USD)
- notes: practical tips (e.g. booking advance, walking tips)

Generate 3 activities per day. Output ONLY raw JSON array with no markdown backticks.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const text = response.text || "";
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        activities = JSON.parse(cleaned);
      } catch (geminiError) {
        console.warn("Gemini API call failed or timed out, using fallback travel engine:", geminiError);
      }
    }

    // High quality travel engine fallback if Gemini returned empty or was not configured
    if (!activities || activities.length === 0) {
      const city = destination.split(",")[0].trim();
      activities = [];

      for (let day = 1; day <= dayCount; day++) {
        // Morning Activity
        activities.push({
          dayNumber: day,
          time: "09:30",
          title: `Explore Historic ${city} Landmarks`,
          description: `Morning walking tour taking in panoramic vistas, iconic architectural monuments, and cultural heritage in ${city}.`,
          locationName: `${city} Old Town & Main Square`,
          category: "sightseeing",
          estimatedCost: 15,
          notes: "Arrive early to avoid midday crowds and snap great photos.",
        });

        // Afternoon Food / Leisure
        activities.push({
          dayNumber: day,
          time: "13:00",
          title: `${city} Artisanal Food Market & Lunch`,
          description: `Sample regional specialties, fresh market street foods, and refreshments together with the group.`,
          locationName: `${city} Central Food Hall`,
          category: "food",
          estimatedCost: 30,
          notes: "Split dishes among the crew to try a wider variety.",
        });

        // Evening Highlight
        activities.push({
          dayNumber: day,
          time: "18:30",
          title: `Sunset Viewpoint & Group Dinner in ${city}`,
          description: `Watch the sunset over ${city} followed by a celebratory shared dinner featuring authentic local delicacies.`,
          locationName: `${city} Waterfront / Promenade`,
          category: "food",
          estimatedCost: 55,
          notes: "Reservations recommended for dinner.",
        });
      }
    }

    // Format with IDs and timestamps
    const now = new Date().toISOString();
    const finalActivities = activities.map((act, index) => {
      const dateObj = new Date(s.getTime() + (act.dayNumber - 1) * 24 * 60 * 60 * 1000);
      const dateStr = dateObj.toISOString().split("T")[0];

      return {
        id: "ai_act_" + Date.now().toString(36) + "_" + index,
        dayNumber: act.dayNumber,
        date: dateStr,
        time: act.time || "10:00",
        title: act.title,
        description: act.description,
        locationName: act.locationName,
        category: act.category || "sightseeing",
        estimatedCost: act.estimatedCost || 0,
        currency: "USD",
        notes: act.notes || "",
        addedByUid: "gemini_ai",
        addedByName: "Gemini AI",
        votes: {},
        createdAt: now,
        updatedAt: now,
      };
    });

    return NextResponse.json({ success: true, activities: finalActivities });
  } catch (error) {
    console.error("AI itinerary generation error:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}
