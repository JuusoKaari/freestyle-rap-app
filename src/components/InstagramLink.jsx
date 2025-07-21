/**
 * Instagram Link Component
 * ======================
 * 
 * A simple component that displays an Instagram icon link in the top left corner.
 * Uses react-icons for the Instagram icon.
 */

import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import '../styles/InstagramLink.css';

const InstagramLink = () => {
  return (
    <a 
      href="https://www.instagram.com/rheemy_rap_app/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="instagram-link"
      title="Follow Rheemy on Instagram"
    >
      <FaInstagram />
    </a>
  );
};

export default InstagramLink; 