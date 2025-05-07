import React from 'react';
import goalBackground from '../../assets/Goal.mp4';

const GoalTrackingRightPart = () => {
  return (
    <div className="h-screen bg-gray-900 rounded-xl overflow-hidden shadow-xl">
      {/* Video Background with Overlay */}
      <div className="relative h-full">
        <video className="absolute w-full h-full object-cover opacity-40" autoPlay muted loop>
          <source src={goalBackground} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Content Overlay - Only Motivational Quote */}
        <div className="relative h-full z-10 p-8 flex flex-col justify-center items-center">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Goal Dashboard</h2>
            <p className="text-gray-300 text-lg">Track your progress and stay motivated</p>
          </div>
          
          {/* Motivational Quote - Centered and Enlarged */}
          <div className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl p-8 max-w-xl w-full">
            <blockquote className="text-white text-2xl font-light italic text-center">
              "The only way to achieve your goals is to start today."
            </blockquote>
            <p className="text-right text-gray-300 mt-4">— Unknown</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTrackingRightPart;