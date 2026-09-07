import React from 'react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 
        This iframe loads the statically built index.html landing page from the public directory.
      */}
      <iframe
        src="/landing.html"
        title="INOCYTE Landing Page"
        className="w-full h-full border-none"
      />
    </div>
  );
};
