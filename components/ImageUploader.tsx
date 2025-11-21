import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface Props {
  onImageUpload: (base64: string) => void;
}

export const ImageUploader: React.FC<Props> = ({ onImageUpload }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6 text-center space-y-8">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-ng-green to-teal-600 rounded-full mx-auto flex items-center justify-center shadow-lg animate-pulse-slow">
                    <span className="text-4xl">🛡️</span>
                </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">SmartGuard Setup</h1>
            <p className="text-gray-300 mb-8">
                Upload a clear photo of yourself. Our AI will transform you into the emergency responder needed for any situation.
            </p>

            <label className="relative group cursor-pointer w-full block">
                <div className="w-full h-16 bg-ng-green hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-[1.02] shadow-lg">
                    {loading ? (
                        <Spinner />
                    ) : (
                        <span className="text-white font-semibold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Take / Upload Photo
                        </span>
                    )}
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden"
                />
            </label>
            
            <p className="mt-6 text-xs text-gray-400">
                Your privacy is paramount. Images are processed for transformation and not stored permanently.
            </p>
        </div>
    </div>
  );
};