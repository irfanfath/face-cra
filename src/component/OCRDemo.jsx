import React, { useEffect, useRef, useState } from 'react';

const OCRDemo = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { min: 300 },
                        height: { min: 500 },
                        aspectRatio: 16 / 9,
                        mirror: false
                    }
                });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            } catch (error) {
                console.error('Error accessing the camera:', error);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const capture = () => {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        const imageUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(imageUrl);
    };

    return (
        <div>
            <video ref={videoRef} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <button onClick={capture}>Capture</button>
            {imageSrc && (
                <div>
                    <h2>Preview:</h2>
                    <img src={imageSrc} alt="captured" />
                </div>
            )}
        </div>
    );
};

export default OCRDemo;
