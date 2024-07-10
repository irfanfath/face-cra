import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FaceLandmarkerNew from './component/FaceLandmarkerDemoNew';
import OCRDemo from './component/OCRDemo';

function App() {
  const [currentPage, setCurrentPage] = useState(1);

  const location = useMemo(() => {
    const page = new URL(window.location.href).searchParams.get('step');
    return page;
  }, []);

  const nextStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'face-recognition');
    window.location.href = url.toString();
  };

  useEffect(() => {
    if (location) {
      setCurrentPage(Number(location));
    }
  }, [location]);

  return (
    <div className="App">
      {currentPage === 1 ? <OCRDemo nextStep={nextStep} /> : <FaceLandmarkerNew />}
    </div>
  );
}

export default App;
