import React, {useEffect, useRef, useState} from 'react';

const API_URL = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

let apiPromise = null;
function loadAPI() {
  if (apiPromise) return apiPromise;
  if (typeof window !== 'undefined' && window.Desmos) {
    return (apiPromise = Promise.resolve());
  }
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = API_URL;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return apiPromise;
}

export default function DesmosGraph({expressions = [], height = 400, title = 'Interactive graph', xMin, xMax, yMin, yMax}) {
  const containerRef = useRef(null);
  const calcRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;
    loadAPI()
      .then(() => {
        if (!mounted || !containerRef.current) return;
        const calc = window.Desmos.GraphingCalculator(containerRef.current, {
          expressions: true,
          settingsMenu: false,
          zoomButtons: true,
          expressionsTopbar: false,
          border: false,
          lockViewport: false,
          fontSize: 14,
        });

        if (xMin != null && xMax != null && yMin != null && yMax != null) {
          calc.setMathBounds({left: xMin, right: xMax, bottom: yMin, top: yMax});
        }

        expressions.forEach((expr, i) => {
          if (typeof expr === 'string') {
            calc.setExpression({id: `expr-${i}`, latex: expr});
          } else {
            calc.setExpression({id: `expr-${i}`, ...expr});
          }
        });

        calcRef.current = calc;
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{
        border: '1px solid #ccc', borderRadius: 8, padding: '2rem',
        textAlign: 'center', color: '#888', marginBottom: '1rem',
      }}>
        Interactive graph could not load. <a href="https://www.desmos.com/calculator" target="_blank" rel="noopener noreferrer">Open Desmos</a> to explore.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{width: '100%', height, borderRadius: 8, marginBottom: '1rem'}}
      title={title}
    />
  );
}
