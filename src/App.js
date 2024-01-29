import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FaceLandmarker from './component/FaceLandmarkerDemo';
import FaceLandmarkerNew from './component/FaceLandmarkerDemoNew';

function App() {
  const location = useMemo(() => {
    const page = new URL(window.location.href).searchParams.get('page');
    return page;
  }, [])
  return (
    <div className="App">
      {
        location === "1" ? <FaceLandmarker /> : <FaceLandmarkerNew />
      }
      
    </div>
  );
}

export default App;
