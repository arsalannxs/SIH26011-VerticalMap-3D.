import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantContext {
  parcelId?: string;
  surveyNumber?: string;
  buildingName?: string;
  floorCount?: number;
  unitNumber?: string;
  proposedUlpin?: string;
  elevationM?: number;
  validationStatus?: string;
  validationWarning?: string;
}

export async function askVerticalMapAssistant(
  prompt: string,
  history: ChatMessage[] = [],
  context?: AssistantContext
): Promise<string> {
  const client = getAIClient();

  // If Gemini API Key is available, use real gemini-3.8-flash model
  if (client) {
    try {
      const systemInstruction = `You are the VerticalMap 3D Assistant for the Department of Land Resources (DoLR), Ministry of Rural Development, Government of India (Smart India Hackathon 2026 Problem Statement SIH26011).
Your role is to assist land record officers, survey teams, and GIS engineers in understanding 3D ULPIN (Unique Land Parcel Identification Number) generation, vertical property demarcation (apartments, floors, basements, commercial suites), 3D spatial extents (X, Y, Z coordinates), DEM/DSM elevation data, and topology validation.

CURRENT ACTIVE CONTEXT:
- Active Parcel: ${context?.parcelId || 'P001 (Survey No. 48/2A, Baner, Pune)'}
- Active Building: ${context?.buildingName || 'Tower A - Sahyadri Heights'}
- Active Unit: ${context?.unitNumber || 'Unit 302 (Floor 3)'}
- Proposed 3D ULPIN: ${context?.proposedUlpin || 'IN-MH-PUN-P001-B01-F03-U02'}
- Elevation Z: ${context?.elevationM !== undefined ? `+${context.elevationM} m` : '+10.2 m'}
- Validation Status: ${context?.validationStatus || 'Warning (Unit 203 & 204 boundary intersection)'}

GUIDELINES:
1. Always be concise, clear, and professional. Use plain language for survey and engineering staff.
2. Emphasize that "Proposed 3D ULPIN" is a prototype spatial identifier for decision-support and vertical cadastral mapping.
3. If asked about Z coordinate: Explain that Z represents the vertical position/elevation above the ground datum or Mean Sea Level (MSL), enabling stacked property units on different floors to be uniquely identified.
4. If asked why validation failed or warned: Cite the specific topology issue (e.g. Unit 203 overlaps with Unit 204 by ~2.4 m² along X=0.6m) and recommend checking architectural floor plans.
5. If required data is unavailable, reply: "Insufficient data available." Do not invent property records.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to cadastral context engine:', err);
    }
  }

  // Smart Context-Aware Fallback Engine (when offline or API key not present)
  const lower = prompt.toLowerCase();

  if (lower.includes('what is this property') || lower.includes('about this property')) {
    return `This property is ${context?.unitNumber || 'Unit 302'}, located on ${context?.floorCount ? `Floor 3 of ${context.buildingName || 'Tower A'}` : 'Tower A - Sahyadri Heights'}, on cadastral parcel ${context?.surveyNumber || 'Survey No. 48/2A, Baner, Pune'}. It is a candidate vertical residential unit with an area of 1,250 sq.ft and a relative elevation of +10.2 meters above ground datum.`;
  }

  if (lower.includes('explain this 3d ulpin') || lower.includes('ulpin format') || lower.includes('what is 3d ulpin')) {
    return `The Proposed 3D ULPIN (e.g. ${context?.proposedUlpin || 'IN-MH-PUN-P001-B01-F03-U02'}) is a prototype spatial identifier. It extends the standard 2D land parcel ULPIN into vertical space using a deterministic hierarchy:
- IN: Country (India)
- MH: State (Maharashtra)
- PUN: District (Pune)
- P001: 2D Land Parcel
- B01: Building Structure
- F03: Floor Level (Floor 3)
- U02: Individual Property Unit
*Note: This is a prototype decision-support identifier and does not replace official government land title records.*`;
  }

  if (lower.includes('how many floors') || lower.includes('floor count')) {
    return `The selected building (${context?.buildingName || 'Tower A - Sahyadri Heights'}) has a total of 7 vertical levels: 1 basement parking level (-1), Ground floor (commercial & lobby), and 5 residential upper floors up to the penthouse terrace.`;
  }

  if (lower.includes('why did validation fail') || lower.includes('validation') || lower.includes('overlap') || lower.includes('warning')) {
    return `Topology validation flagged 1 warning on Floor 2: Unit 203 overlaps with Unit 204 by approximately 2.4 m² along the X=0.6m interior partition line.
This typically happens when CAD floor plans double-assign the structural wall thickness or duct space.
Recommendation: Review the architectural floor plan and adjust the unit demarcation boundary in the cadastral editor before final approval.`;
  }

  if (lower.includes('z coordinate') || lower.includes('what does z mean') || lower.includes('elevation')) {
    return `In 3D vertical property mapping, Z represents the vertical position/elevation of the property above ground datum or Mean Sea Level (MSL). While X (longitude/easting) and Y (latitude/northing) locate the parcel on the earth's surface, Z distinguishes vertically stacked properties (e.g. Ground Floor Z=0m, Floor 1 Z=+3.8m, Floor 3 Z=+10.2m, Basement Z=-3.2m).`;
  }

  if (lower.includes('floor 3') || lower.includes('units on floor 3')) {
    return `Floor 3 contains 4 residential candidate units:
- Unit 301: 1,350 sq.ft (Residential, 3BHK)
- Unit 302: 1,250 sq.ft (Residential, 2BHK)
- Unit 303: 1,350 sq.ft (Residential, 3BHK)
- Unit 304: 1,250 sq.ft (Residential, 2BHK)
All units on Floor 3 share a base elevation of +10.2 m and passed topology validation.`;
  }

  return `VerticalMap 3D Assistant: I have evaluated your query against active cadastral parcel ${context?.parcelId || 'P001'}. You can ask about property boundaries, 3D ULPIN breakdown, Z elevation meanings, floor units, or topology warnings.`;
}
