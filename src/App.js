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

    if (step === 'face-recognition') {
      setCurrentPage('face-recognition');
    } else if (step === 'success-page') {
      setCurrentPage('success-page');
    } else {
      setCurrentPage(1);
    }
  }, []);

  return (
    <div className="App">
      {currentPage === 1 && <OCRDemo />}
      {currentPage === 'face-recognition' && <FaceLandmarkerNew />}
      {currentPage === 'success-page' && <SuccessPage />}
    </div>
  );
}

export default App;
