// FaceLandmarkerDemo.jsx
import React, { useEffect, useState } from 'react';
import vision from "@mediapipe/tasks-vision";

const FaceLandmarkerDemo = () => {
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function createFaceLandmarker() {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        process.env.PUBLIC_URL + "/wasm"
      );
      const faceLandmarkerInstance = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: './lib/face_landmarker.task',
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
      });
      setFaceLandmarker(faceLandmarkerInstance);
      document.getElementById("demos").classList.remove("invisible");
    }
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
      // ... (Tambahkan bagian ini untuk landmarks wajah lainnya)
    }

    drawBlendShapes(document.getElementById("image-blend-shapes"), faceLandmarkerResult.faceBlendshapes);
  };

  const enableCam = (event) => {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning(!webcamRunning);

    const constraints = {
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      const video = document.getElementById("webcam");
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  };

  const predictWebcam = async () => {
    const video = document.getElementById("webcam");
    const canvasElement = document.getElementById("output_canvas");
    const canvasCtx = canvasElement.getContext("2d");
  
    const radio = video.videoHeight / video.videoWidth;
    video.style.width = "480px";
    video.style.height = `${480 * radio}px`;
    canvasElement.style.width = "480px";
    canvasElement.style.height = `${480 * radio}px`;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
  
    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      await faceLandmarker.setOptions({ runningMode: "VIDEO" });
    }
  
    let startTimeMs = performance.now();
    if (results && results.faceLandmarks) {
      for (const landmarks of results.faceLandmarks) {
        vision.DrawingUtils.drawConnectors(
          landmarks,
          vision.FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        // ... (Tambahkan bagian ini untuk landmarks wajah lainnya)
      }
  
      drawBlendShapes(document.getElementById("video-blend-shapes"), results.faceBlendshapes);
    }
  
    setResults(await faceLandmarker.detectForVideo(video, startTimeMs));
  
    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };
  

  const drawBlendShapes = (el, blendShapes) => {
    if (!blendShapes || !blendShapes.length) {
      return;
    }

    let htmlMaker = "";
    blendShapes[0].categories.map((shape) => {
      htmlMaker += `
        <li class="blend-shapes-item">
          <span class="blend-shapes-label">${
            shape.displayName || shape.categoryName
          }</span>
          <span class="blend-shapes-value" style="width: calc(${
            +shape.score * 100
          }% - 120px)">${(+shape.score).toFixed(4)}</span>
        </li>
      `;
    });

    el.innerHTML = htmlMaker;
  };

  return (
    <div>
      <h1>Face landmark detection using the MediaPipe FaceLandmarker task</h1>
      <section id="demos" className="invisible">
        <h2>Demo: Detecting Images</h2>
        <p><b>Click on an image below</b> to see the key landmarks of the face.</p>

        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="image-blend-shapes"></ul>
        </div>

        <h2>Demo: Webcam continuous face landmarks detection</h2>
        <p>Hold your face in front of your webcam to get real-time face landmarker detection.<br />Click <b>enable webcam</b> below and grant access to the webcam if prompted.</p>

        <div id="liveView" className="videoView">
          <button id="webcamButton" className="mdc-button mdc-button--raised" onClick={enableCam}>
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">{webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE WEBCAM"}</span>
          </button>
          <div style={{ position: 'relative' }}>
            <video id="webcam" style={{ position: 'absolute', left: '0px', top: '0px' }} autoPlay playsInline></video>
            <canvas className="output_canvas" id="output_canvas" style={{ position: 'absolute', left: '0px', top: '0px' }}></canvas>
          </div>
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
        </div>
      </section>
    </div>
  );
};

export default FaceLandmarkerDemo;
