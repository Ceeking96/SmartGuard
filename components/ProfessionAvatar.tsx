import React from 'react';
import { ProfessionType, ProfessionConfig } from '../types';
import { Spinner } from './Spinner';

interface Props {
  profession: ProfessionConfig;
  imageSrc: string | null;
  isGenerating: boolean;
}

export const ProfessionAvatar: React.FC<Props> = ({ profession, imageSrc, isGenerating }) => {
  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-b-[3rem] shadow-2xl bg-gray-900 border-b-4 border-white/10">
        {/* African styling pattern overlay */}
        <div className="absolute inset-0 african-pattern-dark opacity-20 z-0 pointer-events-none"></div>
        
        {/* Background color overlay based on profession */}
        <div className={`absolute inset-0 opacity-30 ${profession.color} mix-blend-overlay z-10`}></div>
        
        {imageSrc ? (
            <div className="w-full h-full overflow-hidden relative z-0">
                <img 
                    src={imageSrc} 
                    alt={profession.title}
                    className={`w-full h-full object-cover transition-all duration-1000 ease-in-out origin-center animate-pan-zoom ${isGenerating ? 'blur-md grayscale' : 'blur-0 grayscale-0'}`}
                />
            </div>
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 z-0">
                <span className="text-6xl grayscale opacity-20">👤</span>
            </div>
        )}

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent pt-32 z-20">
            <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm bg-white/10 border border-white/20`}>
                    {profession.icon}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white leading-none tracking-tight uppercase">{profession.title}</h2>
                    <p className="text-sm text-ng-green font-bold tracking-wider">{profession.roleDescription}</p>
                </div>
            </div>
        </div>

        {/* Loading State Overlay */}
        {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-30">
                <Spinner className="w-16 h-16 mb-6 text-ng-green" />
                <p className="text-white font-bold text-xl animate-pulse tracking-widest">TRANSFORMING</p>
                <p className="text-xs text-gray-400 mt-2 font-mono uppercase">Equipping {profession.title} Gear...</p>
            </div>
        )}
        
        {/* Badge */}
        <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 z-20 shadow-lg">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${profession.id === ProfessionType.NONE ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></div>
                 <span className="text-xs font-bold text-white tracking-wider uppercase">
                     {profession.id === ProfessionType.NONE ? 'Standby' : 'Active'}
                 </span>
             </div>
        </div>
    </div>
  );
};