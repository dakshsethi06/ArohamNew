"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKPHouses = calculateKPHouses;
const circular_natal_horoscope_js_1 = require("circular-natal-horoscope-js");
const kpEngine_1 = require("./kpEngine");
function calculateKPHouses(year, month, date, hour, minute, latitude, longitude) {
    const origin = new circular_natal_horoscope_js_1.Origin({
        year,
        month: month - 1, // JS months are 0-indexed in Date, but circular-natal-horoscope-js expects 0-indexed month? Wait, their docs say January is 0. So month - 1.
        date,
        hour,
        minute,
        latitude,
        longitude
    });
    const horoscope = new circular_natal_horoscope_js_1.Horoscope({
        origin: origin,
        houseSystem: 'placidus',
        zodiac: 'sidereal',
        aspectPoints: ['bodies', 'points', 'angles'],
        aspectWithPoints: ['bodies', 'points', 'angles'],
        aspectTypes: ['major', 'minor'],
        customOrbs: {},
        language: 'en'
    });
    const cusps = [];
    for (const h of horoscope.Houses) {
        const degree = h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
        const kpData = (0, kpEngine_1.getKPData)(degree);
        // Circular natal horoscope JS starts houses at Ascendant = 1.
        cusps.push({
            houseNumber: h.id,
            degree: degree,
            signLord: kpData.signLord,
            starLord: kpData.starLord,
            subLord: kpData.subLord
        });
    }
    // Sort by house number just in case
    cusps.sort((a, b) => a.houseNumber - b.houseNumber);
    return cusps;
}
