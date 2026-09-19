import React, { useEffect } from 'react';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.remove('admin-mode');
    document.body.classList.remove('admin-mode');
  }, []);

  return null;
};
