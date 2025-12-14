import React, { useState } from 'react';
import { Surah, AppView } from './types';
import { SURAHS } from './constants';
import { SurahCard } from './components/SurahCard';
import { RecitationView } from './components/RecitationView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setCurrentView(AppView.RECITATION);
  };

  const handleBack = () => {
    setCurrentView(AppView.HOME);
    setSelectedSurah(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 mx-auto max-w-md shadow-2xl overflow-hidden relative border-x border-slate-200">
      
      {currentView === AppView.HOME && (
        <div className="flex flex-col h-full p-6">
          <header className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2 font-serif">الحافظ الذكي</h1>
            <p className="text-slate-500">رفيقك لحفظ وتلاوة القرآن الكريم</p>
          </header>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-slate-700">اختر سورة للبدء</h2>
            <div className="space-y-4">
              {SURAHS.map(surah => (
                <SurahCard 
                  key={surah.id} 
                  surah={surah} 
                  onClick={() => handleSurahSelect(surah)} 
                />
              ))}
            </div>
          </section>

          <footer className="mt-auto py-6 text-center text-xs text-slate-400">
             مدعوم بواسطة Google Gemini 2.5
          </footer>
        </div>
      )}

      {currentView === AppView.RECITATION && selectedSurah && (
        <RecitationView surah={selectedSurah} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;