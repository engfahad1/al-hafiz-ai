import React from 'react';
import { Surah } from '../types';

interface SurahCardProps {
  surah: Surah;
  onClick: () => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between group"
    >
      <div className="flex flex-col items-start">
        <span className="text-sm text-emerald-600 font-bold mb-1">
          {surah.nameEnglish}
        </span>
        <span className="text-xl font-bold text-gray-800">
          {surah.name}
        </span>
      </div>
      <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </button>
  );
};