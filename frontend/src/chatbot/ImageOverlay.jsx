import React, { useState } from 'react';
import '../styles/ImageOverlay.scss';

export const ImageOverlay = ({ images, onClose, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="image-overlay"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="image-container">
          <button className="nav-button prev" onClick={handlePrevious}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} />
          
          <button className="nav-button next" onClick={handleNext}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
        
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>

        <div className="thumbnail-strip">
          {images.map((img, index) => (
            <div 
              key={index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
