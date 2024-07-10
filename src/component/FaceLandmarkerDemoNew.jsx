import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const pipeline = [
  { task: 'ktp-extract', word: 'Silahkan Tunjukan KTP Anda' },
  { task: 'hadap-kiri', word: 'Silahkan Hadap Kiri' },
  { task: 'hadap-kanan', word: 'Silahkan Hadap Kanan' },
  { task: 'buka-mulut', word: 'Silahkan Buka Mulut' },
  { task: 'kedip-mata', word: 'Silahkan Kedipkan Mata Anda' },
  { task: 'hadap-depan', word: 'Silahkan menghadap depan' },
  { task: 'face-liveness', word: 'Silahkan Lihat Kamera' },
  // { task: 'selesai', word: 'Selesai' }
];
// let controller = new AbortController();
// let loadingController = false;

const handleApi = async (body) => {
  try {
    const action = await fetch('https://bigvision.id/api/ekyc/check', {
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return action.json();
  } catch (e) {
    return e;
  }
}

const handleLiveness = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA'
      const blob = base64ToBlob(image, 'image/jpeg');
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const action = await fetch('https://bigvision.id/upload/face-liveness', {
        body: formData,
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await action.json();

      // if (data.success) {
      //   const results = data.message.results;
      //   if (results.includes('fake')) {
      //     alert('Alert: Fake detected!');
      //   } else {
      //     alert('Alert: Real person!');
      //   }
      // } else {
      //   alert('Alert: Error in liveness check!');
      // }
      return resolve(data)
    } catch (e) {
      return reject(e)
    }
  })
}

