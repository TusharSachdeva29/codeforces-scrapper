import { useState, useEffect, useCallback } from 'react';

export default function SlidingPanels({ leftPanel, rightPanel }) {
  const [isResizing, setIsResizing] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  const startResizing = useCallback((e) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const container = document.querySelector('.panels-container');
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      
      // Limit the range between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="panels-container">
      <div className="panels-wrapper">
        <div className="panel left-panel" style={{ width: `${leftWidth}%` }}>
          {leftPanel}
        </div>
        
        <div 
          className="resizer"
          onMouseDown={startResizing}
          style={{ left: `${leftWidth}%` }}
        />

        <div className="panel right-panel" style={{ width: `${100 - leftWidth}%` }}>
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
          width: 100%;
          height: 100%;
          position: relative;
        }

        .panel {
          height: 100%;
          overflow-y: auto;
          position: relative;
          transition: width 0.1s ease;
        }

        .resizer {
          width: 4px;
          height: 100%;
          background: #2563eb;
          position: absolute;
          cursor: col-resize;
          opacity: 0.5;
          transition: opacity 0.2s;
          z-index: 10;
        }

        .resizer:hover,
        .resizer:active {
          opacity: 1;
        }

        .resizer::after {
          content: '';
          position: absolute;
          left: -8px;
          width: 20px;
          height: 100%;
          cursor: col-resize;
        }

        @media (max-width: 1024px) {
          .resizer {
            display: none;
          }
          
          .panel {
            width: 100% !important;
          }
          
          .right-panel {
            display: ${isRightPanelVisible ? 'block' : 'none'};
          }
          
          .left-panel {
            display: ${isRightPanelVisible ? 'none' : 'block'};
          }
        }
      `}</style>
    </div>
  );
}
