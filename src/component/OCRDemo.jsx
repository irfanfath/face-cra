import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const OCRDemo = () => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [dataOcr, setDataOcr] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(false);

    const videoConstraints = {
        width: { min: 300 },
        height: { min: 500 },
        aspectRatio: 16 / 9,
        facingMode: 'environment',
        mirror: false
    };

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);

        try {
            if (!imageSrc) {
                console.error('No image captured');
                return;
            }

            setLoading(true);

            // Konversi base64 menjadi Blob
            const base64Image = imageSrc.split(',')[1];
            const blob = await fetch(`data:image/jpeg;base64,${base64Image}`).then(res => res.blob());

            // Buat objek FormData dan tambahkan gambar sebagai file
            const formData = new FormData();
            formData.append('image', blob, 'captured-image.jpeg');

            // Pengaturan request
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA'
                },
                body: formData
            };

            // Kirim permintaan ke server OCR
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

    return (
        <div>
            <Webcam
                audio={false}
                mirrored={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', overflow: 'hidden' }} />
            <button
                style={{ position: 'absolute' }}
                onClick={capture}
            >
                Capture
            </button>
            {/* {loading && <p>Loading...</p>} */}
            {result && (
                <div className="modal-content">
                    <div style={{ textAlign: 'left', paddingLeft: '20px', marginBottom: '20px' }}>
                        <div>Nama : {dataOcr.nama}</div>
                        <div>NIK : {dataOcr.nik}</div>
                        <div>Tanggal Lahir : {dataOcr.ttl}</div>
                        <img src={imageSrc} alt="captured" style={{ maxWidth: '100%' }} />

                    </div>
                </div>
            )}
            {/* {imageSrc && (
        <div>
          <h2>Preview:</h2>
          <img src={imageSrc} alt="captured" style={{ maxWidth: '100%' }} />
        </div>
      )} */}
        </div>
    );
};

export default OCRDemo;
