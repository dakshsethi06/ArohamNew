"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVimshottariDasha = calculateVimshottariDasha;
exports.calculateYoginiDasha = calculateYoginiDasha;
const VIMSHOTTARI_SEQUENCE = [
    { planet: 'Ketu', years: 7 },
    { planet: 'Venus', years: 20 },
    { planet: 'Sun', years: 6 },
    { planet: 'Moon', years: 10 },
    { planet: 'Mars', years: 7 },
    { planet: 'Rahu', years: 18 },
    { planet: 'Jupiter', years: 16 },
    { planet: 'Saturn', years: 19 },
    { planet: 'Mercury', years: 17 }
];
const YOGINI_SEQUENCE = [
    { planet: 'Mangala (Moon)', years: 1 },
    { planet: 'Pingala (Sun)', years: 2 },
    { planet: 'Dhanya (Jupiter)', years: 3 },
    { planet: 'Bhramari (Mars)', years: 4 },
    { planet: 'Bhadrika (Mercury)', years: 5 },
    { planet: 'Ulka (Saturn)', years: 6 },
    { planet: 'Siddha (Venus)', years: 7 },
    { planet: 'Sankata (Rahu)', years: 8 }
];
const TOTAL_VIMSHOTTARI_YEARS = 120;
const TOTAL_YOGINI_YEARS = 36;
const NAKSHATRA_SPAN = 13 + (20 / 60); // 13.333333 degrees
function addYears(date, years) {
    const days = years * 365.2425;
    const ms = Math.round(days * 24 * 60 * 60 * 1000);
    return new Date(date.getTime() + ms);
}
function calculateVimshottariDasha(moonLongitude, birthDate) {
    const nakshatraValue = moonLongitude / NAKSHATRA_SPAN;
    const nakshatraIndex = Math.floor(nakshatraValue);
    const fractionRemaining = 1 - (nakshatraValue - nakshatraIndex);
    const startDashaIndex = nakshatraIndex % 9;
    const firstDasha = VIMSHOTTARI_SEQUENCE[startDashaIndex];
    const balanceYears = firstDasha.years * fractionRemaining;
    let currentStartDate = new Date(birthDate.getTime());
    const timeline = [];
    for (let i = 0; i < 9; i++) {
        const dashaIndex = (startDashaIndex + i) % 9;
        const mdPlanet = VIMSHOTTARI_SEQUENCE[dashaIndex];
        const activeYears = (i === 0) ? balanceYears : mdPlanet.years;
        const mahadashaEnd = addYears(currentStartDate, activeYears);
        const mahadashaPeriod = {
            planet: mdPlanet.planet,
            start: new Date(currentStartDate.getTime()),
            end: new Date(mahadashaEnd.getTime()),
            duration: mdPlanet.years,
            antardashas: []
        };
        const theoreticalMdStart = (i === 0) ? addYears(currentStartDate, -(mdPlanet.years - balanceYears)) : currentStartDate;
        let adStartDate = new Date(theoreticalMdStart.getTime());
        for (let j = 0; j < 9; j++) {
            const adIndex = (dashaIndex + j) % 9;
            const adPlanet = VIMSHOTTARI_SEQUENCE[adIndex];
            const adDurationYears = (mdPlanet.years * adPlanet.years) / TOTAL_VIMSHOTTARI_YEARS;
            const adEndDate = addYears(adStartDate, adDurationYears);
            if (adEndDate > birthDate) {
                const actualAdStart = adStartDate < birthDate ? new Date(birthDate.getTime()) : new Date(adStartDate.getTime());
                const actualAdEnd = adEndDate > mahadashaEnd ? new Date(mahadashaEnd.getTime()) : new Date(adEndDate.getTime());
                const antardasha = {
                    planet: adPlanet.planet,
                    start: actualAdStart,
                    end: actualAdEnd,
                    duration: adDurationYears,
                    pratyantardashas: []
                };
                // Level 3: Pratyantar Dasha (PD)
                let pdStartDate = new Date(adStartDate.getTime());
                for (let k = 0; k < 9; k++) {
                    const pdIndex = (adIndex + k) % 9;
                    const pdPlanet = VIMSHOTTARI_SEQUENCE[pdIndex];
                    const pdDurationYears = (adDurationYears * pdPlanet.years) / TOTAL_VIMSHOTTARI_YEARS;
                    const pdEndDate = addYears(pdStartDate, pdDurationYears);
                    if (pdEndDate > birthDate) {
                        const actualPdStart = pdStartDate < birthDate ? new Date(birthDate.getTime()) : new Date(pdStartDate.getTime());
                        const actualPdEnd = pdEndDate > actualAdEnd ? new Date(actualAdEnd.getTime()) : new Date(pdEndDate.getTime());
                        antardasha.pratyantardashas.push({
                            planet: pdPlanet.planet,
                            start: actualPdStart,
                            end: actualPdEnd,
                            duration: pdDurationYears
                        });
                    }
                    pdStartDate = new Date(pdEndDate.getTime());
                }
                mahadashaPeriod.antardashas.push(antardasha);
            }
            adStartDate = new Date(adEndDate.getTime());
        }
        timeline.push(mahadashaPeriod);
        currentStartDate = new Date(mahadashaEnd.getTime());
    }
    return timeline;
}
function calculateYoginiDasha(moonLongitude, birthDate) {
    const nakshatraValue = moonLongitude / NAKSHATRA_SPAN;
    const nakshatraIndex = Math.floor(nakshatraValue);
    const fractionRemaining = 1 - (nakshatraValue - nakshatraIndex);
    // Rule: (Nakshatra Index + 3) % 8
    const startYoginiIndex = (nakshatraIndex + 3) % 8;
    const firstYogini = YOGINI_SEQUENCE[startYoginiIndex];
    const balanceYears = firstYogini.years * fractionRemaining;
    let currentStartDate = new Date(birthDate.getTime());
    const timeline = [];
    // Yogini Dasha loops every 36 years. We'll generate 3 full cycles (108 years)
    for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < 8; i++) {
            const yoginiIndex = (startYoginiIndex + i) % 8;
            const yogini = YOGINI_SEQUENCE[yoginiIndex];
            const activeYears = (cycle === 0 && i === 0) ? balanceYears : yogini.years;
            const yoginiEnd = addYears(currentStartDate, activeYears);
            timeline.push({
                planet: yogini.planet,
                start: new Date(currentStartDate.getTime()),
                end: new Date(yoginiEnd.getTime()),
                duration: yogini.years
            });
            currentStartDate = new Date(yoginiEnd.getTime());
        }
    }
    return timeline;
}
