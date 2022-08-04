import { Routes, Route } from "react-router-dom"
import { CaptureContextProvider } from "./CaptureContext"
import { CaptureView } from "./CaptureView"

export const CaptureRoute = () => {
  return (
    <CaptureContextProvider>
      <Routes>
        <Route index element={<CaptureView />} />
        <Route path="containers/:containerId/ports/:port" element={<CaptureView />} />
      </Routes>
    </CaptureContextProvider>
  );
}