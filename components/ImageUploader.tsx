
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onUpload: (data: ImageData) => void;
  label: string;
  description: string;
  icon: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, label, description, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpload({
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={handleClick}
      className="w-full h-64 border-2 border-dashed border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <i className={`${icon} text-2xl text-indigo-400`}></i>
      </div>
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-gray-400 text-sm max-w-xs text-center">{description}</p>
    </div>
  );
};

export default ImageUploader;
