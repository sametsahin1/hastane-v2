import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ScreenPage = () => {
  const navigate = useNavigate();
  const [screens, setScreens] = useState([]);

  const handlePreview = (screenId) => {
    navigate(`/preview/${screenId}`);
  };

  useEffect(() => {
    // Fetch screens from the backend
    // This is a placeholder and should be replaced with actual data fetching logic
    setScreens([
      { _id: '1', name: 'Screen 1' },
      { _id: '2', name: 'Screen 2' },
      { _id: '3', name: 'Screen 3' },
    ]);
  }, [navigate]);

  return (
    <div>
      {screens.map(screen => (
        <div key={screen._id}>
          {screen.name}
          <button onClick={() => handlePreview(screen._id)}>Önizle</button>
        </div>
      ))}
    </div>
  );
};

export default ScreenPage; 