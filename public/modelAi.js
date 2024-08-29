import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver } = vision;

async function createFaceLandmarker() {
  Window.prototype.eventEmitter = new EventTarget();
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    numFaces: 1
  });
  // console.log(faceLandmarker, 'from module');
  Window.prototype.eventEmitter.dispatchEvent(new CustomEvent('fecelandmarker-load', { detail: {  faceLandmarker }, cancelable: true }));
  Window.prototype.faceLandmarker = faceLandmarker;
}
const step = (new URL(window.location.href)).searchParams.get("step");
if(step === 'face-recognition-testing'){
  createFaceLandmarker()
}
