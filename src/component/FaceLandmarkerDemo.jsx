import React, { useEffect, useState, useRef } from 'react';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const FaceLandmarker = () => {
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoBlendShapesRef = useRef(null);
  const videoWidth = 480;

  useEffect(() => {
    const createFaceLandmarker = async () => {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const newFaceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
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

  const handleClick = async (event) => {
    if (!faceLandmarker) {
      console.log("Wait for faceLandmarker to load before clicking!");
      return;
    }

    if (runningMode === "VIDEO") {
      setRunningMode("IMAGE");
      await faceLandmarker.setOptions({ runningMode });
    }

    const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
    for (let i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i];
      n.parentNode.removeChild(n);
    }

    const faceLandmarkerResult = await faceLandmarker.detect(event.target);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = `${event.target.width}px`;
    canvas.style.height = `${event.target.height}px`;

    event.target.parentNode.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const drawingUtils = new vision.DrawingUtils(ctx);
    for (const landmarks of faceLandmarkerResult.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        vision.FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }

    drawBlendShapes(videoBlendShapesRef.current, faceLandmarkerResult.faceBlendshapes);
  };

  const enableCam = async () => {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning(!webcamRunning);
    if (!webcamRunning) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    } else {
      videoStream.getTracks().forEach(track => track.stop());
    }
  };

  const predictWebcam = async () => {
    const radio = videoRef.current.videoHeight / videoRef.current.videoWidth;
    videoRef.current.style.width = videoWidth + "px";
    videoRef.current.style.height = videoWidth * radio + "px";
    canvasRef.current.style.width = videoWidth + "px";
    canvasRef.current.style.height = videoWidth * radio + "px";
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      await faceLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    let startTimeMs = performance.now();
    const newResults = await faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
    setResults(newResults);

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const drawBlendShapesRealTime = () => {
    drawBlendShapes(videoBlendShapesRef.current, results.faceBlendshapes);

    // Call this function again to keep updating when the browser is ready.
    if (webcamRunning) {
      window.requestAnimationFrame(drawBlendShapesRealTime);
    }
  };

  useEffect(() => {
    if (webcamRunning) {
      drawBlendShapesRealTime();
    }
  }, [results]);

  const drawBlendShapes = (el, blendShapes) => {
    if (!blendShapes || !blendShapes.length) {
      return;
    }
  
    const eyelookinleftValue = blendShapes[0].categories.find(
      (shape) => shape.categoryName === "eyeLookInLeft"
    )?.score;
  
    if (eyelookinleftValue !== undefined) {
      console.log("eyelookinleft:", eyelookinleftValue);
    }
  
    let htmlMaker = "";
  
    blendShapes[0].categories.forEach((shape) => {
      htmlMaker += `
        <li class="blend-shapes-item">
          <span class="blend-shapes-label">${shape.displayName || shape.categoryName}</span>
          <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">
            ${Math.round(parseFloat(+shape.score) * 100) + "%"}
          </span>
        </li>
      `;
    });
  
    el.innerHTML = htmlMaker;
  };
  

  return (
    <div>
      <section id="demos" className="invisible">
        <h2>Demo: Webcam continuous face landmarks detection</h2>
        <p>Hold your face in front of your webcam to get real-time face landmark detection. Click <b>enable webcam</b> below and grant access to the webcam if prompted.</p>

        <div id="liveView" className="videoView">
          <button id="webcamButton" onClick={enableCam} className="mdc-button mdc-button--raised">
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">{webcamRunning ? 'DISABLE WEBCAM' : 'ENABLE WEBCAM'}</span>
          </button>
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ position: 'absolute', left: 0, top: 0 }} autoPlay playsInline></video>
            <canvas ref={canvasRef} className="output_canvas" style={{ position: 'absolute', left: 0, top: 0 }}></canvas>
          </div>
        </div>

        <div className="blend-shapes">
          <ul className="blend-shapes-list" ref={videoBlendShapesRef}></ul>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarker;
