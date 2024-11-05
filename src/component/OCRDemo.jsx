import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import bgImage from '../assets/bg-ktp.png';
import { Camera, CircleCheck, Undo2 } from "lucide-react";

export default function OCRDemo() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [dataOcr, setDataOcr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [layout, setLayout] = useState(1);

  let videoConstraints = {
    facingMode: 'environment',
    width: { ideal: 720 },
    height: { ideal: Math.round(720 / 0.635) },
    aspectRatio: 0.635,
  };

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    localStorage.setItem('ktp', imageSrc)

    try {
      if (!imageSrc) {
        console.error('No image captured');
        return;
      }

      setLoading(true);
      setLayout(2);
      const base64Image = imageSrc.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Image}`).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.jpeg');
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA'
        },
        body: formData
      };

      const response = await fetch('https://bigvision.id/upload/ktp-extraction2', requestOptions);
      const data = await response.json();

      console.log('Response from server:', data);
      setDataOcr(data.message.results);
      setResult(true)
      setLoading(false);
      setLayout(3);
    } catch (error) {
      console.error('Error sending image:', error);
      setLoading(false);
      setLayout(1);
    }
  };

  const nextStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'face-recognition');
    url.searchParams.set('id_request', 'testing');
    url.searchParams.set('app', 'b1gv1s10n');
    window.location.href = url.toString();
  };

  const DetectionLayout = () => {
    return (
      <div className="container-detection">
        <div style={{ textAlign: 'center', color: '#F8F8F8', fontSize: '22px', fontWeight: '400', padding: '10px', lineHeight: '40px', marginTop: '20px' }}>Posisikan KTP tetap berada di dalam area bergaris atau bingkai</div>
        <div>
          <Webcam
            className="webcam"
            scale={1}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            screenshotQuality={1}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              objectFit: 'cover',
              overflow: 'hidden',
              width: '90%',
              border: '8px solid white',
              borderRadius: '20px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '80%',
              top: '47%',
              transform: 'translate(-50%, -50%)',
              width: '20%',
              height: '15%',
              border: '3px solid white',
              borderRadius: '5px',
            }}
          />
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, textAlign: 'center', background: '#616161', padding: 30 }}>
          <button
            className="circle-button"
            onClick={capture}
          >
            <div style={{ background: '#ffffff', borderRadius: 9999, width: 70, height: 70, justifySelf: 'center' }}></div>
            {/* <Camera size={"60px"} color="#ffff" /> */}
          </button>
        </div>
      </div>
    )
  }

  const LoadingLayout = () => {
    return (
      <div className="container-loading">
        <img src={require('../assets/illus-ktp.png')} alt="illustasi ktp" />
        <div style={{ marginTop: '24px', lineHeight: '35px' }}>
          <div style={{ fontSize: '24px', color: '#000000', fontWeight: '600' }}>Membaca KTP Anda...</div>
          <div style={{ fontSize: '18px', color: '#000000', fontWeight: '200' }}>Mohon jangan menutup halaman ini</div>
        </div>
      </div>
    )
  }

  const ResultLayout = () => {
    return (
      <div className="container">
        <img src={imageSrc} alt="captured" style={{ width: '100%', borderRadius: '15px', marginTop: '50px' }} />
        <div style={{ marginTop: '20px', fontWeight: '600', fontSize: '24px' }}>Cek kembali data KTP Anda</div>
        <div style={{ marginTop: '10px', fontSize: '18px', lineHeight: '30px' }}>
          <div>Nama : {dataOcr.nama}</div>
          <div>NIK : {dataOcr.nik}</div>
          <div>Tanggal Lahir : {dataOcr.ttl}</div>
        </div>
        <div style={{ position: 'fixed', bottom: 40, right: 40, left: 40, textAlign: 'center' }}>
          <button className="retake-button" onClick={() => setLayout(1)}>ulangi foto e-KTP</button>
          <button className="next-button" onClick={() => setLayout(4)}>Konfirmasi & Lanjut</button>
        </div>
      </div>
    )
  }

  const GuideFRLayout = () => {
    return (
      <div className="container">
        <div style={{ marginTop: '40px' }}>
          <div style={{ color: '#858585' }}>Langkah 2/2</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#0F133E', marginTop: '20px' }}>Pindai Wajah</div>
        </div>
        <div style={{ marginTop: '30px' }}>
          <div style={{ fontSize: '18px', color: '#0F133E', marginTop: '20px' }}>Posisikan wajah Anda di dalam bingkai dan berada tepat di tengah</div>
        </div>
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <img src={require('../assets/guide-fr.png')} alt="Guide FR" />
        </div>
        <div style={{ marginTop: '30px' }}>
          <div style={{ fontSize: '18px', color: '#0F133E' }}>
          Pastikan wajah Anda tidak tertutupi oleh aksesoris apapun (misal : kacamata, masker, topi, dll)
          </div>
        </div>
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <img src={require('../assets/guide-acc-fr.png')} alt="Accessoris Guide" />
        </div>

        <div style={{ position: 'fixed', bottom: 40, right: 40, left: 40, textAlign: 'center' }}>
          <button className="next-button" onClick={nextStep}>Mulai Pindai Wajah</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {
        layout === 1 ? <DetectionLayout /> : layout === 2 ? <LoadingLayout /> : layout === 3 ? <ResultLayout /> : <GuideFRLayout />
      }
    </div>
  );
}