function base64ToBlob(base64, type = 'application/octet-stream') {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

const DEFAULT_VALUE_PIPELINE = [0, 1, 2, 3, 4, 5];
const FaceLandmarker = () => {
  const faceLandmarkerRef = useRef(false);
  const pipelineRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isVideo = useRef(false);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [dynamicPipeline, setDynamicPipeline] = useState(DEFAULT_VALUE_PIPELINE);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [message, setMessage] = useState([]);
  const [messageError, setMessageError] = useState([]);
  // const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const dynamicPipelineRef = useRef(pipeline);
  const requestAnimationRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const videoBlendShapesRef = useRef(null);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState('');
  const [instructionMessage, setInstructionMessage] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [loading, setLoading] = useState(true)
  const [cameraFacingMode, setCameraFacingMode] = useState('user');

  useEffect(() => {
    const pipelineQueryParam = new URL(window.location.href).searchParams.get('pipeline');
    const messagesQueryParam = new URL(window.location.href).searchParams.get('messages');

    const pipelineQueryParamArray = (pipelineQueryParam != null && pipelineQueryParam !== '') ? pipelineQueryParam.split(',').map((value) => pipeline[value]) : pipeline;
    setDynamicPipeline(pipelineQueryParamArray);
    const messagesQueryParamArray = (messagesQueryParam != null && messagesQueryParam !== '') ? messagesQueryParam.split(',') : [];
    setMessage(messagesQueryParamArray);

    dynamicPipelineRef.current = pipelineQueryParamArray;
    const createFaceLandmarker = async () => {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const newFaceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
      });
      faceLandmarkerRef.current = newFaceLandmarker;
      enableCam();
    };
    createFaceLandmarker();
  }, []);

  const enableCam = () => {
    if (!faceLandmarkerRef.current) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning(!webcamRunning);
    if (!webcamRunning) {
      webcamRunningRef.current = true;
      try {
        navigator.mediaDevices.getUserMedia({ facingMode: cameraFacingMode, video: { width: { min: 300 }, height: { min: 500 }, aspectRatio: 16 / 9 } }).then((stream) => {
          videoRef.current.srcObject = stream;
          cameraRef.current = stream;
          // videoRef.current.addEventListener("loadeddata", predictWebcam);
          videoRef.current.addEventListener("loadeddata", () => {
            setLoading(false);
            predictWebcam();
          });
        });
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    } else {
      webcamRunningRef.current = false;
      cameraRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const predictWebcam = async (e) => {
    if (!isVideo.current) {
      isVideo.current = true;
      faceLandmarkerRef.current.setOptions({ runningMode: "VIDEO" });
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunningRef.current) {
        requestAnimationRef.current = window.requestAnimationFrame(predictWebcam);
      }
    } else {
      let startTimeMs = performance.now();
      const newResults = await faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      if (webcamRunningRef.current) {
        drawBlendShapesRealTime(newResults);
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunningRef.current && !isLoadingRef.current) {
        requestAnimationRef.current = window.requestAnimationFrame(predictWebcam);
      }
    }
  };
  const storeData = (isLast) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    return new Promise((resolve, reject) => {
      const base64 = imageData.split(',')[1];
      const obj = {
        image: base64
      };

      const idRequest = new URL(window.location.href).searchParams.get('id_request');
      const app = new URL(window.location.href).searchParams.get('app');
      if (isLast) {
        obj.transactionId = "EKYC_" + ((new Date()).getTime()) + "_bmsk";
        obj.idRequest = idRequest;
        obj.app = app;
      }
      if (idRequest && app && app !== '' && idRequest !== '') {
        setRejectMessage("")
        handleApi(obj).then((res) => {
          window.requestAnimationFrame(predictWebcam);
          isLoadingRef.current = false;
          setMessageError((val) => [...val, res])
          if (res.success) {
            resolve(obj);
          } else {
            setRejectMessage("Something Wrong !!")
            reject();
          }
        }).catch(() => {
          window.requestAnimationFrame(predictWebcam);
          isLoadingRef.current = false;
          setRejectMessage("Something Wrong !!")
          reject();
        })
      } else {
        setRejectMessage("Parameter Invalid")
        reject();
      }
    })
  };

  const drawBlendShapes = useCallback((el, blendShapes) => {
    if (!blendShapes || !blendShapes.length) {
      return;
    }
    const pipelineCount = (dynamicPipelineRef.current.length - 1);
    if (!isLoadingRef.current && pipelineRef.current <= pipelineCount) {
      const eyelookinleftValue = blendShapes[0]?.categories.find(
        (shape) => shape.categoryName === "eyeLookInLeft"
      )?.score;

      const eyelookinrightValue = blendShapes[0]?.categories.find(
        (shape) => shape.categoryName === "eyeLookInRight"
      )?.score;

      const jawopenValue = blendShapes[0]?.categories.find(
        (shape) => shape.categoryName === "jawOpen"
      )?.score;

      const eyeBlink = blendShapes[0]?.categories.find(
        (shape) => shape.categoryName === "eyeBlinkLeft"
      )?.score;

      const currentTask = dynamicPipelineRef.current[pipelineRef.current]?.task;
      if (eyelookinleftValue > 0.5 && currentTask === 'hadap-kiri') {
        isLoadingRef.current = true;
        storeData(pipelineRef.current === pipelineCount).then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            // handleLiveness(res.image)
            // .then(() => {
            window.location.href = 'https://bigvision.id?image=' + res.image + '&transaction_id=' + res.transactionId;
            // })
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
            })
          }
        }).catch(() => { });
      } else if (eyelookinrightValue > 0.5 && currentTask === 'hadap-kanan') {
        // pipelineFunc(pipelineRef.current, pipelineCount)
        isLoadingRef.current = true;
        storeData(pipelineRef.current === pipelineCount).then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            // handleLiveness(res.image)
            // .then(() => {
            window.location.href = 'https://bigvision.id?image=' + res.image + '&transaction_id=' + res.transactionId;
            // })
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
            })
          }
        }).catch(() => { });
      } else if (jawopenValue > 0.4 && currentTask === 'buka-mulut') {
        isLoadingRef.current = true;
        storeData(pipelineRef.current === pipelineCount).then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            // handleLiveness(res.image)
            // .then(() => {
            window.location.href = 'https://bigvision.id?image=' + res.image + '&transaction_id=' + res.transactionId;
            // })
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
            })
          }
        }).catch(() => { });
      } else if (eyeBlink > 0.65 && currentTask === 'kedip-mata') {
        isLoadingRef.current = true;
        setTimeout(() => {
          storeData(pipelineRef.current === pipelineCount).then((res) => {
            if (pipelineRef.current === pipelineCount) {
              cameraRef.current.getTracks().forEach(track => track.stop());
              // handleLiveness(res.image)
              // .then(() => {
              window.location.href = 'https://bigvision.id?image=' + res.image + '&transaction_id=' + res.transactionId;
              // })
            } else {
              setPipelineIndex((val) => {
                pipelineRef.current = val + 1;
                return val + 1
              })
            }
          }).catch(() => { });
        }, 1000)
      } else if (jawopenValue < 0.2 && currentTask === 'hadap-depan') {
        isLoadingRef.current = true;
        setTimeout(() => {
          storeData(pipelineRef.current === pipelineCount).then((res) => {
            if (pipelineRef.current === pipelineCount) {
              cameraRef.current.getTracks().forEach(track => track.stop());
              // handleLiveness(res.image)
              // .then(() => {
              window.location.href = 'https://bigvision.id?image=' + res.image + '&transaction_id=' + res.transactionId;
              // })
            } else {
              setPipelineIndex((val) => {
                pipelineRef.current = val + 1;
                return val + 1
              })
            }
          }).catch(() => { });
        }, 1000)
      } else if (jawopenValue < 0.2 && currentTask === 'face-liveness') {
        isLoadingRef.current = true;
        storeData(pipelineRef.current === pipelineCount).then((res) => {
          if (pipelineRef.current === pipelineCount) {
            handleLiveness(res.image)
              .then((res) => {
                alert(res.message.results[0].liveness)
                cameraRef.current.getTracks().forEach(track => track.stop());
              })
          } else {
            handleLiveness(res.image)
              .then((res) => {
                alert(res.message.results[0].liveness)
                if (res.message.results[0].liveness === 'real') {
                  alert(res.message.results[0].liveness)
                  setPipelineIndex((val) => {
                    pipelineRef.current = val + 1;
                    return val + 1
                  })
                } else {
                  alert(res.message.results[0].liveness)
                }
              })

          }
        }).catch(() => { });
      }
    }


  }, []);

  const drawBlendShapesRealTime = useCallback((result) => {
    drawBlendShapes(videoBlendShapesRef.current, result.faceBlendshapes);

    // console.log(result?.faceLandmarks?.[0]?.[4]?.x)
    // console.log(result?.faceLandmarks?.[0]?.[4]?.y)

    const faceAreaHorizontal = result?.faceLandmarks?.[0]?.[4]?.x
    const faceAreaVertikal = result?.faceLandmarks?.[0]?.[4]?.y

    if ((faceAreaHorizontal < 0.4 || faceAreaHorizontal > 0.6) && (faceAreaVertikal < 0.4 || faceAreaVertikal > 0.6)) {
      setInstructionMessage("Posisikan Wajah Anda di tengah");
    } else {
      setInstructionMessage("")
    }

    if (webcamRunningRef.current) {
      window.requestAnimationFrame(drawBlendShapesRealTime);
    }
  }, [drawBlendShapes]);
  const isLastMessage = useMemo(() => {
    let text = '';
    messageError.forEach((d) => {
      if (!d.success) {
        text = d.message;
      } else {
        text = ''
      }
    })
    return text;
  }, [messageError]);

  const handleCapture = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    const base64Response = await fetch(imageData);
    const blob = await base64Response.blob();

    const file = new File([blob], 'captured_image.jpeg', { type: 'image/jpeg' });

    setCapturedImage(imageData);

    const handleOCR = async () => {
      try {
        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2Qk55YVpaU0dBVk5Zek12ZEp2ajhWUkdyOFVGUF9qUnh1dFdFd3Exa0RZIn0.eyJleHAiOi0xODAxNTkxNTU4LCJpYXQiOjE2MjkzNzU3MzgsImp0aSI6IjExYWVjZjJlLTNhNDMtNDEyMy05MDFjLTZkOGI0YjliMWMwOSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL2F1dGgvcmVhbG1zL3BpY2Fzby1wbGF0Zm9ybSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYjU1OTNhMi03MTQ4LTRkNzAtOTBkMC0yMTI3NGQyMjdmMDEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbiIsInNlc3Npb25fc3RhdGUiOiI4OTRhYmE4OS1hYTFjLTQwNDEtYmIyZC0yNGQ2YTEwMDQ2NDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vZHNjLW9jci51ZGF0YS5pZDo4MDgzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWJkYW5tdWxpYTQgYWJkYW5tdWxpYTQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjZDMyN2U3ZS1kNDQ0LTRkZGMtOTMyZS04NGYyYjBhOTMyY2EiLCJnaXZlbl9uYW1lIjoiYWJkYW5tdWxpYTQiLCJmYW1pbHlfbmFtZSI6ImFiZGFubXVsaWE0IiwiZW1haWwiOiJqc3Vwb3lvQGdtYWlsLmNvbSJ9.QHe4RwUVmRhE8DunHEte5DSgJfjfJ7MjDPkQUsOVNFUW600bAmAssAsWSCDNogUw__161jv6LzzBaqa0dTNEhZOmfl3wVoRK7Km1ZJsnSmcm6y2y05WbKKChvdbDTGw8zyCmt5iFOtnZLh1Y-U2M1EvogjzFTLHGf_FPPAHtGRXR9w2GOOiXjvCCLq9Nng7rtVyLj0vRAQG4KThkjm0mCIsWyUBnl96lmicARsedEhOH44DyrlyoXs5rA8BKbgXJuMKAorI36I3U-4C9IbBKfYQeZg0lo5Z-V4tbPVgNYvTnSK9lNCR3Su8polqTt8dFgg8QIIf-kv7bDtJ42EEJrA';
        const formData = new FormData();
        formData.append('image', file);

        const requestOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        };
        setLoading(true)
        const response = await fetch('https://bigvision.id/upload/ktp-extraction  ', requestOptions);
        const data = await response.json();

        console.log('Response from server:', data);
        alert(
          'Nama: ' + data.message.results.nama + '\n' +
          'NIK: ' + data.message.results.nik + '\n' +
          'Tanggal Lahir: ' + data.message.results.ttl
        );
        setLoading(false)
        setPipelineIndex((val) => {
          pipelineRef.current = val + 1;
          return val + 1
        })
      } catch (error) {
        console.error('Error sending image:', error);
      }
    };

    handleOCR();
  };

  const switchCameraFacingMode = () => {
    setCameraFacingMode(prevMode =>
      prevMode === 'user' ? 'environment' : 'user'
    );
  };

  return (
    <div>
      <section id="demos">
        <div id="liveView" className="videoView">
          {(dynamicPipeline[pipelineIndex]?.task) !== 'ktp-extract' &&
            <img className="bg-image" alt="" src={require('../assets/Subtract.png')} />
          }
          <div style={{ position: 'relative' }}>
            {videoRef &&
              <video poster="noposter" ref={videoRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100vh', objectFit: 'cover', overflow: 'hidden' }} autoPlay playsInline></video>
            }
            {
              rejectMessage !== '' ? (
                <div style={{ zIndex: "2000", background: "#C40C0C", position: 'absolute', top: 0, left: 0, right: 0, height: 'fit' }}>
                  <span style={{ color: "white", padding: "10px", display: "block" }}>{rejectMessage}</span>
                </div>
              ) : null
            }
            {loading ?
              <div style={{ position: 'fixed', fontSize: 26, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
                <span style={{ color: 'white' }}>Harap Tunggu<br /><span style={{ fontSize: 20 }}>sedang memproses kamera</span></span>
              </div>
              :
              <div style={{ position: 'fixed', fontSize: 22, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
                <span style={{ color: 'white' }}>
                  {(message && message[pipelineIndex]) || (dynamicPipeline[pipelineIndex]?.word)}
                  <br />
                  <span style={{ fontSize: 20 }}>{instructionMessage}</span>
                </span>
              </div>
            }

          </div>
        </div>
        <div style={{ position: 'fixed', bottom: 70, left: 0, right: 0, zIndex: 1000 }}>
          {/* {capturedImage && (
            <div style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 1000 }}>
              <img src={capturedImage} alt="Captured" style={{ maxWidth: 200, maxHeight: 200 }} />
            </div>
          )} */}
          {(dynamicPipeline[pipelineIndex]?.task) === 'ktp-extract' &&
            <div>
              <button disabled={loading} onClick={handleCapture}>Capture</button>
              <button onClick={switchCameraFacingMode}>Switch Camera</button>
            </div>
          }
          <span style={{ color: 'white' }}>{isLastMessage}</span>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
