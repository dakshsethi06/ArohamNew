"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsights = generateInsights;
const groq_1 = require("@langchain/groq");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const InsightsSchema = zod_1.z.object({
    ascendant_profile: zod_1.z.string().describe("A 3-4 paragraph deep dive into the user's Ascendant (Lagna) sign, its lord, and what it means for their personality and physical existence."),
    yogas: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().describe("Name of the Yoga (e.g. Gaja Kesari Yoga, Mangal Dosha, Neechbhanga Raj Yoga)"),
        description: zod_1.z.string().describe("A 1-2 paragraph description of how this yoga is formed in this chart and its effects on the native's life.")
    })).describe("Identify 2-3 prominent yogas or doshas found in the chart based on the planetary positions."),
    gemstones: zod_1.z.array(zod_1.z.object({
        gemstone: zod_1.z.string().describe("Name of the gemstone (e.g. Yellow Sapphire, Ruby, Emerald)"),
        planet: zod_1.z.string().describe("The planet this gemstone represents"),
        reason: zod_1.z.string().describe("Why this gemstone is recommended based on their benefic planets and ascendant lord.")
    })).describe("Recommend 2-3 gemstones for the native based on their beneficial planets.")
});
async function generateInsights(chartData) {
    const allPlanetData = chartData.ChartData?.AllPlanetData || [];
    const allHouseData = chartData.ChartData?.AllHouseData || [];
    // Simplify data so we don't blow up the context window
    const simplifiedPlanets = allPlanetData.map((p) => {
        const planetName = Object.keys(p)[0];
        const planetData = p[planetName];
        return {
            planet: planetName,
            sign: planetData?.PlanetRasiD1Sign?.Name || '-',
            degrees: planetData?.PlanetRasiD1Sign?.DegreesIn?.DegreeMinuteSecond || '-',
            strength: planetData?.PlanetStrength ? parseFloat(planetData.PlanetStrength).toFixed(2) : '-'
        };
    });
    let ascendantSign = 'Unknown';
    const lagnaHouse = allHouseData.find((h) => h.House1);
    if (lagnaHouse && lagnaHouse.House1['HouseRasiSign']) {
        ascendantSign = lagnaHouse.House1['HouseRasiSign'].Name;
    }
    const astrologyContext = `
Ascendant (Lagna) Sign: ${ascendantSign}
Planetary Positions in D1 (Rasi) Chart:
${JSON.stringify(simplifiedPlanets, null, 2)}
`;
    const llm = new groq_1.ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        apiKey: process.env.GROQ_API_KEY
    });
    const structuredLlm = llm.withStructuredOutput(InsightsSchema);
    const prompt = `You are an expert Vedic Astrologer. Analyze the following astrological data and provide a comprehensive reading.
Use authentic Vedic terminology.

Astrological Data:
${astrologyContext}

Generate the Ascendant Profile, identify key Yogas/Doshas, and recommend suitable Gemstones based on benefic planets for this specific Ascendant.
`;
    try {
        const response = await structuredLlm.invoke(prompt);
        return response;
    }
    catch (error) {
        console.error("Error generating insights:", error);
        return null;
    }
}
