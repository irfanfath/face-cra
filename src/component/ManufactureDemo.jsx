import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import bgImage from '../assets/bg-ocr.png';
import { ArrowLeft, ArrowRight, ArrowUpDown, Camera, CircleCheck, Pencil } from "lucide-react";
import { Editor, EditorState, ContentState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { CurrentStep } from "../atoms/currentStep";
import { TodoStep } from "../atoms/todoStep";
import { DoneStep } from "../atoms/doneStep";

export default function ManufactureDemo() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [dataOcr, setDataOcr] = useState({});
  const [dataGivaudan, setDataGivaudan] = useState({});
  const [dataVendor, setDataVendor] = useState({});
  const [dataMatching, setDataMatching] = useState({});
  const [statusMatching, setStatusMatching] = useState(true)
  const [imageGivaudan, setImageGivaudan] = useState('');
  const [imageVendor, setImageVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [matchResult, setMatchResult] = useState(false);
  const [detailMatch, setDetailMatch] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [currentStep, setCurrentStep] = useState(1);

  // let videoConstraints = {
  //   facingMode: 'environment',
  //   width: { ideal: 480 },
  //   height: { ideal: 640 },
  //   aspectRatio: 16 / 9
  // };


  // let videoConstraints = {
  //   facingMode: 'environment',
  //   // width: { ideal: 720 },
  //   // height: { ideal: 1280 },
  //   // aspectRatio: 16 / 9
  //   width: { ideal: 1920 },
  //   height: { ideal: 1080 },
  //   aspectRatio: 16 / 9
  // };

  const getVideoConstraints = () => {
    const screenWidth = window.innerWidth;

    // Tinggi video adalah 80% dari tinggi layar
    const videoWidth = Math.floor(screenWidth * 0.8);

    // Hitung lebar video berdasarkan rasio aspek 16:9
    const aspectRatio = 4 / 3;
    const videoHeight =  Math.floor(videoWidth * aspectRatio);

    return {
      facingMode: 'environment',
      width: { ideal: videoWidth },
      height: { ideal: videoHeight },
      aspectRatio: aspectRatio
    };
  };

  // Gunakan fungsi ini saat Anda mengatur video constraints
  const videoConstraints = getVideoConstraints();

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot({ quality: 1 });
    setImageSrc(imageSrc);
    localStorage.setItem('ktp', imageSrc);

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
      formData.append('type', currentStep === 1 ? 'givaudan' : currentStep === 2 ? 'vendor' : '')
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA'
        },
        body: formData
      };

      const response = await fetch('https://bigvision.id/upload/free-form-ocr-extract', requestOptions);
      const data = await response.json();

      const formattedText = formatOcrData(data.message.results);
      setDataOcr(data.message.results);
      setEditorState(EditorState.createWithContent(ContentState.createFromText(formattedText)));
      setResult(true);
      setLoading(false);

      if (currentStep === 1) {
        setDataGivaudan(data.message.results);
        setImageGivaudan(data.message.image_url);
      } else if (currentStep === 2) {
        setDataVendor(data.message.results);
        setImageVendor(data.message.image_url);
      }
    } catch (error) {
      console.error('Error sending image:', error);
      setLoading(false);
    }
  };

  const formatOcrData = (dataOcr) => {
    return Object.entries(dataOcr).map(([key, value]) => {
      const formattedKey = key.replace('_', ' ').toUpperCase();
      return `${formattedKey} : ${value}`;
    }).join('\n');
  };

  // const formatDataResult = (dataOcr = {}) => {
  //   if (!dataOcr || !dataOcr.message) {
  //     console.error('dataOcr or dataOcr.message is undefined');
  //     console.log(dataOcr)

  //     return null;
  //   }

  //   return Object.entries(dataOcr).map(([key, value]) => {
  //     const formattedKey = key.replace('_', ' ').toUpperCase();
  //     return (
  //       <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 25, padding: 10 }}>
  //         <img src={require(value ? '../assets/icon-check.png' : '../assets/icon-wrong.png')} alt="check" style={{ width: '20px' }} />
  //         <span>{`${formattedKey} : ${value}`}</span>
  //       </div>
  //     );
  //   });
  // };

  const formatDataResult = (dataOcr = {}) => {
    const { results, results_status } = dataOcr;

    return Object.entries(results).map(([key, value]) => {
      const formattedKey = key.replace('_', ' ').toUpperCase();
      const status = results_status[key];

      return (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 25, padding: 10 }}>
          <img src={require(status ? '../assets/icon-check.png' : '../assets/icon-wrong.png')} alt="check" style={{ width: '20px' }} />          <span>{`${formattedKey} : ${value}`}</span>
        </div>
      );
    });
  };


  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const handleChange = (key, newValue) => {
    if (currentStep === 1) {
      setDataGivaudan(prevData => ({
        ...prevData,
        [key]: newValue
      }));
    } else if (currentStep === 2) {
      setDataVendor(prevData => ({
        ...prevData,
        [key]: newValue
      }));
    }
  };

  const handleSave = () => {

    if (currentStep === 1) {
      setDataGivaudan(dataGivaudan);
    } else if (currentStep === 2) {
      setDataVendor(dataVendor);
    }

    setShowEdit(false);
  };

  const handleCancel = () => {
    const formattedText = formatOcrData(currentStep === 1 ? dataGivaudan : dataVendor);
    setEditorState(EditorState.createWithContent(ContentState.createFromText(formattedText)));
    setShowEdit(false);
  };

  const handleStepChange = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setResult(false);
    } else if (currentStep === 2) {
      await sendDataToApi();
      setCurrentStep(3);
    }
  };

  const sendDataConsole = () => {
    console.log('Sending dataGivaudan:', dataGivaudan);
    console.log('Sending dataVendor:', dataVendor);
    setMatchResult(true)
  }

  const sendDataToApi = async () => {
    try {
      const response = await fetch('https://bigvision.id/upload/free-form-ocr-extract/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA',
        },
        body: JSON.stringify({ dataGivaudan, dataVendor, imageGivaudan, imageVendor })
      });

      const data = await response.json();
      setDataMatching(data.message);
      setStatusMatching(data.message.summary);
      setMatchResult(true)
    } catch (error) {
      console.error('Error sending data to API:', error);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(1)
      setShowEdit(false)
      setResult(false)
    } else if (currentStep === 2) {
      setResult(true);
      setCurrentStep(1)
      setShowEdit(false);
    }
  }

  const handleBackResult = () => {
    if (currentStep === 1) {
      setCurrentStep(1)
      setShowEdit(false)
      setResult(false)
    } else if (currentStep === 2) {
      setResult(false);
      setCurrentStep(2)
      setShowEdit(false);
    } else if (currentStep === 3) {
      setResult(true);
      setCurrentStep(2);
      setShowEdit(false);
      setMatchResult(false)
    }
  }

  const backHome = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 1);
    window.location.href = url.toString();
  }

  return (
    <div className="webcam-container">
      {result !== true ?
        <div className="webcam-img">
          <img
            className="bg-image"
            alt=""
            src={bgImage} />

          <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: '25px', position: 'fixed', fontSize: 14, fontWeight: 600, top: 10, left: 0, right: 0, zIndex: 1000, textAlign: 'left', background: '#00000' }}>
            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
              <div style={{ textAlign: 'left' }} onClick={handleBack}>
                <ArrowLeft size={25} color="#ffff" strokeWidth={2} />
              </div>

              <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
                <div style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>{currentStep === 1 ? '1/3' : '2/3'}</div>
                <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'flex' }}>
                  {currentStep === 1 ? <CurrentStep /> : <DoneStep />}
                  {currentStep === 1 ? <TodoStep /> : <CurrentStep />}
                  <TodoStep />
                </div>
              </div>
              <span style={{ color: 'white', fontSize: '14px' }}>{currentStep === 1 ? 'Foto Manufaktur Givaudan Anda' : 'Foto Manufaktur Vendor Anda'}</span>
            </div>
          </div>

          {loading ?
            <div className="webcam-video">
              <img src={imageSrc} alt="captured"
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', objectFit: 'cover', overflow: 'hidden' }}
              />
            </div>
            :
            // <div className="webcam-video">
            <Webcam
              className="webcam"
              scale={1}
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              screenshotQuality={1}
              style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', objectFit: 'cover', overflow: 'hidden' }}
            />
            // </div>
          }

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, padding: 15 }}>
            {loading ?
              <div>
                <div style={{ color: '#ffff', marginBottom: '20px' }}>Menunggu proses ekstrasi..</div>
              </div>
              :
              <div style={{ padding: '0px 20px 0px 20px' }}>
                <div style={{ color: '#ffff', marginBottom: '15px', fontSize: '12px' }}>Sesuaikan posisi manufaktur</div>
                <button className="next-button" onClick={capture}><Camera size={20} strokeWidth={3} color="#ffff" />&nbsp;Scan</button>
              </div>
            }
          </div>
        </div>
        :
        <div>
          {!detailMatch ?
            <div
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={handleBackResult}
            >
              <ArrowLeft size={30} color="#ffff" strokeWidth={2} />
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {currentStep === 1 ? 'Manufaktur Givaudan' : currentStep === 2 ? 'Manufaktur Vendor' : currentStep === 3 ? 'Matching Data' : ''}
                </div>
              </div>
            </div>
            :
            <div
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => setDetailMatch(false)}
            >
              <ArrowLeft size={30} color="#ffff" strokeWidth={2} />
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  Match Detail
                </div>
              </div>
            </div>
          }
          <div className="bg-welcoming" style={{ padding: '20px', marginBottom: '5%' }}>
            {!matchResult ?
              <div>
                {!showEdit ?
                  <div>
                    <div className="bg-ktp-result" style={{ display: 'inline-flex', placeItems: 'center', width: '80%' }}>
                      <CircleCheck color="#0a8053" size={50} />
                      <div style={{ color: '#272D4E', fontSize: 20, fontWeight: '700', wordWrap: 'break-word', marginLeft: '10px' }}>Scan Berhasil</div>
                    </div>
                    <div style={{ marginTop: '50px' }}>
                      <div>
                        <img src={currentStep === 1 ? imageGivaudan : imageVendor} alt="captured" style={{ width: '100%', borderRadius: '15px', }} />
                        <div style={{ margin: '20px', fontWeight: '600', fontSize: '18px', color: '#272D4E', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Detail<span style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => setShowEdit(true)}><Pencil color="#002E5E" size={18} /></span></div>
                        <div style={{ textAlign: 'left', padding: '10px', background: '#F5F8FF', borderRadius: 10 }}>
                          <Editor
                            editorState={EditorState.createWithContent(ContentState.createFromText(formatOcrData(currentStep === 1 ? dataGivaudan : dataVendor)))}
                            onChange={handleEditorChange}
                            readOnly={!showEdit}
                          />
                        </div>
                        <br />
                        <button className="next-button" onClick={handleStepChange}>{currentStep === 1 ? 'Lanjutkan (1/3)' : 'Match Data (2/3)'}</button>
                      </div>
                    </div>
                  </div>
                  :
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '18px', color: '#272D4E', marginBottom: '20px' }}>Detail</div>
                    <div style={{ padding: '20px', background: '#FAFAFA', border: '2px solid #E8E8E8', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {Object.entries(currentStep === 1 ? dataGivaudan : dataVendor).map(([key, value]) => (
                        <div style={{ color: '#5F5F5F', fontWeight: '600', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }} key={key}>
                          <span style={{ wordWrap: 'break-word' }}>{key.replace('_', ' ').toUpperCase()} : </span>
                          <input
                            style={{ height: '40px', border: '1px solid #E8E8E8', borderRadius: 5, fontSize: '20px', padding: '0 10px 0 10px' }}
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '20px', display: 'inline-flex', gap: 10, width: '100%' }}>
                      <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                      <button className="next-button" onClick={handleSave}>Save</button>
                    </div>
                  </div>
                }
              </div>
              :
              <div>
                {!detailMatch ?
                  <div>
                    <div>
                      <div style={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ color: '#130F26', fontWeight: 600, letterSpacing: 2 }}>3/3</div>
                        <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex' }}>
                          <DoneStep />
                          <DoneStep />
                          <DoneStep />
                        </div>
                      </div>
                      <div style={{ textAlign: 'left', marginTop: 10, color: '#130F26', fontWeight: 600 }}>Mencocokkan data manufaktur</div>
                    </div>

                    <div style={{ marginTop: '50px' }}>
                      <div style={{ color: statusMatching ? '#03A08B' : '#F54A45', fontSize: 28, fontWeight: 500 }}>
                        {statusMatching ? 'Data Match' : 'Data Tidak Match'}
                      </div>
                      <img src={require(`../assets/${statusMatching ? 'match' : 'notmatch'}.png`)} alt="Welcoming" />
                    </div>
                    <div style={{ marginTop: '40px', marginBottom: '40px', color: '#0F133E', fontSize: '20px', fontWeight: '600' }}>
                      {statusMatching ? 'Data Manufaktur Anda dengan Vendor Match' : 'Silahkan ulangi proses scan manufaktur'}
                    </div>
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'inline-flex', gap: 20, alignItems: 'center' }} onClick={() => setDetailMatch(true)}>
                        <div style={{ color: '#0549CF' }}>Lihat Detail</div>
                        <div><ArrowRight size={24} color="#0549CF" strokeWidth={2} absoluteStrokeWidth /></div>
                      </div>
                    </div>
                    {statusMatching ?
                      <button className="next-button" onClick={backHome}>Menu Utama</button>
                      :
                      <button className="next-button" onClick={() => { setCurrentStep(2); setResult(false); setMatchResult(false) }}>Ulangi</button>
                    }
                  </div>
                  :
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ background: statusMatching ? '#F0FFFD' : '#FFF0F0', borderRadius: 4 }}>
                      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'inline-flex', gap: 6, padding: '10px' }}>
                        <img src={require(statusMatching ? '../assets/icon-check.png' : '../assets/icon-wrong.png')} alt="check" style={{ width: '20px' }} />
                        <div style={{ color: statusMatching ? '#03A08B' : '#F54A45', fontSize: 18, fontWeight: '700' }}>{statusMatching ? 'Data Match' : 'Data Tidak Match'}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ color: '#737373', textAlign: 'left', marginBottom: '10px' }}>Manufaktur Givaudan</div>
                      <img src={imageGivaudan} alt="captured" style={{ width: '100%', borderRadius: '15px' }} />
                      <div style={{ margin: '20px' }}><ArrowUpDown color="#2D5988" strokeWidth={2} /></div>
                      <div style={{ color: '#737373', textAlign: 'left', marginBottom: 10 }}>Manufaktur Vendor</div>
                      <div style={{ textAlign: 'left', padding: '10px', background: '#F5F8FF', borderRadius: 10 }}>
                        <div>{formatDataResult(dataMatching)}</div>
                      </div>
                      <br />
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div className="footer">
            <img src={require('../assets/bigvision.png')} alt="Welcoming" />
          </div>
        </div >
      }
    </div >
  );
}
