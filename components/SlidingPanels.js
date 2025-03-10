import { useState } from 'react';

export default function SlidingPanels({ leftPanel, rightPanel }) {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  return (
    <div className="panels-container">
      <div className="panels-wrapper" style={{ transform: `translateX(${isRightPanelVisible ? '-50%' : '0'})` }}>
        <div className="panel left-panel">
          {leftPanel}
          <button 
            className="slide-button right" 
            onClick={() => setIsRightPanelVisible(true)}
            aria-label="Show editor"
          >
            <span>→</span>
          </button>
        </div>
        <div className="panel right-panel">
          <button 
            className="slide-button left" 
            onClick={() => setIsRightPanelVisible(false)}
            aria-label="Show problem"
          >
            <span>←</span>
          </button>
          {rightPanel}
        </div>
      </div>

      <style jsx>{`
        .panels-container {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .panels-wrapper {
          display: flex;
          width: 200%;
          height: 100%;
          transition: transform 0.3s ease;
        }

        .panel {
          width: 50%;
          height: 100%;
          position: relative;
          overflow-y: auto;
        }

        .slide-button {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          background: #2563eb;
          color: white;
          border: none;
          padding: 1rem 0.5rem;
          cursor: pointer;
          border-radius: 0 4px 4px 0;
          opacity: 0.8;
          transition: opacity 0.2s;
          z-index: 100;
        }

        .slide-button:hover {
          opacity: 1;
        }

        .slide-button.right {
          right: 0;
        }

        .slide-button.left {
          left: 0;
          border-radius: 4px 0 0 4px;
        }

        @media (min-width: 1024px) {
          .panels-container {
            width: 100%;
          }
          
          .panels-wrapper {
            width: 100%;
            transform: none !important;
          }
          
          .panel {
            width: 50%;
          }
          
          .slide-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
