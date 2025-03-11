import { useState } from 'react';
import { useRouter } from 'next/router';

export default function POTD() {
  const [handle, setHandle] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchUserRating = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const data = await res.json();
      if (data.status === 'OK') {
        setUserRating(data.result[0].rating || 800);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
    setLoading(false);
  };

  const getPOTD = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/potd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle,
          rating: userRating
        }),
      });
      
      const data = await res.json();
      console.log('POTD response:', data); // Debug log
      
      if (data.problem) {
        // Ensure all required fields are present
        const problemData = {
          ...data.problem,
          sampleInputs: data.problem.sampleInputs || [],
          sampleOutputs: data.problem.sampleOutputs || []
        };
        
        localStorage.setItem('problemData', JSON.stringify(problemData));
        router.push('/');
      } else {
        console.error('No problem data in response:', data);
        alert('No problem available for today');
      }
    } catch (error) {
      console.error('Error fetching POTD:', error);
      alert('Error fetching problem of the day');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="potd-container">
      <h1>Problem of the Day</h1>
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter Codeforces Handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
        <button onClick={fetchUserRating} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Rating'}
        </button>
      </div>
      
      {userRating && (
        <div className="rating-section">
          <p>Your rating: {userRating}</p>
          <button onClick={getPOTD}>Get Problem of the Day</button>
        </div>
      )}
      
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}
      
      <style jsx>{`
        .potd-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
        }
        
        .input-section {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
        }
        
        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        button {
          padding: 0.5rem 1rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #93c5fd;
        }

        .loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
