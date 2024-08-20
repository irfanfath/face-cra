import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FaceLandmarkerNew from './component/FaceLandmarkerDemoNew';
import OCRDemo from './component/OCRDemo';
import WelcomingKTP from './component/WelcomingKTP';
import ManufactureDemo from './component/ManufactureDemo';
import WelcomingOCR from './component/WelcomingOCR';

function App() {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');

    if (step === 'ktp-extract') {
      setCurrentPage('ktp-extract');
    } else if (step === 'face-recognition') {
      setCurrentPage('face-recognition');
    } else if (step === 'manufacture-extract') {
      setCurrentPage('manufacture-extract')
    } else if (step === 'welcoming-ktp') {
      setCurrentPage('welcoming-ktp')
    }
     else {
      setCurrentPage(1);
    }
  }, []);

  return (
    <div className="App">
      {currentPage === 'welcoming-ktp' && <WelcomingKTP />}
      {currentPage === 1 && <WelcomingOCR />}
      {currentPage === 'ktp-extract' && <OCRDemo />}
      {currentPage === 'manufacture-extract' && <ManufactureDemo />}
      {currentPage === 'face-recognition' && <FaceLandmarkerNew />}
    </div>
  );
}

export default App;
