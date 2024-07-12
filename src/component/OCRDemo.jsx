import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import bgImage from '../assets/bg-ktp.png';
import { Camera, CircleCheck } from "lucide-react";

export default function OCRDemo() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [dataOcr, setDataOcr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);

  // let videoConstraints = {
  //   facingMode: 'environment',
  //   // width: 270,
  //   // height: 480,
  //   width: { min: 300 },
  //   height: { min: 500 },
  //   aspectRatio: 0.6666666667
  // };
  let videoConstraints = {
    facingMode: 'environment',
    width: { ideal: 720 },
    height: { ideal: 1280 },
    aspectRatio: 9 / 16
  };


  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    // localStorage.setItem('ktp', imageSrc)

    try {
      if (!imageSrc) {
        console.error('No image captured');
        return;
      }

      setLoading(true);
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

      const response = await fetch('https://bigvision.id/upload/ktp-extraction', requestOptions);
      const data = await response.json();

      console.log('Response from server:', data);
      setDataOcr(data.message.results);
      setResult(true)
      setLoading(false);
    } catch (error) {
      console.error('Error sending image:', error);
      setLoading(false);
    }
  };

  const nextStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'face-recognition');
    url.searchParams.set('id_request', 'testing');
    url.searchParams.set('app', 'b1gv1s10n');
    window.location.href = url.toString();
  };

  return (
    <div className="webcam-container">
      {result !== true ?
        <div className="webcam-img">
          <img className="bg-image" alt="" src={bgImage} />
          <div style={{ position: 'fixed', fontSize: 26, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
            <span style={{ color: 'white' }}>Foto KTP Anda<br /><span style={{ fontSize: 20 }}>sesuaikan posisi ktp anda</span></span>
          </div>
          <Webcam
            className="webcam"
            scale={1}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            screenshotQuality={1}
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100vh', objectFit: 'contain', overflow: 'hidden' }}
          />
          <div style={{ position: 'fixed', bottom: 30, left: 0, right: 0, zIndex: 1000 }}>
            <button
              className="circle-button"
              onClick={capture}
            >
              <Camera size={"60px"} color="#ffff" />
            </button>

          </div>
        </div>
        :
        <div style={{ marginTop: '10vh'}}>
          <div className="bg-welcoming" style={{ marginTop: '20px', padding: '20px', marginBottom: '5%' }}>
            <div className="bg-ktp-result" style={{ display: 'inline-flex', placeItems: 'center', width: '80%' }}>
              <CircleCheck color="#0a8053" size={50} />
              <div style={{ fontSize: '20px', fontWeight: '600', textAlign: 'left', marginLeft: '20px' }}>OCR Extraction <br /><strong>Berhasil</strong></div>
            </div>
            <div style={{ marginTop: '50px' }}>
              <img src={imageSrc} alt="captured" style={{ width: '200px', borderRadius: '15px'}} />
              <div style={{ marginTop: '40px', fontWeight: '600', fontSize: '20px' }}>Detail</div>
              <div style={{ textAlign: 'left', padding: '10px 10px 30px 30px' }}>
                <div>Nama : {dataOcr.nama}</div>
                <div>NIK : {dataOcr.nik}</div>
                <div>Tanggal Lahir : {dataOcr.ttl}</div>
              </div>
            </div>
            <div>
              <button className="next-button" onClick={nextStep}>Lanjutkan</button>
            </div>
          </div>
          <div style={{ marginTop: '40px', marginBottom: '20px' }}>
            <img src={require('../assets/bigvision.png')} alt="Welcoming" />
          </div>
        </div>
      }
    </div>
  );
}
