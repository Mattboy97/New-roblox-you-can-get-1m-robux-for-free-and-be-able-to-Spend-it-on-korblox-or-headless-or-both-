import React from 'react';
import { Avatar } from '../types';

interface AvatarDisplayProps {
  avatar?: Avatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DEFAULT_AVATAR: Avatar = {
  skinColor: '#FFDBAC',
  shirtColor: '#3B82F6',
  pantsColor: '#1F2937',
  hatType: 'none'
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatar = DEFAULT_AVATAR, size = 'md' }) => {
  const scale = {
    sm: 0.5,
    md: 1,
    lg: 1.5,
    xl: 2.5
  }[size];

  return (
    <div 
      className="relative flex flex-col items-center"
      style={{ transform: `scale(${scale})`, height: 120, width: 80 }}
    >
      {/* Hat */}
      {avatar.hatType === 'cap' && (
        <div className="absolute -top-2 w-10 h-4 bg-red-600 rounded-t-lg z-30" />
      )}
      {avatar.hatType === 'crown' && (
        <div className="absolute -top-4 w-10 h-6 flex justify-between z-30">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-2 h-full bg-yellow-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          ))}
        </div>
      )}
      {avatar.hatType === 'headphones' && (
        <div className="absolute -top-1 w-12 h-8 border-t-4 border-x-4 border-gray-800 rounded-t-full z-30" />
      )}

      {/* Head */}
      {!avatar.isHeadless && (
        <div 
          className="w-8 h-8 rounded-md z-20 relative"
          style={{ backgroundColor: avatar.skinColor }}
        >
          {/* Eyes */}
          <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-black rounded-full" />
          <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-black rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-1.5 left-2 right-2 h-0.5 bg-black/20 rounded-full" />
        </div>
      )}
      {avatar.isHeadless && <div className="w-8 h-8 z-20" />}

      {/* Torso */}
      <div 
        className="w-12 h-14 rounded-sm mt-0.5 z-10 relative overflow-hidden"
        style={{ backgroundColor: avatar.shirtColor }}
      >
        {/* Shirt Detail */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/10 rounded-b-full" />
      </div>

      {/* Arms */}
      <div className="absolute top-9 -left-4 w-4 h-12 rounded-sm" style={{ backgroundColor: avatar.skinColor }} />
      <div className="absolute top-9 -right-4 w-4 h-12 rounded-sm" style={{ backgroundColor: avatar.skinColor }} />

      {/* Legs */}
      <div className="flex gap-0.5 mt-0.5">
        {avatar.isKorblox ? (
          <div className="w-2 h-12 bg-gray-400 rounded-full mx-1.5 relative">
            <div className="absolute bottom-0 w-4 h-2 bg-gray-600 -left-1 rounded-sm" />
          </div>
        ) : (
          <div className="w-5.5 h-12 rounded-sm" style={{ backgroundColor: avatar.pantsColor }} />
        )}
        <div className="w-5.5 h-12 rounded-sm" style={{ backgroundColor: avatar.pantsColor }} />
      </div>
    </div>
  );
};
