import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const pipeline = [
  { task: 'hadap-kiri', word: 'Silahkan Hadap Kiri' },
  { task: 'hadap-kanan', word: 'Silahkan Hadap Kanan' },
  { task: 'buka-mulut', word: 'Silahkan Buka Mulut' },
  { task: 'selesai', word: 'Selesai' }
];
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
  const canvasRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const videoBlendShapesRef = useRef(null);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState('');
  const [instructionMessage, setInstructionMessage] = useState('');

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
        navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 300 }, height: { ideal: 500 }, aspectRatio: 4 / 3 } }).then((stream) => {
          videoRef.current.srcObject = stream;
          cameraRef.current = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
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
        window.requestAnimationFrame(predictWebcam);
      }
    } else {
      let startTimeMs = performance.now();
      const newResults = await faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      if (webcamRunningRef.current) {
        drawBlendShapesRealTime(newResults);
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunningRef.current) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  };
  const storeData = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    isLoadingRef.current = true;
    const imageData = canvas.toDataURL('image/jpeg');
    handleApi(imageData.split(',')[1]).then((res) => {
      isLoadingRef.current = false;
      setMessage((val) => [...val, res])
    }).catch(() => {
      isLoadingRef.current = false;
    });
  }, []);

  const drawBlendShapes = useCallback((el, blendShapes) => {
    if (!blendShapes || !blendShapes.length) {
      return;
    }
    const eyelookinleftValue = blendShapes[0]?.categories.find(
      (shape) => shape.categoryName === "eyeLookInLeft"
    )?.score;

    const eyelookinrightValue = blendShapes[0]?.categories.find(
      (shape) => shape.categoryName === "eyeLookInRight"
    )?.score;

    const jawopenValue = blendShapes[0]?.categories.find(
      (shape) => shape.categoryName === "jawOpen"
    )?.score;
    const pipelineFunc = (activeIndex, pipelineCount) => {
      storeData();
      if (activeIndex === pipelineCount) {
        cameraRef.current.getTracks().forEach(track => track.stop());
        window.location.href = 'https://bigvision.id/';
      } else {
        setPipelineIndex((val) => {
          pipelineRef.current = val + 1;
          return val + 1
        })
      }
    }
    const pipelineCount = (dynamicPipelineRef.current.length - 1);
    if (!isLoadingRef.current && pipelineRef.current <= pipelineCount) {
      const currentTask = dynamicPipelineRef.current[pipelineRef.current]?.task;
      if (eyelookinleftValue > 0.5 && currentTask === 'hadap-kiri') {
        pipelineFunc(pipelineRef.current, pipelineCount)
      } else if (eyelookinrightValue > 0.5 && currentTask === 'hadap-kanan') {
        pipelineFunc(pipelineRef.current, pipelineCount)
      } else if (jawopenValue > 0.4 && currentTask === 'buka-mulut') {
        pipelineFunc(pipelineRef.current, pipelineCount)
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
      }
    })
    return text;
  }, [message]);

  return (
    <div>
      <section id="demos">
        <div id="liveView" className="videoView">
          <img className="bg-image" alt="" src={require('../assets/bg-camera.png')} />
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100vh', objectFit: 'cover', overflow: 'hidden' }} autoPlay playsInline></video>
            <div style={{ position: 'fixed', fontSize: 26, fontWeight: 600, top: 50, left: 0, right: 0, zIndex: 1000 }}>
              <span style={{ color: 'white' }}>{(dynamicPipeline[pipelineIndex]?.word)}<br/><span style={{fontSize: 20}}>{instructionMessage}</span></span>
            </div>
          </div>
        </div>
        <div style={{ position: 'fixed', bottom: 30, left: 0, right: 0, zIndex: 1000 }}>
          <span style={{ color: 'white' }}>{isLastMessage}</span>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
