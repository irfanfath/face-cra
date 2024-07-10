import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

export default function WebcamCapture() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState("");


  let videoConstraints = {
    facingMode: 'environment',
    // width: 270,
    // height: 480,
    width: { min: 300 },
    height: { min: 500 },
    aspectRatio: 16 / 9,
  };

  return (
    <div className="webcam-container">
      <div className="webcam-img">
        {image === "" ? (
          <Webcam
            className="webcam"
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            screenshotQuality={1}
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', overflow: 'hidden' }}
          />
        ) : (
          <img
            src={image}
            alt="Scan"
            style={{ width: "500px", height: "auto" }}
          />
        )}
      </div>
    </div>
  );
}
