"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const groq_1 = require("@langchain/groq");
const langgraph_1 = require("@langchain/langgraph");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("./prompts");
const pdfService_1 = require("./pdfService");
const insightsEngine_1 = require("./insightsEngine");
const supabaseClient_1 = require("./supabaseClient");
const geo_tz_1 = __importDefault(require("geo-tz"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const avakhada_lookup_json_1 = __importDefault(require("./avakhada_lookup.json"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3001;
// 1. The Math API (VedAstro Tool) - POST Request
const getAstrologyChartTool = (0, tools_1.tool)(async ({ location, date, time }, config) => {
    try {
        // 1. Fetch exact geographic coordinates and full location name
        const geoUrl = `https://api.vedastro.org/api/Calculate/AddressToGeoLocation/Address/${encodeURIComponent(location)}`;
        console.log('Calling VedAstro GeoLocation:', geoUrl);
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok)
            throw new Error(`Geo API Error: ${geoRes.statusText}`);
        const geoData = await geoRes.json();
        const resolved = {
            Name: geoData?.Payload?.AddressToGeoLocation?.Name || location,
            Longitude: geoData?.Payload?.AddressToGeoLocation?.Longitude,
            Latitude: geoData?.Payload?.AddressToGeoLocation?.Latitude
        };
        console.log(`Resolved Location: ${resolved.Name} (${resolved.Latitude}, ${resolved.Longitude})`);
        // 2. Fetch full astrology chart data using the exact location
        const dataUrl = `https://api.vedastro.org/api/Calculate/AllPlanetData/PlanetName/All/Location/${encodeURIComponent(resolved.Name)}/Time/${time}/${date}/+05:30`;
        console.log(`Calling VedAstro GET: ${dataUrl}`);
        const dataRes = await fetch(dataUrl);
        if (!dataRes.ok)
            throw new Error(`VedAstro API Error: ${await dataRes.text()}`);
        const chartData = await dataRes.json();
        // Save the full payload to disk for the PDF generator
        const threadId = config?.configurable?.thread_id;
        if (threadId) {
            fs_1.default.writeFileSync(`chart_${threadId}.json`, JSON.stringify({
                ResolvedExactLocation: resolved,
                ChartData: chartData
            }));
        }
        // Return a deeply summarized version to the LLM to prevent hitting Groq's 12k TPM token limit
        const planets = chartData.Payload?.AllPlanetData || [];
        const summary = planets.map((p) => {
            const planetName = Object.keys(p)[0];
            const planetData = p[planetName];
            const sign = planetData?.PlanetRasiD1Sign?.Name || 'Unknown';
            const deg = planetData?.PlanetRasiD1Sign?.DegreesIn?.DegreeMinuteSecond || 'Unknown';
            return `${planetName}: ${sign} at ${deg}`;
        }).join('\n');
        return JSON.stringify({
            ResolvedExactLocation: resolved,
            AstrologicalSummary: summary
        });
    }
    catch (e) {
        console.error('getAstrologyChartTool Error:', e);
        return `Error fetching astrological data: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
}, {
    name: 'getAstrologyChartTool',
    description: 'Fetch complete astrological data (planet positions, strengths, etc.) for a given birth location, time, and date using VedAstro API.',
    schema: zod_1.z.object({
        location: zod_1.z.string().describe('The city or location of birth (e.g. London, Delhi)'),
        time: zod_1.z.string().describe('The time of birth in HH:MM format (e.g. 10:30)'),
        date: zod_1.z.string().describe('The date of birth in DD/MM/YYYY format (e.g. 15/08/1990)'),
    }),
});
const llm = new groq_1.ChatGroq({
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0,
});
const tools = [getAstrologyChartTool];
const toolNode = new prebuilt_1.ToolNode(tools);
const llmWithTools = llm.bindTools(tools);
// 3. The LangGraph Orchestration
const systemPrompt = prompts_1.ASTROLOGY_BOT_SYSTEM_PROMPT;
const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
    .addNode("agent", async (state) => {
    const messages = state.messages;
    const hasSystemMessage = messages.length > 0 && messages[0]._getType() === 'system';
    const finalMessages = hasSystemMessage
        ? messages
        : [new messages_1.SystemMessage(systemPrompt), ...messages];
    try {
        const response = await llmWithTools.invoke(finalMessages);
        return { messages: [response] };
    }
    catch (e) {
        console.error("LLM Error:", e.message);
        const fallback = new messages_1.AIMessage("There was a network or server error connecting to the Groq API. Please try again.");
        return { messages: [fallback] };
    }
})
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
    }
    return "__end__";
})
    .addEdge("tools", "agent");
const checkpointer = new langgraph_1.MemorySaver();
const appGraph = workflow.compile({ checkpointer });
app.post('/api/init-kundli', async (req, res) => {
    const { details, thread_id } = req.body;
    try {
        console.log("Initializing Kundli for", details.name);
        // 1. Save user to Supabase
        let { data: user, error: userError } = await supabaseClient_1.supabase
            .from('users')
            .insert([
            {
                name: details.name,
                gender: details.gender,
                location: details.location,
                date: details.date,
                time: details.time
            }
        ])
            .select()
            .single();
        if (userError)
            throw userError;
        // 2. Fetch exact geographic coordinates
        const encodedLoc = encodeURIComponent(details.location);
        const geoUrl = `https://api.vedastro.org/api/Calculate/AddressToGeoLocation/Address/${encodedLoc}`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok)
            throw new Error(`Geo API Error: ${geoRes.statusText}`);
        const geoData = await geoRes.json();
        const resolvedLoc = {
            Name: geoData?.Payload?.AddressToGeoLocation?.Name || details.location,
            Longitude: geoData?.Payload?.AddressToGeoLocation?.Longitude,
            Latitude: geoData?.Payload?.AddressToGeoLocation?.Latitude
        };
        // Calculate timezone dynamically using geo-tz and moment-timezone
        let timezone = '+05:30'; // fallback
        if (resolvedLoc.Latitude && resolvedLoc.Longitude) {
            try {
                const tzName = geo_tz_1.default.find(resolvedLoc.Latitude, resolvedLoc.Longitude)[0];
                if (tzName) {
                    const [day, month, year] = details.date.split('/');
                    const m = moment_timezone_1.default.tz(`${year}-${month}-${day} ${details.time}`, 'YYYY-MM-DD HH:mm', tzName);
                    timezone = m.format('Z'); // returns like +05:30 or -04:00
                }
            }
            catch (e) {
                console.error("Timezone detection error:", e);
            }
        }
        // Replace slashes in date for VedAstro URL
        const cleanDate = details.date.replace(/\//g, '/');
        const encodedResolvedName = encodeURIComponent(resolvedLoc.Name);
        // Prepare parallel VedAstro fetches
        const baseUrl = `https://api.vedastro.org/api/Calculate`;
        const locTimeParams = `Location/${encodedResolvedName}/Time/${details.time}/${cleanDate}/${timezone}`;
        const [planetRes, houseRes, tithiRes, yogaRes, karanaRes, sunriseRes, sunsetRes, moonNakshatraRes, uranusRes, neptuneRes, plutoRes] = await Promise.all([
            fetch(`${baseUrl}/AllPlanetData/PlanetName/All/${locTimeParams}`),
            fetch(`${baseUrl}/AllHouseData/HouseName/All/${locTimeParams}`),
            fetch(`${baseUrl}/Tithi/${locTimeParams}`),
            fetch(`${baseUrl}/NithyaYoga/${locTimeParams}`),
            fetch(`${baseUrl}/Karana/${locTimeParams}`),
            fetch(`${baseUrl}/SunriseTime/${locTimeParams}`),
            fetch(`${baseUrl}/SunsetTime/${locTimeParams}`),
            fetch(`${baseUrl}/MoonNakshatra/${locTimeParams}`),
            fetch(`${baseUrl}/AllPlanetData/PlanetName/Uranus/${locTimeParams}`),
            fetch(`${baseUrl}/AllPlanetData/PlanetName/Neptune/${locTimeParams}`),
            fetch(`${baseUrl}/AllPlanetData/PlanetName/Pluto/${locTimeParams}`)
        ]);
        const planetData = await planetRes.json().catch(() => ({}));
        const houseData = await houseRes.json().catch(() => ({}));
        const tithiData = await tithiRes.json().catch(() => ({}));
        const yogaData = await yogaRes.json().catch(() => ({}));
        const karanaData = await karanaRes.json().catch(() => ({}));
        const sunriseData = await sunriseRes.json().catch(() => ({}));
        const sunsetData = await sunsetRes.json().catch(() => ({}));
        const moonNakshatraData = await moonNakshatraRes.json().catch(() => ({}));
        // Extract outer planets and merge them into the core planet array
        const uranusData = await uranusRes.json().catch(() => ({}));
        const neptuneData = await neptuneRes.json().catch(() => ({}));
        const plutoData = await plutoRes.json().catch(() => ({}));
        const allPlanetsList = planetData?.Payload?.AllPlanetData || [];
        if (uranusData?.Payload)
            allPlanetsList.push(uranusData.Payload.Uranus || Object.values(uranusData.Payload)[0] ? { "Uranus": uranusData.Payload.Uranus || Object.values(uranusData.Payload)[0] } : null);
        if (neptuneData?.Payload)
            allPlanetsList.push(neptuneData.Payload.Neptune || Object.values(neptuneData.Payload)[0] ? { "Neptune": neptuneData.Payload.Neptune || Object.values(neptuneData.Payload)[0] } : null);
        if (plutoData?.Payload)
            allPlanetsList.push(plutoData.Payload.Pluto || Object.values(plutoData.Payload)[0] ? { "Pluto": plutoData.Payload.Pluto || Object.values(plutoData.Payload)[0] } : null);
        // Filter out nulls
        const finalPlanetList = allPlanetsList.filter((p) => p != null);
        // Calculate Avakhada
        let moonNakshatraName = 'Unknown';
        let moonCharan = 1;
        let signLord = 'Unknown';
        let moonSign = 'Unknown';
        let moonHouse = 1;
        try {
            const moonNakStr = moonNakshatraData?.Payload?.MoonNakshatra || '';
            // e.g. "Rohini - 4"
            const parts = moonNakStr.split('-');
            moonNakshatraName = parts[0]?.trim() || 'Unknown';
            if (parts[1])
                moonCharan = parseInt(parts[1].trim()) || 1;
            const planets = finalPlanetList;
            const houseList = houseData?.Payload?.AllHouseData || [];
            const moonObj = planets.find((p) => p.Moon);
            if (moonObj && moonObj.Moon) {
                if (moonObj.Moon.PlanetRasiD1Sign) {
                    moonSign = moonObj.Moon.PlanetRasiD1Sign.Name;
                }
                if (moonObj.Moon.PlanetLordOfZodiacSign) {
                    signLord = moonObj.Moon.PlanetLordOfZodiacSign.Name;
                }
            }
            // Find Lagna Sign
            let lagnaSignName = 'Aries';
            const lagnaHouse = houseList.find((h) => h.House1);
            if (lagnaHouse && lagnaHouse.House1.HouseRasiSign) {
                lagnaSignName = lagnaHouse.House1.HouseRasiSign.Name;
            }
            const ZODIAC_SIGNS = [
                'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
            ];
            const lagnaIndex = ZODIAC_SIGNS.indexOf(lagnaSignName);
            const moonSignIndex = ZODIAC_SIGNS.indexOf(moonSign);
            if (lagnaIndex !== -1 && moonSignIndex !== -1) {
                moonHouse = ((moonSignIndex - lagnaIndex + 12) % 12) + 1;
            }
        }
        catch (e) {
            console.error("Error calculating advanced Avakhada:", e);
        }
        // Paya Calculation
        let paya = 'Unknown';
        if ([1, 6, 11].includes(moonHouse))
            paya = 'Loha (Iron)';
        else if ([3, 7, 10].includes(moonHouse))
            paya = 'Tamra (Copper)';
        else if ([2, 5, 9].includes(moonHouse))
            paya = 'Rajat (Silver)';
        else if ([4, 8, 12].includes(moonHouse))
            paya = 'Swarna (Gold)';
        const nakProps = avakhada_lookup_json_1.default.Nakshatra[moonNakshatraName] || {};
        const rashiProps = avakhada_lookup_json_1.default.Rashi[moonSign] || {};
        let nameAlphabet = 'Unknown';
        if (nakProps.Syllables && nakProps.Syllables.length >= moonCharan) {
            nameAlphabet = nakProps.Syllables[moonCharan - 1];
        }
        const avakhada = {
            Nakshatra: moonNakshatraName,
            Charan: moonCharan,
            NameAlphabet: nameAlphabet,
            Sign: moonSign,
            SignLord: signLord,
            Paya: paya,
            Yunja: nakProps.Yunja || 'Unknown',
            Gan: nakProps.Gan || 'Unknown',
            Nadi: nakProps.Nadi || 'Unknown',
            Yoni: nakProps.Yoni || 'Unknown',
            Varna: rashiProps.Varna || 'Unknown',
            Tatva: rashiProps.Tatva || 'Unknown'
        };
        const raw_chart_data = {
            ResolvedExactLocation: resolvedLoc,
            Panchang: {
                Tithi: tithiData?.Payload?.Tithi || 'Unknown',
                Yoga: yogaData?.Payload?.NithyaYoga || 'Unknown',
                Karana: karanaData?.Payload?.Karana || 'Unknown',
                Sunrise: sunriseData?.Payload?.SunriseTime || 'Unknown',
                Sunset: sunsetData?.Payload?.SunsetTime || 'Unknown',
                MoonNakshatra: moonNakshatraName,
                Avakhada: avakhada
            },
            ChartData: {
                AllPlanetData: finalPlanetList,
                AllHouseData: houseData?.Payload?.AllHouseData || []
            }
        };
        // 3. Create a report record linked to this thread
        let { error: reportError } = await supabaseClient_1.supabase
            .from('reports')
            .insert([
            {
                user_id: user.id,
                thread_id: thread_id,
                raw_chart_data: raw_chart_data
            }
        ]);
        if (reportError)
            throw reportError;
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// Priority 4: Background Insight Generation
app.post('/api/generate-insights', async (req, res) => {
    const { thread_id } = req.body;
    if (!thread_id) {
        return res.status(400).json({ error: "Missing thread_id" });
    }
    try {
        // 1. Fetch the raw chart data from Supabase
        const { data: report, error: fetchError } = await supabaseClient_1.supabase
            .from('reports')
            .select('raw_chart_data')
            .eq('thread_id', thread_id)
            .single();
        if (fetchError || !report)
            throw fetchError || new Error("Report not found");
        // 2. Generate Insights via LangChain
        const insights = await (0, insightsEngine_1.generateInsights)(report.raw_chart_data);
        if (!insights) {
            throw new Error("Failed to generate AI insights");
        }
        // 3. Inject insights into the JSONB raw_chart_data column
        const updatedChartData = {
            ...report.raw_chart_data,
            ai_insights: insights
        };
        const { error: updateError } = await supabaseClient_1.supabase
            .from('reports')
            .update({ raw_chart_data: updatedChartData })
            .eq('thread_id', thread_id);
        if (updateError)
            throw updateError;
        res.json({ success: true, insights });
    }
    catch (err) {
        console.error("Generate insights error:", err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/chat', async (req, res) => {
    try {
        const { message, thread_id } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const threadId = thread_id || 'default_thread';
        const result = await appGraph.invoke({ messages: [new messages_1.HumanMessage(message)] }, { configurable: { thread_id: threadId } });
        const agentMessage = result.messages[result.messages.length - 1];
        res.json({
            reply: agentMessage.content,
            thread_id: threadId
        });
    }
    catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/api/generate-report', async (req, res) => {
    try {
        const { thread_id, user_name } = req.body;
        if (!thread_id)
            return res.status(400).json({ error: 'thread_id is required' });
        // 1. Fetch the report and user info from Supabase
        const { data: report, error: dbError } = await supabaseClient_1.supabase
            .from('reports')
            .select('raw_chart_data, users(time, date)')
            .eq('thread_id', thread_id)
            .single();
        if (dbError || !report) {
            return res.status(400).json({ error: "No chart data found in database. Please generate your Kundli first." });
        }
        const chartData = report.raw_chart_data;
        // @ts-ignore - Supabase join typing
        const userTime = report.users?.time || '00:00';
        // @ts-ignore
        const userDate = report.users?.date || '01/01/2000';
        // 2. Fetch optional historical state from LangGraph memory for the insights page
        let writtenInsights = "Your premium Kundli charts have been dynamically generated based on your exact birth details.";
        try {
            const state = await appGraph.getState({ configurable: { thread_id } });
            if (state && state.values && state.values.messages) {
                const messages = state.values.messages;
                const lastAiMessage = [...messages].reverse().find(m => m._getType() === 'ai' && m.content && (!m.tool_calls || m.tool_calls.length === 0));
                if (lastAiMessage)
                    writtenInsights = lastAiMessage.content;
            }
        }
        catch (e) {
            // Memory state not found, ignore
        }
        // 3. Run the PDF compilation pipeline
        const pdfBuffer = await (0, pdfService_1.compileAstrologyPdf)(chartData, userTime, userDate, user_name || 'Valued User', writtenInsights);
        // 4. Stream direct to client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=kundli-report.pdf");
        res.send(Buffer.from(pdfBuffer));
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
