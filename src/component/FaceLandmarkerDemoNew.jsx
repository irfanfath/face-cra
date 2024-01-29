import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const pipeline = [
  { task: 'hadap-kiri', queryParamLabel: 'left', word: 'Silahkan Hadap Kiri' },
  { task: 'hadap-kanan', queryParamLabel: 'right', word: 'Silahkan Hadap Kanan' },
  { task: 'buka-mulut', queryParamLabel: 'open', word: 'Silahkan Buka Mulut' },
  { task: 'selesai', queryParamLabel: 'finish', word: 'Selesai' }
];
const handleApi = async (image) => {
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
}
const FaceLandmarker = () => {
  const faceLandmarkerRef = useRef(false);
  const piplieRef = useRef(0);
  const isVideo = useRef(false);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [message, setMessage] = useState([]);
  // const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const videoBlendShapesRef = useRef(null);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState('');


  useEffect(() => {
    const status = new URL(window.location.href).searchParams.get('status');
    const piplineStart = (element) => element.queryParamLabel === status;
    // console.log(piplineStart);
    let isIndex = (status && status !== '') ? pipeline.findIndex(piplineStart) : 0;
    piplieRef.current = isIndex;
    setPipelineIndex(isIndex)
    // setPipelineIndex(isIndex)
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
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
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
  const updateQueryParam = (status) => {

    if (window.history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?status=' + status;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  }
  const storeData = useCallback(() => {
    // Code to capture the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the captured image to a base64 string
    const imageData = canvas.toDataURL('image/jpeg');
    handleApi(imageData.split(',')[1]).then((res) => {
      setMessage((val) => [...val, res])
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

    const currentTask = pipeline[piplieRef.current]?.task;
    // If eyelookinleft value is greater than 0.7 and the current task is 'hadap-kiri', move to the next item in the pipeline
    if (eyelookinleftValue > 0.5 && currentTask === 'hadap-kiri') {
      setPipelineIndex((val) => {
        piplieRef.current = val + 1;
        return val + 1
      })
      storeData();
      updateQueryParam('right');
    } else if (eyelookinrightValue > 0.5 && currentTask === 'hadap-kanan') {
      setPipelineIndex((val) => {
        piplieRef.current = val + 1;
        return val + 1
      })
      storeData();
      updateQueryParam('open');
    } else if (jawopenValue > 0.4 && currentTask === 'buka-mulut') {
      storeData();
      updateQueryParam('finish');
      // console.log(cameraRef.current)
      cameraRef.current.getTracks().forEach(track => track.stop());
    }
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
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100vh', 
                objectFit: 'cover', 
              }}
              autoPlay
              playsInline
            />            <div style={{ marginTop: '700px' }} className="overlay-text">{(pipeline[pipelineIndex].word)}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
