import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FaceLandmarkerNew from './component/FaceLandmarkerDemoNew';
import OCRDemo from './component/OCRDemo';
import SuccessPage from './component/SuccessPage';

function App() {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');

    if (step === 'ocr-extract') {
      setCurrentPage('ocr-extract');
    } else if (step === 'face-recognition') {
      setCurrentPage('face-recognition');
    } else {
      setCurrentPage(1);
    }
  }, []);

  return (
    <div className="App">
      {currentPage === 1 && <SuccessPage />}
      {currentPage === 'ocr-extract' && <OCRDemo />}
      {currentPage === 'face-recognition' && <FaceLandmarkerNew />}
    </div>
  );
}

export default App;
