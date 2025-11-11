import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoPlayerProps {
  videoId?: string;
  title?: string;
  className?: string;
  showButton?: boolean;
  buttonText?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId = "OnfUuaRlukQ",
  title,
  className = "",
  showButton = true,
  buttonText,
  autoplay = false
}) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const defaultTitle = title || t('landing.video.title', { default: 'Découvrez Nexus Support Hub' });
  const defaultButtonText = buttonText || t('landing.hero.watchDemo', { default: '🎥 Voir la démonstration' });

  return (
    <>
      {showButton && (
        <button
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium ${className}`}
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          {defaultButtonText}
        </button>
      )}

      {/* Modal vidéo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{defaultTitle}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`}
                title={defaultTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-96 rounded"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <a
                href={`https://youtu.be/${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('landing.video.openYoutube', { default: 'Ouvrir sur YouTube' })}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;