"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvakhadaDetails = getAvakhadaDetails;
function getAvakhadaDetails(moonLongitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const naks = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
        'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    const signIndex = Math.floor(moonLongitude / 30) % 12;
    const nakIndex = Math.floor(moonLongitude / (360 / 27)) % 27;
    const pada = Math.floor((moonLongitude % (360 / 27)) / ((360 / 27) / 4)) + 1;
    const sign = signs[signIndex];
    const nakshatra = naks[nakIndex];
    // Varna
    let varna = 'Unknown';
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sign))
        varna = 'Brahmin (Priest)';
    else if (['Aries', 'Leo', 'Sagittarius'].includes(sign))
        varna = 'Kshatriya (Warrior)';
    else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign))
        varna = 'Vaishya (Merchant)';
    else if (['Gemini', 'Libra', 'Aquarius'].includes(sign))
        varna = 'Shudra (Laborer)';
    // Vashya
    let vashya = 'Unknown';
    if (['Aries', 'Taurus', 'Leo'].includes(sign) || (sign === 'Sagittarius' && pada >= 3))
        vashya = 'Chatushpada (Quadruped)';
    else if (['Gemini', 'Virgo', 'Libra', 'Aquarius'].includes(sign) || (sign === 'Sagittarius' && pada <= 2))
        vashya = 'Manav (Human)';
    else if (['Cancer', 'Pisces'].includes(sign) || (sign === 'Capricorn' && pada >= 3))
        vashya = 'Jalchar (Water)';
    else if (sign === 'Scorpio')
        vashya = 'Keeta (Insect)';
    // Yoni (by Nakshatra)
    const yoniMap = {
        0: 'Ashwa (Horse)', 1: 'Gaja (Elephant)', 2: 'Mesha (Ram)', 3: 'Sarpa (Serpent)',
        4: 'Sarpa (Serpent)', 5: 'Shwan (Dog)', 6: 'Marjar (Cat)', 7: 'Mesha (Ram)',
        8: 'Marjar (Cat)', 9: 'Mushak (Rat)', 10: 'Mushak (Rat)', 11: 'Gau (Cow)',
        12: 'Mahish (Buffalo)', 13: 'Vyaghra (Tiger)', 14: 'Mahish (Buffalo)', 15: 'Vyaghra (Tiger)',
        16: 'Mriga (Deer)', 17: 'Mriga (Deer)', 18: 'Shwan (Dog)', 19: 'Vanar (Monkey)',
        20: 'Nakul (Mongoose)', 21: 'Vanar (Monkey)', 22: 'Simha (Lion)', 23: 'Ashwa (Horse)',
        24: 'Simha (Lion)', 25: 'Gau (Cow)', 26: 'Gaja (Elephant)'
    };
    const yoni = yoniMap[nakIndex] || 'Unknown';
    // Gan
    let gan = 'Manushya (Human)'; // Default most
    const devGanas = [0, 4, 6, 7, 12, 14, 21, 26];
    const rakshasGanas = [2, 8, 9, 13, 15, 17, 18, 22, 23];
    if (devGanas.includes(nakIndex))
        gan = 'Deva (Divine)';
    else if (rakshasGanas.includes(nakIndex))
        gan = 'Rakshasa (Demon)';
    // Nadi
    let nadi = 'Madhya (Middle)';
    const adiNadi = [0, 5, 6, 11, 12, 17, 18, 23, 24];
    const antyaNadi = [2, 3, 8, 9, 14, 15, 20, 21, 26];
    if (adiNadi.includes(nakIndex))
        nadi = 'Adi (First)';
    else if (antyaNadi.includes(nakIndex))
        nadi = 'Antya (Last)';
    // Tatva (by Moon Sign)
    let tatva = 'Unknown';
    if (['Aries', 'Leo', 'Sagittarius'].includes(sign))
        tatva = 'Agni (Fire)';
    else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign))
        tatva = 'Prithvi (Earth)';
    else if (['Gemini', 'Libra', 'Aquarius'].includes(sign))
        tatva = 'Vayu (Air)';
    else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign))
        tatva = 'Jal (Water)';
    // Paya
    let paya = 'Silver';
    // Simplified logic: Depends on Nakshatra grouping
    if (nakIndex % 4 === 0)
        paya = 'Gold';
    else if (nakIndex % 4 === 1)
        paya = 'Silver';
    else if (nakIndex % 4 === 2)
        paya = 'Copper';
    else
        paya = 'Iron';
    // Yunja
    let yunja = 'Pratham';
    if (nakIndex % 3 === 1)
        yunja = 'Madhya';
    else if (nakIndex % 3 === 2)
        yunja = 'Antya';
    // Name Alphabet mapping (108 syllables total)
    const nameSyllables = [
        ["Chu", "Che", "Cho", "La"], // Ashwini
        ["Li", "Lu", "Le", "Lo"], // Bharani
        ["A", "I", "U", "E"], // Krittika
        ["O", "Va", "Vi", "Vu"], // Rohini
        ["Ve", "Vo", "Ka", "Ki"], // Mrigashira
        ["Ku", "Gha", "Ng", "Chha"], // Ardra
        ["Ke", "Ko", "Ha", "Hi"], // Punarvasu
        ["Hu", "He", "Ho", "Da"], // Pushya
        ["Di", "Du", "De", "Do"], // Ashlesha
        ["Ma", "Mi", "Mu", "Me"], // Magha
        ["Mo", "Ta", "Ti", "Tu"], // Purva Phalguni
        ["Te", "To", "Pa", "Pi"], // Uttara Phalguni
        ["Pu", "Sha", "Na", "Tha"], // Hasta
        ["Pe", "Po", "Ra", "Ri"], // Chitra
        ["Ru", "Re", "Ro", "Ta"], // Swati
        ["Ti", "Tu", "Te", "To"], // Vishakha
        ["Na", "Ni", "Nu", "Ne"], // Anuradha
        ["No", "Ya", "Yi", "Yu"], // Jyeshtha
        ["Ye", "Yo", "Bha", "Bhi"], // Mula
        ["Bhu", "Dha", "Bha", "Dha"], // Purva Ashadha
        ["Bhe", "Bho", "Ja", "Ji"], // Uttara Ashadha
        ["Ju", "Je", "Jo", "Gha"], // Shravana
        ["Ga", "Gi", "Gu", "Ge"], // Dhanishta
        ["Go", "Sa", "Si", "Su"], // Shatabhisha
        ["Se", "So", "Da", "Di"], // Purva Bhadrapada
        ["Du", "Tha", "Jha", "Da"], // Uttara Bhadrapada
        ["De", "Do", "Cha", "Chi"] // Revati
    ];
    let nameAlphabet = 'Unknown';
    if (nameSyllables[nakIndex] && nameSyllables[nakIndex][pada - 1]) {
        nameAlphabet = nameSyllables[nakIndex][pada - 1];
    }
    // Sign Lord mapping
    const signLords = {
        'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
        'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return {
        Nakshatra: nakshatra,
        Charan: pada,
        Sign: sign,
        SignLord: signLords[sign] || 'Unknown',
        Varna: varna,
        Vashya: vashya,
        Yoni: yoni,
        Gan: gan,
        Nadi: nadi,
        Tatva: tatva,
        Paya: paya,
        Yunja: yunja,
        NameAlphabet: nameAlphabet
    };
}
