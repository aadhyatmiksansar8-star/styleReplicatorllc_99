
import React, { useState } from 'react';
import { AppStep, AnalysisResult, ImageData } from './types';
import { analyzeReferenceImage, generateStyledImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import CameraCapture from './components/CameraCapture';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_REFERENCE);
  const [isCameraMode, setIsCameraMode] = useState<boolean>(false);
  const [refImage, setRefImage] = useState<ImageData | null>(null);
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');

  const handleRefUpload = async (data: ImageData) => {
    setRefImage(data);
    setIsCameraMode(false);
    setStep(AppStep.ANALYZING);
    setLoadingMsg('Analyzing style elements...');
    setError(null);
    try {
      const result = await analyzeReferenceImage(data);
      setAnalysis(result);
      setStep(AppStep.PROMPT_READY);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
      setStep(AppStep.UPLOAD_REFERENCE);
    }
  };

  const handleSourceUpload = async (data: ImageData) => {
    setSourceImage(data);
    setIsCameraMode(false);
    if (!analysis) return;
    
    setStep(AppStep.GENERATING);
    setLoadingMsg('Applying style to your photo...');
    setError(null);
    try {
      const styledImg = await generateStyledImage(data, analysis.cohesivePrompt);
      setResultImage(styledImg);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
      setStep(AppStep.UPLOAD_SOURCE);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD_REFERENCE);
    setIsCameraMode(false);
    setRefImage(null);
    setSourceImage(null);
    setAnalysis(null);
    setResultImage(null);
    setError(null);
  };

  const copyPrompt = () => {
    if (analysis?.cohesivePrompt) {
      navigator.clipboard.writeText(analysis.cohesivePrompt);
      alert('Prompt copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={reset} style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-wand-sparkles text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold gradient-text tracking-tight">StyleReplicator</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={reset} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Reset</button>
            <a href="https://github.com" target="_blank" className="text-gray-400 hover:text-white"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[AppStep.UPLOAD_REFERENCE, AppStep.PROMPT_READY, AppStep.UPLOAD_SOURCE, AppStep.RESULT].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step === s || (idx === 0 && step === AppStep.ANALYZING) || (idx === 2 && step === AppStep.GENERATING)
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'border-white/20 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              {idx < 3 && <div className={`h-0.5 w-12 rounded-full ${idx < [AppStep.UPLOAD_REFERENCE, AppStep.PROMPT_READY, AppStep.UPLOAD_SOURCE, AppStep.RESULT].indexOf(step) ? 'bg-indigo-500' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <i className="fas fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {/* Dynamic Views */}
        <div className="transition-all duration-300">
          
          {step === AppStep.UPLOAD_REFERENCE && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-2 text-center">Reference Style Photo</h2>
              <p className="text-gray-400 text-center mb-10">Upload or take a photo of the style you want to replicate.</p>
              
              {!isCameraMode ? (
                <div className="flex flex-col gap-6">
                  <ImageUploader 
                    label="Select Reference Image" 
                    description="Upload a high-quality photo of a style you love"
                    icon="fas fa-file-arrow-up"
                    onUpload={handleRefUpload} 
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex-grow h-px bg-white/10"></div>
                    <span className="text-gray-600 text-xs uppercase font-bold">or</span>
                    <div className="flex-grow h-px bg-white/10"></div>
                  </div>
                  <button 
                    onClick={() => setIsCameraMode(true)}
                    className="w-full py-4 rounded-2xl glass-panel hover:bg-white/10 transition-all flex items-center justify-center gap-3 border-indigo-500/20"
                  >
                    <i className="fas fa-camera text-indigo-400 text-lg"></i>
                    <span className="font-semibold">Take Photo with Camera</span>
                  </button>
                </div>
              ) : (
                <CameraCapture onCapture={handleRefUpload} onCancel={() => setIsCameraMode(false)} />
              )}
            </div>
          )}

          {(step === AppStep.ANALYZING || step === AppStep.GENERATING) && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-medium text-gray-300">{loadingMsg}</p>
            </div>
          )}

          {step === AppStep.PROMPT_READY && analysis && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-2xl overflow-hidden">
                  <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Style Components</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Outfit</p>
                      <p className="text-sm">{analysis.outfit}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Pose & Angle</p>
                      <p className="text-sm">{analysis.pose} / {analysis.cameraAngle}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Aesthetic</p>
                      <p className="text-sm">{analysis.aesthetic}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Generated Style Prompt</h3>
                  <div className="glass-panel p-6 rounded-2xl flex-grow flex flex-col">
                    <p className="text-gray-300 italic mb-6 leading-relaxed flex-grow">
                      "{analysis.cohesivePrompt}"
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={copyPrompt}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-copy"></i> Copy Prompt
                      </button>
                      <button 
                        onClick={() => setStep(AppStep.UPLOAD_SOURCE)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        Continue <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === AppStep.UPLOAD_SOURCE && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-2 text-center">Your Photo</h2>
              <p className="text-gray-400 text-center mb-10">Now upload or take a photo of yourself to transform.</p>
              
              {!isCameraMode ? (
                <div className="flex flex-col gap-6">
                  <ImageUploader 
                    label="Select Your Image" 
                    description="This photo will be restyled with the reference elements"
                    icon="fas fa-user-circle"
                    onUpload={handleSourceUpload} 
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex-grow h-px bg-white/10"></div>
                    <span className="text-gray-600 text-xs uppercase font-bold">or</span>
                    <div className="flex-grow h-px bg-white/10"></div>
                  </div>
                  <button 
                    onClick={() => setIsCameraMode(true)}
                    className="w-full py-4 rounded-2xl glass-panel hover:bg-white/10 transition-all flex items-center justify-center gap-3 border-indigo-500/20"
                  >
                    <i className="fas fa-camera text-indigo-400 text-lg"></i>
                    <span className="font-semibold">Take Selfie</span>
                  </button>
                  <button 
                    onClick={() => setStep(AppStep.PROMPT_READY)} 
                    className="mt-2 text-gray-500 hover:text-white mx-auto block"
                  >
                    Go back to prompt
                  </button>
                </div>
              ) : (
                <CameraCapture onCapture={handleSourceUpload} onCancel={() => setIsCameraMode(false)} />
              )}
            </div>
          )}

          {step === AppStep.RESULT && resultImage && (
            <div className="animate-in fade-in scale-95 duration-700">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative glass-panel rounded-2xl p-2">
                    <img 
                      src={resultImage} 
                      alt="Restyled Result" 
                      className="max-w-full h-auto rounded-xl shadow-2xl" 
                    />
                  </div>
                </div>
                
                <div className="mt-10 flex flex-col gap-4 w-full items-center">
                  <div className="flex flex-wrap justify-center gap-4">
                    <a 
                      href={resultImage} 
                      download="restyled-photo.png"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <i className="fas fa-download"></i> Save Final Result
                    </a>
                    <button 
                      onClick={reset}
                      className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <i className="fas fa-rotate"></i> Start Over
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {refImage && (
                      <a 
                        href={refImage.base64} 
                        download="reference-style.png"
                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 transition-all"
                      >
                        <i className="fas fa-download text-[10px]"></i> Reference Image
                      </a>
                    )}
                    {sourceImage && (
                      <a 
                        href={sourceImage.base64} 
                        download="base-photo.png"
                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 transition-all"
                      >
                        <i className="fas fa-download text-[10px]"></i> Base Photo
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-12 w-full grid grid-cols-3 gap-4">
                   {refImage && (
                     <div className="flex flex-col items-center gap-2">
                       <p className="text-xs text-gray-500 uppercase">Style Source</p>
                       <img src={refImage.base64} className="h-24 w-full object-cover rounded-lg border border-white/10" />
                     </div>
                   )}
                   <div className="flex items-center justify-center">
                     <i className="fas fa-plus text-gray-700 text-xl"></i>
                   </div>
                   {sourceImage && (
                     <div className="flex flex-col items-center gap-2">
                       <p className="text-xs text-gray-500 uppercase">Base Image</p>
                       <img src={sourceImage.base64} className="h-24 w-full object-cover rounded-lg border border-white/10" />
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Hint */}
      {step === AppStep.UPLOAD_REFERENCE && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full text-sm text-gray-300 border border-indigo-500/20 shadow-lg animate-bounce">
          <i className="fas fa-magic-wand-sparkles text-indigo-400 mr-2"></i>
          Analyze any style, pose, or outfit instantly
        </div>
      )}
    </div>
  );
};

export default App;
