import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const pipeline = [
  { task: 'hadap-kiri', word: 'Silahkan Hadap Kiri' },
  { task: 'hadap-kanan', word: 'Silahkan Hadap Kanan' },
  { task: 'buka-mulut', word: 'Silahkan Buka Mulut' },
  // { task: 'selesai', word: 'Selesai' }
];
// let controller = new AbortController();
// let loadingController = false;

const handleApi = async (image) => {
  try {
    const action = await fetch('https://bigvision.id/api/ekyc/check', {
      body: JSON.stringify({
        image,
      }),
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
const DEFAULT_VALUE_PIPELINE = [0, 1, 2, 3];
const FaceLandmarker = () => {
  const faceLandmarkerRef = useRef(false);
  const pipelineRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isVideo = useRef(false);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [dynamicPipeline, setDynamicPipeline] = useState(DEFAULT_VALUE_PIPELINE);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [message, setMessage] = useState([]);
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
  const [loading, setLoading] = useState(true)

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
        process.env.PUBLIC_URL + "/wasm"
      );
      const newFaceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: './lib/face_landmarker.task',
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
        navigator.mediaDevices.getUserMedia({ video: { width: { min: 300 }, height: { min: 500 }, aspectRatio: 16 / 9 } }).then((stream) => {
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
  const storeData = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    isLoadingRef.current = true;
    const imageData = canvas.toDataURL('image/jpeg');
    return new Promise((resolve, reject) => {
      const base64 = imageData.split(',')[1];
      handleApi(base64).then((res) => {
        window.requestAnimationFrame(predictWebcam);
        isLoadingRef.current = false;
        setMessage((val) => [...val, res])
        if (res.success) {
          resolve({
            image: base64,
          });
        } else {
          reject();
        }
      }).catch(() => {
        window.requestAnimationFrame(predictWebcam);
        isLoadingRef.current = false;
        reject();
      });
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

      // const pipelineFunc = (activeIndex, pipelineCount) => {
      //   storeData().then((res) => {
      //     if (activeIndex === pipelineCount) {
      //       cameraRef.current.getTracks().forEach(track => track.stop());
      //       window.location.href = 'https://bigvision.id?image=' + res.image;
      //     } else {
      //       setPipelineIndex((val) => {
      //         pipelineRef.current = val + 1;
      //         return val + 1
      //       })
      //     }
      //   }).catch(() => { });
      // }

      const currentTask = dynamicPipelineRef.current[pipelineRef.current]?.task;
      if (eyelookinleftValue > 0.7 && currentTask === 'hadap-kiri') {
        // pipelineFunc(pipelineRef.current, pipelineCount)
        storeData().then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            window.location.href = 'https://bigvision.id?image=' + res.image;
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
            })
          }
        }).catch(() => { });
      } else if (eyelookinrightValue > 0.7 && currentTask === 'hadap-kanan') {
        // pipelineFunc(pipelineRef.current, pipelineCount)
        storeData().then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            window.location.href = 'https://bigvision.id?image=' + res.image;
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
            })
          }
        }).catch(() => { });
      } else if (jawopenValue > 0.4 && currentTask === 'buka-mulut') {
        storeData().then((res) => {
          if (pipelineRef.current === pipelineCount) {
            cameraRef.current.getTracks().forEach(track => track.stop());
            window.location.href = 'https://bigvision.id?image=' + res.image;
          } else {
            setPipelineIndex((val) => {
              pipelineRef.current = val + 1;
              return val + 1
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
    message.forEach((d) => {
      if (!d.success) {
        text = d.message;
      } else {
        text = ''
      }
    })
    return text;
  }, [message]);

  return (
    <div>
      <section id="demos">
        <div id="liveView" className="videoView">
          {/* <img className="bg-image" alt="" src={require('../assets/bg-camera.png')} /> */}
          {dynamicPipelineRef.current[pipelineRef.current]?.task === 'hadap-kiri' ?
            // <img className="bg-image" alt="" src={leftImage} />
            <img className="bg-image" alt="" src={require('../assets/bg-camera1.png')} />
            :
            dynamicPipelineRef.current[pipelineRef.current]?.task === 'hadap-kanan' ?
              <img className="bg-image" alt="" src={require('../assets/bg-camera2.png')} />
              :
              <img className="bg-image" alt="" src={require('../assets/bg-camera3.png')} />
          }
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100vh', objectFit: 'none', overflow: 'hidden' }} autoPlay playsInline></video>
            {loading ?
              <div style={{ position: 'fixed', fontSize: 26, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
                <span style={{ color: '#000000' }}>Harap Tunggu<br /><span style={{ fontSize: 20 }}>sedang memproses kamera</span></span>
              </div>
              :
              <div style={{ position: 'fixed', fontSize: 22, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
                <span style={{ color: '#000000' }}>{(dynamicPipeline[pipelineIndex]?.word)}<br /><span style={{ fontSize: 20 }}>{instructionMessage}</span></span>
              </div>
            }

          </div>
        </div>
        <div style={{ position: 'fixed', bottom: 70, left: 0, right: 0, zIndex: 1000 }}>
          <span style={{ color: '#000000' }}>{isLastMessage}</span>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
