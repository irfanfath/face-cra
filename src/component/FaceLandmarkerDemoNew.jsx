import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as vision from '@mediapipe/tasks-vision';

const pipeline = [
  { task: 'hadap-kiri' },
  { task: 'hadap-kanan' },
  { task: 'buka-mulut' }
];
const FaceLandmarker = () => {
  const faceLandmarkerRef = useRef(false);
  const piplieRef = useRef(0);
  const isVideo = useRef(false);

  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  // const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRunningRef = useRef(false);
  const videoBlendShapesRef = useRef(null);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState('');


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
      faceLandmarkerRef.current = newFaceLandmarker;
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
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        });
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    } else {
      webcamRunningRef.current = false;
      videoRef.current.getTracks().forEach(track => track.stop());
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

  const captureImage = useCallback(() => {
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
    alert("success");
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
    const newIndex = piplieRef.current + 1;

    // If eyelookinleft value is greater than 0.7 and the current task is 'hadap-kiri', move to the next item in the pipeline
    if (eyelookinleftValue > 0.7 && currentTask === 'hadap-kiri') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex((val) => {
          piplieRef.current = val + 1;
          return val + 1
        })
      } else {
        captureImage();
      }
    } else if (eyelookinrightValue > 0.7 && currentTask === 'hadap-kanan') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex((val) => {
          piplieRef.current = val + 1;
          return val + 1
        })
      } else {
        captureImage();
      }
    } else if (jawopenValue > 0.7 && currentTask === 'buka-mulut') {
      if (newIndex !== pipeline.length) {
        setPipelineIndex((val) => {
          piplieRef.current = val + 1;
          return val + 1
        })
      } else {
        captureImage();
      }
    }
  }, [captureImage]);

  const drawBlendShapesRealTime = useCallback((result) => {
    drawBlendShapes(videoBlendShapesRef.current, result.faceBlendshapes);

    // Call this function again to keep updating when the browser is ready.
    if (webcamRunningRef.current) {
      window.requestAnimationFrame(drawBlendShapesRealTime);
    }
  }, [drawBlendShapes]);



  return (
    <div>
      <section id="demos">
        <div id="liveView" className="videoView">
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
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0 }} autoPlay playsInline></video>
            <canvas ref={canvasRef} className="output_canvas" style={{ position: 'absolute', left: 0, top: 0 }}></canvas>
          </div>
        </div>

      </section>
    </div>
  );
};

export default FaceLandmarker;
