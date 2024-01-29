import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  
  useEffect(() => {
    const pipelineQueryParam = new URL(window.location.href).searchParams.get('pipeline');
    const pipelineQueryParamArray = (pipelineQueryParam != null && pipelineQueryParam !== '') ? pipelineQueryParam.split(',').map((value) => pipeline[value]): pipeline ;
    setDynamicPipeline(pipelineQueryParamArray);
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
        navigator.mediaDevices.getUserMedia({ video: { width: { ideal: window.innerWidth }, height: { ideal: window.innerHeight } } }).then((stream) => {
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
    // Code to capture the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    isLoadingRef.current = true;
    // Convert the captured image to a base64 string
    const imageData = canvas.toDataURL('image/jpeg');
    handleApi(imageData.split(',')[1]).then((res) => {
      isLoadingRef.current = false;
      setMessage((val) => [...val, res])
    }).catch(() => {
      isLoadingRef.current = false;
    });
    // Set the captured image in the state
    // setCapturedImage(imageData);
    // alert("success");
    // enableCam();
    // console.log(imageData);
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
      if(activeIndex === pipelineCount) {
        cameraRef.current.getTracks().forEach(track => track.stop());        
      } else {
        setPipelineIndex((val) => {
          pipeline.current = val + 1;
          return val + 1
        })
      }
    }
    const currentTask = dynamicPipelineRef.current[pipelineRef.current]?.task;
    const pipelineCount = (dynamicPipelineRef.current.length - 1);
    if(!isLoadingRef.current && pipelineRef.current < pipelineCount){
      if (eyelookinleftValue > 0.5 && currentTask === 'hadap-kiri') {
        console.log('masuk sini 1')
        pipelineFunc(pipelineRef.current,pipelineCount)
      } else if (eyelookinrightValue > 0.5 && currentTask === 'hadap-kanan') {
        console.log('masuk sini 2')
        pipelineFunc(pipelineRef.current,pipelineCount)
      } else if (jawopenValue > 0.4 && currentTask === 'buka-mulut') {
        console.log('masuk sini 3')
        pipelineFunc(pipelineRef.current,pipelineCount)
      }
    }
    // If eyelookinleft value is greater than 0.7 and the current task is 'hadap-kiri', move to the next item in the pipeline
    
  }, []);

  const drawBlendShapesRealTime = useCallback((result) => {
    drawBlendShapes(videoBlendShapesRef.current, result.faceBlendshapes);

    // Call this function again to keep updating when the browser is ready.
    if (webcamRunningRef.current) {
      window.requestAnimationFrame(drawBlendShapesRealTime);
    }
  }, [drawBlendShapes]);

  console.log(message);
  return (
    <div>
      <section id="demos">
        <div id="liveView" className="videoView">
          <img className="bg-image" alt="" src={require('../assets/bg-camera.png')} />
          <div style={{ position: 'relative'}}>
            <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%'}} autoPlay playsInline></video>
            <div style={{marginTop: '750px'}} className="overlay-text">{(pipeline[pipelineIndex].word)}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
