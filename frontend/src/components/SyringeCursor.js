import React, { useEffect } from 'react';

const BlackCursor = () => {
  useEffect(() => {
    // Only activate cursor on login page
    if (window.location.pathname !== '/login') {
      return;
    }

    // Create custom black arrow cursor using SVG
    const cursorSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="black" stroke="white" stroke-width="0.5"/>
      </svg>
    `;
    
    // Convert SVG to base64
    const encodedSVG = btoa(cursorSVG);
    const cursorURL = `url('data:image/svg+xml;base64,${encodedSVG}') 0 0, auto`;
    
    // Apply custom cursor
    document.body.style.cursor = cursorURL;

    // Handle input fields to show text cursor
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        target.style.cursor = 'text';
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return null;
};

export default BlackCursor;