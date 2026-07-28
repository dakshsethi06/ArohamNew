"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signLords = exports.dashaLords = void 0;
exports.getKPData = getKPData;
exports.dashaLords = [
    { name: "Ketu", years: 7 },
    { name: "Venus", years: 20 },
    { name: "Sun", years: 6 },
    { name: "Moon", years: 10 },
    { name: "Mars", years: 7 },
    { name: "Rahu", years: 18 },
    { name: "Jupiter", years: 16 },
    { name: "Saturn", years: 19 },
    { name: "Mercury", years: 17 }
];
exports.signLords = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];
const TOTAL_DASHA_YEARS = 120;
const NAKSHATRA_DEG = 13 + 1 / 3; // 13.333333 degrees
function getKPData(longitude) {
    // Normalize longitude between 0 and 360
    let l = longitude % 360;
    if (l < 0)
        l += 360;
    // 1. Sign Lord
    const signIndex = Math.floor(l / 30);
    const signLord = exports.signLords[signIndex];
    // 2. Star Lord (Nakshatra Lord)
    const nakshatraIndex = Math.floor(l / NAKSHATRA_DEG);
    const starLordIndex = nakshatraIndex % 9;
    const starLord = exports.dashaLords[starLordIndex].name;
    // 3. Sub Lord
    const degreesInNakshatra = l - (nakshatraIndex * NAKSHATRA_DEG);
    let subLord = "";
    // Start sub-lord sequence from the star lord
    let currentSequenceIndex = starLordIndex;
    let accumulatedDegrees = 0;
    for (let i = 0; i < 9; i++) {
        const lord = exports.dashaLords[currentSequenceIndex];
        const subLordSpan = (lord.years / TOTAL_DASHA_YEARS) * NAKSHATRA_DEG;
        accumulatedDegrees += subLordSpan;
        if (degreesInNakshatra <= accumulatedDegrees + 0.000001) {
            subLord = lord.name;
            break;
        }
        currentSequenceIndex = (currentSequenceIndex + 1) % 9;
    }
    return {
        longitude: l,
        signLord,
        starLord,
        subLord
    };
}
