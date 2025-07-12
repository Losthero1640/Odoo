import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from './ItemCard';

const FeaturedCarousel = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= items.length ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? items.length - 1 : prevIndex - 1
    );
  };
  
  if (!items.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured items available</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView.mobile)}%)`,
          }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2"
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
      
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
            aria-label="Previous item"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
            aria-label="Next item"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </>
      )}
      
      {items.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;