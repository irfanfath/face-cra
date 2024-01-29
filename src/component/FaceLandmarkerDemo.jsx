import React, { useEffect, useState, useRef } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const FaceLandmarker = () => {
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const videoBlendShapesRef = useRef(null);
  const videoWidth = 300;
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState('');

  const pipeline = [
    { task: 'hadap-kiri' },
    { task: 'hadap-kanan' },
    { task: 'buka-mulut' }
  ];

  useEffect(() => {
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
      setFaceLandmarker(newFaceLandmarker);
    };
    createFaceLandmarker();
  }, []);

  const enableCam = async () => {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning(!webcamRunning);
    if (!webcamRunning) {
      webcamRunningRef.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 300 }, height: { ideal: 300 }, frameRate: { ideal: 1 } }
        });
        setVideoStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    } else {
      webcamRunningRef.current = false;
      videoStream.getTracks().forEach(track => track.stop());
    }
  };

  const predictWebcam = async () => {
    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      await faceLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    let startTimeMs = performance.now();
    const newResults = await faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
    setResults(newResults);
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunningRef.current) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const drawBlendShapesRealTime = () => {
    drawBlendShapes(videoBlendShapesRef.current, results.faceBlendshapes);

    // Call this function again to keep updating when the browser is ready.
    if (webcamRunningRef.current) {
      window.requestAnimationFrame(drawBlendShapesRealTime);
    }
  };

  useEffect(() => {
    if (webcamRunningRef.current) {
      drawBlendShapesRealTime();
    }
  }, [results]);

  const drawBlendShapes = (el, blendShapes) => {
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

    const currentTask = pipeline[pipelineIndex]?.task;
    const newIndex = (pipelineIndex + 1)

    // If eyelookinleft value is greater than 0.7 and the current task is 'hadap-kiri', move to the next item in the pipeline
    if (eyelookinleftValue > 0.3 && currentTask === 'hadap-kiri') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex(pipelineIndex + 1)
      } else {
        captureImage();
      }
    } else if (eyelookinrightValue > 0.3 && currentTask === 'hadap-kanan') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex(pipelineIndex + 1)
      } else {
        captureImage();
      }
    } else if (jawopenValue > 0.3 && currentTask === 'buka-mulut') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex(pipelineIndex + 1)
      } else {
        captureImage();
      }
    }
  };

  const captureImage = () => {
    // Code to capture the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the captured image to a base64 string
    const imageData = canvas.toDataURL('image/jpeg');

    // Set the captured image in the state
    setCapturedImage(imageData);
    enableCam();
    console.log(imageData);
  };

  useEffect(() => {
    if (webcamRunningRef.current && results) {
      drawBlendShapesRealTime();
    }
  }, [webcamRunningRef.current, results]);



  return (
    <div>
      <section id="demos">
          <div>
            <button id="webcamButton" onClick={enableCam} className="mdc-button mdc-button--raised">
            <span className="mdc-button__label">{webcamRunning ? 'DISABLE WEBCAM' : 'ENABLE WEBCAM'}</span>
          </button>
            <div>{JSON.stringify(pipeline[pipelineIndex].task)}</div>
            {capturedImage && (
              <div>
                <h2>Captured Image</h2>
                <img src={capturedImage} alt="Captured" />
              </div>
            )}
            <div style={{ position: 'relative'}}>
              <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0 }} autoPlay playsInline></video>
            </div>
          </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
