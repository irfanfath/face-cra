import React, { useEffect, useRef, useState } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let faceDetector;
let vision;

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
const children = [];

export default function TestFace() {
    const webcamRef = useRef(null);
    const [imageCapture, setImageCapture] = useState('');

    const initializeFaceDetector = async () => {
        vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
            // './node_modules/@mediapipe/tasks-vision/wasm'
        );
        faceDetector = await FaceDetector.createFromModelPath(vision,
            './lib/blaze_face_short_range.tflite'
        );
        handleLiveDetection();
    };

    useEffect(() => {
        initializeFaceDetector();
    }, []);

    const handleLiveDetection = async () => {
        if (!faceDetector) {
            alert("Face Detector is still loading. Please try again..");
            return;
        }

        if (!hasGetUserMedia()) {
            alert("getUserMedia() is not supported by your browser");
            return;
        }

        await faceDetector.setOptions({ runningMode: "VIDEO" });

        try {
            const cameraLabel = 'HD UVC WebCam';
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            const selectedCamera = cameras.find((camera) => camera.label.includes(cameraLabel));

            const constraints = {
                video: {
                    deviceId: selectedCamera?.deviceId,
                    height: { ideal: 720, max: window.innerHeight },
                    width: { ideal: 1280, max: window.innerWidth },
                    frameRate: {
                        min: 30,
                    },
                },
            };
            

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    webcamRef.current.srcObject = stream;
                    webcamRef.current.addEventListener("loadeddata", predictWebcam);
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };

    let lastVideoTime = -1;

    async function predictWebcam() {
        let startTimeMs = performance.now();

        if (webcamRef.current?.currentTime !== lastVideoTime) {
            lastVideoTime = webcamRef.current.currentTime;
            const detections = faceDetector.detectForVideo(webcamRef.current, startTimeMs).detections;
            displayVideoDetections(detections);
        }

        window.requestAnimationFrame(predictWebcam);
    }

    function displayVideoDetections(detections) {
        for (let detection of detections) {
            console.log("Confidence: " + Math.round(parseFloat(detection.categories[0].score) * 100) + "% .");
        }
    }

    const capture = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 720;

        try {
            canvas.getContext('2d').drawImage(webcamRef.current, 0, 0, webcamRef.current.videoWidth, webcamRef.current.videoHeight);
            let image_data_url = canvas.toDataURL('image/jpeg');

            console.log(image_data_url);
            setImageCapture(image_data_url);
        } catch (err) {
            console.error("Error: " + err);
        }
    };

    return (
        <div className='p-5'>
            <section className="stacked-section">
                {/* <img className="bg-image" alt="" src={require('../assets/bg-camera.png')} /> */}
                <div id="liveView" className="video-container">
                    <video ref={webcamRef} id="webcam" autoPlay playsInline></video>
                </div>
                {/* <button className="bg-indigo-500 rounded-2xl px-5 py-3 text-white" onClick={capture} title="Click to live face detection">Capture</button> */}
                {imageCapture && <img alt="" src={imageCapture} />}
            </section>
        </div>
    );
}
