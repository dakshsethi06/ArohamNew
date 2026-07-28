# Multilingual Support Documentation

This document contains full details and the exact source code implemented for multilingual (internationalization & localization) support in the AnnSetu mobile application.

---

## Architecture Overview

The multilingual support system consists of three primary layers:

1. **Static UI Localization (`i18next` & `react-i18next`)**:
   - Manages pre-defined translations for UI labels, titles, buttons, and static app messages.
   - Detects saved language preferences from `AsyncStorage` or fallback device language settings via `expo-localization`.
   - Locales are stored as JSON dictionaries in `./src/core/localization/locales/` (`en.json`, `hi.json`).

2. **Dynamic Runtime Translation Service (`Azure Translator`)**:
   - Handles real-time translation of dynamic content (such as user-generated text or backend data) from English to Hindi.
   - Utilizes `AsyncStorage` key-value cache (`tr:en:hi:<text>`) to prevent duplicate API requests and optimize network performance.

3. **React Custom Hooks (`useTranslatedText` & `useTranslatedBatch`)**:
   - Provides React components with simple hooks to translate strings or arrays of strings asynchronously without layout shifts.

---

## 1. i18n Configuration & Language Detector

**File Path:** `mobile/src/core/localization/index.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // 1. Check saved language preference first
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      }

      // 2. Otherwise detect device default language
      const locales = Localization.getLocales();
      const systemLanguage = locales[0]?.languageCode || 'en';

      // Only default to en or hi, default to 'en' if system language is something else
      const defaultLanguage = (systemLanguage === 'hi' || systemLanguage === 'en') ? systemLanguage : 'en';
      callback(defaultLanguage);
    } catch (error) {
      console.warn('Error detecting language preference:', error);
      callback('en');
    }
  },
  init: () => { },
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn('Error caching user language preference:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    interpolation: {
      escapeValue: false, // React protects from XSS
    },
    react: {
      useSuspense: false, // Avoid rendering issues in React Native
    }
  });

export default i18n;
```

---

## 2. Dynamic Translation Service (Azure Translator & Caching)

**File Path:** `mobile/src/core/localization/translationService.js`

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION } from '../network/config';

const CACHE_PREFIX = 'tr:en:hi:';
const AZURE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=hi';

/**
 * Translates a single text from English to Hindi using Azure Translator.
 * Uses local AsyncStorage cache first to avoid API requests.
 */
export async function translateText(text, targetLang = 'hi') {
  if (!text || typeof text !== 'string') return text;
  const cleanText = text.trim();
  if (!cleanText) return text;

  // We only translate from English to Hindi right now
  if (targetLang !== 'hi') {
    return text;
  }

  // Check if text has any devanagari/hindi characters (already translated)
  // Devanagari range: \u0900-\u097F
  if (/[\u0900-\u097F]/.test(cleanText)) {
    return text;
  }

  const cacheKey = `${CACHE_PREFIX}${encodeURIComponent(cleanText)}`;
  try {
    const cachedValue = await AsyncStorage.getItem(cacheKey);
    if (cachedValue !== null) {
      return cachedValue;
    }
  } catch (err) {
    console.warn('AsyncStorage get translation error:', err);
  }

  // Not in cache, call API
  if (!AZURE_TRANSLATOR_KEY) {
    console.warn('AZURE_TRANSLATOR_KEY is missing');
    return text;
  }

  try {
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION || 'centralindia',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: cleanText }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Translator API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const translatedText = data?.[0]?.translations?.[0]?.text;

    if (translatedText) {
      try {
        await AsyncStorage.setItem(cacheKey, translatedText);
      } catch (err) {
        console.warn('AsyncStorage set translation error:', err);
      }
      return translatedText;
    }
  } catch (err) {
    console.warn(`Translation failed for text "${cleanText}":`, err.message);
  }

  return text;
}

/**
 * Translates a batch of texts from English to Hindi.
 * Checks cache first, batches API requests for cache misses.
 */
export async function translateBatch(texts, targetLang = 'hi') {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (targetLang !== 'hi') return texts;

  const results = [...texts];
  const misses = []; // Array of { index, cleanText }

  // Check cache for each
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || typeof text !== 'string') continue;
    const cleanText = text.trim();
    if (!cleanText || /[\u0900-\u097F]/.test(cleanText)) continue;

    const cacheKey = `${CACHE_PREFIX}${encodeURIComponent(cleanText)}`;
    try {
      const cachedValue = await AsyncStorage.getItem(cacheKey);
      if (cachedValue !== null) {
        results[i] = cachedValue;
      } else {
        misses.push({ index: i, cleanText });
      }
    } catch (err) {
      console.warn('AsyncStorage error in batch translation:', err);
      misses.push({ index: i, cleanText });
    }
  }

  if (misses.length === 0) {
    return results;
  }

  // Call API for misses
  if (!AZURE_TRANSLATOR_KEY) {
    return results;
  }

  try {
    const requestBody = misses.map(m => ({ Text: m.cleanText }));
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION || 'centralindia',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Translator API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    for (let j = 0; j < data.length; j++) {
      const translatedText = data[j]?.translations?.[0]?.text;
      if (translatedText) {
        const missInfo = misses[j];
        results[missInfo.index] = translatedText;

        const cacheKey = `${CACHE_PREFIX}${encodeURIComponent(missInfo.cleanText)}`;
        try {
          await AsyncStorage.setItem(cacheKey, translatedText);
        } catch (err) {
          // Ignore cache save issues
        }
      }
    }
  } catch (err) {
    console.warn('Batch translation API call failed:', err.message);
  }

  return results;
}

/**
 * Clears all translations cached in AsyncStorage.
 */
export async function clearTranslationCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const translationKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (translationKeys.length > 0) {
      await AsyncStorage.multiRemove(translationKeys);
      console.log(`Cleared ${translationKeys.length} cached translations`);
    }
  } catch (err) {
    console.warn('Failed to clear translation cache:', err);
  }
}
```

---

## 3. Custom Hooks for React Components

**File Path:** `mobile/src/core/hooks/useTranslatedText.js`

```javascript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText, translateBatch } from '../localization/translationService';

/**
 * Custom React hook that automatically translates a given string to the active language (Hindi).
 * If the active language is English, it returns the original string immediately.
 * Shows original text while loading, so there is no layout shift or empty spaces.
 */
export function useTranslatedText(text) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;

    if (currentLang !== 'hi') {
      setTranslated(text);
      return;
    }

    // Translate to Hindi
    translateText(text, 'hi')
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text); // Fallback to original
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, currentLang]);

  return translated;
}

/**
 * Custom hook to translate an array of texts.
 */
export function useTranslatedBatch(textsArray) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [translatedArray, setTranslatedArray] = useState(textsArray);

  useEffect(() => {
    let isMounted = true;

    if (currentLang !== 'hi' || !Array.isArray(textsArray) || textsArray.length === 0) {
      setTranslatedArray(textsArray);
      return;
    }

    translateBatch(textsArray, 'hi')
      .then((res) => {
        if (isMounted) {
          setTranslatedArray(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedArray(textsArray);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(textsArray), currentLang]);

  return translatedArray;
}
```
