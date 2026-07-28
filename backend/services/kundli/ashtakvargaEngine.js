"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAshtakvarga = calculateAshtakvarga;
// BPHS standard rules for Ashtakvarga.
// Keys are the Donor (the reference point).
// Values are 1-indexed houses from the Donor that receive a bindu for the Recipient's BAV.
const SunBAVRules = {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [3, 4, 6, 10, 11, 12]
}; // Total: 8 + 4 + 8 + 7 + 4 + 3 + 8 + 6 = 48
const MoonBAVRules = {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Ascendant: [3, 6, 10, 11]
}; // Total: 6 + 6 + 7 + 8 + 7 + 7 + 4 + 4 = 49
const MarsBAVRules = {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 3, 6, 10, 11]
}; // Total: 5 + 3 + 7 + 4 + 4 + 4 + 7 + 5 = 39
const MercuryBAVRules = {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 2, 4, 6, 8, 10, 11]
}; // Total: 5 + 6 + 8 + 8 + 4 + 8 + 8 + 7 = 54
const JupiterBAVRules = {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Ascendant: [1, 2, 4, 5, 6, 9, 10, 11]
}; // Total: 9 + 5 + 7 + 8 + 8 + 6 + 4 + 8 = 56
const VenusBAVRules = {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
}; // Total: 3 + 9 + 6 + 5 + 5 + 9 + 7 + 8 = 52
const SaturnBAVRules = {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11]
}; // Total: 7 + 3 + 5 + 6 + 4 + 3 + 4 + 6 = 39
const BAVRules = {
    Sun: SunBAVRules,
    Moon: MoonBAVRules,
    Mars: MarsBAVRules,
    Mercury: MercuryBAVRules,
    Jupiter: JupiterBAVRules,
    Venus: VenusBAVRules,
    Saturn: SaturnBAVRules
};
// Helpers
const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
function getSignIndex(signName) {
    return ZODIAC_SIGNS.indexOf(signName);
}
// Target house is 1-indexed (1 to 12). If Donor is in Aries (0), and rule says 2nd house -> Taurus (1).
function getRecipientSignIndex(donorSignIndex, relativeHouse) {
    return (donorSignIndex + relativeHouse - 1) % 12;
}
function calculateAshtakvarga(planets, ascendantSign) {
    // 1. Prepare planet sign indices
    const positions = {};
    for (const p of planets) {
        if (BAVRules[p.name]) {
            positions[p.name] = getSignIndex(p.sign);
        }
    }
    positions['Ascendant'] = getSignIndex(ascendantSign);
    // 2. Initialize matrices
    const bav = {};
    const sav = Array(12).fill(0);
    // 3. Calculate BAV for each of the 7 planets
    for (const recipient of Object.keys(BAVRules)) {
        bav[recipient] = Array(12).fill(0);
        const rules = BAVRules[recipient];
        for (const donor of Object.keys(rules)) {
            const donorSignIndex = positions[donor];
            if (donorSignIndex === undefined)
                continue;
            const housesToBindu = rules[donor];
            for (const relativeHouse of housesToBindu) {
                const targetSignIndex = getRecipientSignIndex(donorSignIndex, relativeHouse);
                bav[recipient][targetSignIndex] += 1;
                sav[targetSignIndex] += 1;
            }
        }
    }
    return {
        bav,
        sav
    };
}
