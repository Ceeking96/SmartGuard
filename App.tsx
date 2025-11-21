import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProfessionType, ProfessionConfig, GeoLocation } from './types';
import { PROFESSIONS } from './constants';
import { ImageUploader } from './components/ImageUploader';
import { ProfessionAvatar } from './components/ProfessionAvatar';
import { geminiService } from './services/geminiService';
import { Spinner } from './components/Spinner';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [currentProfession, setCurrentProfession] = useState<ProfessionType>(ProfessionType.NONE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  
  // Chat/Consultation State
  const [chatInput, setChatInput] = useState("");
  const [consultationImage, setConsultationImage] = useState<string | null>(null);
  const [consultationResult, setConsultationResult] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.error("Geo Error:", err)
      );
    }
  }, []);

  const handleProfessionSelect = useCallback(async (profType: ProfessionType) => {
    if (currentProfession === profType) return;
    setCurrentProfession(profType);
    setConsultationResult(null); // Reset chat
    setChatInput("");
    setConsultationImage(null);
    
    if (profType === ProfessionType.NONE) {
        setNearbyPlaces([]);
        return;
    }

    // 1. Image Transformation Logic
    if (uploadedImage && !generatedImages[profType]) {
      setIsGenerating(true);
      try {
        const newAvatar = await geminiService.generateProfessionAvatar(uploadedImage, profType);
        setGeneratedImages(prev => ({ ...prev, [profType]: newAvatar }));
      } catch (error) {
        console.error("Failed to generate avatar", error);
        setGeneratedImages(prev => ({ ...prev, [profType]: uploadedImage }));
      } finally {
        setIsGenerating(false);
      }
    }

    // 2. Fetch Nearby Places (if location exists)
    if (location) {
        setLoadingPlaces(true);
        try {
            // Specific queries as requested
            const queryMap = {
                [ProfessionType.DOCTOR]: "Hospitals and Clinics",
                [ProfessionType.FIREFIGHTER]: "Fire Stations",
                [ProfessionType.LAWYER]: "Law Firms and Legal Aid", 
                [ProfessionType.MECHANIC]: "Mechanic Workshops and Auto Repair",
                [ProfessionType.ENGINEER]: "Construction Companies and Public Works",
                [ProfessionType.HANDYMAN]: "Hardware Stores and Tool Supply",
                [ProfessionType.NONE]: ""
            };
            const places = await geminiService.findNearbyPlaces(location.lat, location.lng, queryMap[profType]);
            setNearbyPlaces(places);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPlaces(false);
        }
    }
  }, [currentProfession, uploadedImage, generatedImages, location]);

  const handleConsultationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setConsultationImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleConsultation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() && !consultationImage) return;
      
      setIsConsulting(true);
      try {
          const advice = await geminiService.getConsultation(currentProfession, chatInput, consultationImage);
          setConsultationResult(advice);
      } catch (error) {
          console.error(error);
      } finally {
          setIsConsulting(false);
      }
  };

  if (!uploadedImage) {
    return <ImageUploader onImageUpload={(img) => {
        setUploadedImage(img);
        setGeneratedImages({ [ProfessionType.NONE]: img });
    }} />;
  }

  const activeConfig = PROFESSIONS[currentProfession];
  const displayImage = generatedImages[currentProfession] || uploadedImage;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative bg-gray-100">
      
      {/* Header & Avatar */}
      <div className="relative z-10">
         <ProfessionAvatar 
            profession={activeConfig} 
            imageSrc={displayImage} 
            isGenerating={isGenerating}
         />
         
         {currentProfession !== ProfessionType.NONE && (
             <button 
                onClick={() => handleProfessionSelect(ProfessionType.NONE)}
                className="absolute top-6 left-6 bg-black/40 backdrop-blur-md border border-white/20 text-white p-2 rounded-full hover:bg-black/60 transition shadow-lg z-30"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
             </button>
         )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white -mt-10 pt-12 pb-24 px-6 rounded-t-[2.5rem] z-20 flex flex-col relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        
        {/* DASHBOARD VIEW */}
        {currentProfession === ProfessionType.NONE ? (
            <div className="animate-fade-in">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3 uppercase tracking-wider">
                    <span className="w-3 h-3 bg-ng-green rounded-full animate-pulse"></span>
                    Select Service
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        ProfessionType.DOCTOR, 
                        ProfessionType.FIREFIGHTER, 
                        ProfessionType.LAWYER, 
                        ProfessionType.MECHANIC, 
                        ProfessionType.ENGINEER,
                        ProfessionType.HANDYMAN
                    ].map((type) => {
                        const config = PROFESSIONS[type as ProfessionType];
                        return (
                            <button
                                key={type}
                                onClick={() => handleProfessionSelect(type as ProfessionType)}
                                className="flex flex-col items-center justify-center p-5 rounded-3xl border border-gray-100 shadow-sm bg-white hover:shadow-xl hover:border-gray-200 transition-all active:scale-95 group relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${config.color}`}></div>
                                <div className={`w-14 h-14 rounded-2xl ${config.color} text-white flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {config.icon}
                                </div>
                                <span className="font-bold text-gray-800 text-sm tracking-tight">{config.title}</span>
                            </button>
                        );
                    })}
                </div>
                
                <div className="mt-8 p-5 bg-gradient-to-br from-ng-green/10 to-transparent rounded-2xl border border-ng-green/20 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🌍</div>
                    <h4 className="font-bold text-ng-green text-base">Coverage: Life & Emergency</h4>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        From medical triage to fixing a broken sink. Access verified contacts and AI-driven repair guides anywhere.
                    </p>
                </div>
            </div>
        ) : (
            /* ACTIVE EMERGENCY / DIY VIEW */
            <div className="flex flex-col h-full animate-fade-in space-y-6">
                
                {/* 1. Consultation Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1">
                    <div className="p-4 bg-gray-50 rounded-xl mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                           {activeConfig.id === ProfessionType.DOCTOR ? 'Triage & Diagnosis' : 
                            activeConfig.id === ProfessionType.LAWYER ? 'Legal Counsel' : 
                            activeConfig.id === ProfessionType.HANDYMAN ? 'Repair Assistant' :
                            'Situation Report'}
                        </h4>
                        
                        {consultationResult ? (
                            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                <span className="font-bold text-ng-green">Guide: </span>
                                {consultationResult}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">
                                <p className="mb-2">
                                    {activeConfig.id === ProfessionType.HANDYMAN 
                                        ? "Snap a picture of the broken item (tire, sink, brake pad, etc.) or describe the issue for a step-by-step fix."
                                        : "Describe your situation for immediate AI assistance..."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    {consultationImage && (
                        <div className="px-4 pb-2 flex relative">
                            <img src={consultationImage} alt="To Analyze" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                            <button 
                                onClick={() => setConsultationImage(null)}
                                className="absolute top-0 left-14 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleConsultation} className="relative flex items-center gap-2 p-1">
                        {/* Camera/Image Upload Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-500 hover:text-ng-green transition-colors"
                            title="Upload Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleConsultationImageUpload}
                        />

                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={
                                activeConfig.id === ProfessionType.HANDYMAN ? "Ask about sinks, tires, oil..." :
                                "Describe the emergency..."
                            }
                            className="flex-1 py-3 bg-transparent text-sm focus:outline-none"
                        />
                        <button 
                            type="submit"
                            disabled={isConsulting || (!chatInput && !consultationImage)}
                            className="p-2.5 bg-gray-900 text-white rounded-xl disabled:opacity-50 hover:bg-ng-green transition-colors shadow-md"
                        >
                            {isConsulting ? <Spinner className="w-5 h-5" /> : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>

                {/* 2. Map Results Section */}
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex justify-between items-center uppercase tracking-wider">
                        <span>{activeConfig.id === ProfessionType.HANDYMAN ? 'Hardware & Supply' : 'Official Units Nearby'}</span>
                        {loadingPlaces && <Spinner className="text-gray-400 w-4 h-4" />}
                    </h3>
                    
                    <div className="space-y-3 pb-20">
                        {loadingPlaces ? (
                            [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
                        ) : nearbyPlaces.length > 0 ? (
                            nearbyPlaces.map((place, idx) => (
                                <a 
                                    key={idx} 
                                    href={place.uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-ng-green transition flex items-center justify-between group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h5 className="font-bold text-gray-800 truncate text-sm">{place.title}</h5>
                                        <p className="text-xs text-gray-500 truncate mt-1">{place.address || "View Directions"}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition`}>
                                        <span className="text-lg">📍</span>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="text-2xl block mb-2">📡</span>
                                Searching for {activeConfig.id === ProfessionType.HANDYMAN ? 'supplies' : 'nearby units'}...
                                <br/>Ensure GPS is enabled.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Sticky Footer Action Button */}
      {currentProfession !== ProfessionType.NONE && (
          <div className="absolute bottom-6 left-6 right-6 z-30">
              {currentProfession === ProfessionType.HANDYMAN ? (
                  <a 
                    href={`https://www.google.com/maps/search/hardware+store+near+me/@${location?.lat},${location?.lng},14z`}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transform active:scale-95 transition-all bg-orange-700 shadow-lg ring-4 ring-white/20`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      FIND SUPPLIES NEARBY
                  </a>
              ) : (
                  <a 
                    href="tel:112"
                    className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transform active:scale-95 transition-all ${activeConfig.color} shadow-lg ring-4 ring-white/20 animate-pulse-slow`}
                  >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      CALL EMERGENCY (112)
                  </a>
              )}
          </div>
      )}
    </div>
  );
}