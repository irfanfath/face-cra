import { useEffect, useState } from "react";
import FaceLandmarkerWebbased from "./FaceLandmarkerDemoWebbased";
import { LoadingOverlay } from "./Loading";
import ErrorDisplay from "./Error";



const FaceLandmarkerDemoWebbasedBoundary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    setIsValid(false);
    fetch('https://bigvision.id/api/limit/check', { method: "get"})
      .then(async (res) => {
        setIsLoading(false);
        const data = await res.json();
        setIsValid(!data.is_limit)
      })
      .catch(() => {
        setIsLoading(false);
        setIsValid(false)
      })
  }, [])
  return <>
    <LoadingOverlay isLoading={isLoading}>
      {
        isValid ? <FaceLandmarkerWebbased /> : <ErrorDisplay  error="Something wrong" isVisible={!isLoading} /> 
      }
      
    </LoadingOverlay>
  </>
}

export default FaceLandmarkerDemoWebbasedBoundary;