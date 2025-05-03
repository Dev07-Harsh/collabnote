import React from 'react';
import './LoadingOverlay.css';

export default function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner" />
        <p>{message}</p>
      </div>
    </div>
  );
}
