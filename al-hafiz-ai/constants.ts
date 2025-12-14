import { Surah } from './types';

export const SURAHS: Surah[] = [
  {
    id: 112,
    name: "سورة الإخلاص",
    nameEnglish: "Al-Ikhlas",
    verses: [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "قُلْ هُوَ اللَّهُ أَحَدٌ",
      "اللَّهُ الصَّمَدُ",
      "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
    ]
  },
  {
    id: 113,
    name: "سورة الفلق",
    nameEnglish: "Al-Falaq",
    verses: [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      "مِن شَرِّ مَا خَلَقَ",
      "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
      "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
    ]
  },
  {
    id: 114,
    name: "سورة الناس",
    nameEnglish: "An-Naas",
    verses: [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      "مَلِكِ النَّاسِ",
      "إِلَٰهِ النَّاسِ",
      "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
      "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
      "مِنَ الْجِنَّةِ وَالنَّاسِ"
    ]
  }
];

export const SYSTEM_INSTRUCTION = (surahName: string) => `
You are a gentle and knowledgeable Quran teacher (Sheikh). 
The user is a student reciting ${surahName}.

Your task:
1. Listen silently as the user recites.
2. If the user makes a clear mistake in words or missing verses, gently interrupt and correct them by reciting the correct verse or word.
3. If the user stops for too long (more than 5 seconds), prompt them with the next word.
4. When the user finishes the Surah correctly, say "Barak Allahu Feek" and give a very brief summary of their performance.
5. Keep your responses short and focused solely on the recitation correction unless the user asks a question.

Language: Speak in clear Arabic suitable for a Quran teacher.
`;