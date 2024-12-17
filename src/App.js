import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FaceLandmarkerNew from './component/FaceLandmarkerDemoNew';
import FaceLandmarkerDemoWebbased from './component/FaceLandmarkerDemoWebbased';

function App() {
  const location = useMemo(() => {
    const page = new URL(window.location.href).searchParams.get('page');
    return page;
  }, [])
  return (
    <div className="App">
      {
        location === "web_based" ? <FaceLandmarkerDemoWebbased /> : <FaceLandmarkerNew />
      }
      
    </div>
  );
}

export default App;
