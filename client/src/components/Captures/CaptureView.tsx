import { Circle } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
import Home from "@mui/icons-material/Home";
import { Box, Tab, Tabs } from "@mui/material";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCaptureContext } from "./CaptureContext";
import { PacketView } from "./PacketView/PacketView";
import { StartCaptureModal } from "./StartCaptureModal/StartCaptureModal";

function a11yProps(index: string) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

export const CaptureView = () => {
  const navigate = useNavigate();
  const { containerId, port } = useParams();
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const { listeners } = useCaptureContext();
  const [value, setValue] = useState("home");

  const handleChange = useCallback((e: SyntheticEvent, newValue: string) => {
    if (newValue === "start-capture") return;
    if (newValue === "home") {
      navigate(`/`);
      return;
    }

    const [containerId, port] = newValue.split(":");
    navigate(`/containers/${containerId}/ports/${port}`);
  }, [navigate]);

  useEffect(() => {
    if (!containerId || !port) 
      return setValue("home");
    setValue(`${containerId}:${port}`);
  }, [containerId, port]);

  const onStartCapture = useCallback((e: any) => {
    e.preventDefault();
    setShowCaptureModal(true);
  }, [setShowCaptureModal]);

  const onCaptureModalClose = useCallback((containerId?: string, port?: string) => {
    setShowCaptureModal(false);
    if (containerId && port)
      navigate(`/containers/${containerId}/ports/${port}`);
  }, [setShowCaptureModal, navigate]);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2, marginTop: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Nav panel">
          <Tab
            value="home"
            label="Start"
            icon={<Home />}
            iconPosition="start"
            {...a11yProps("home")}
          />
          
          { listeners.map(listener => (
            <Tab 
              key={`${listener.containerId}:${listener.port}`} 
              value={`${listener.containerId}:${listener.port}`} 
              label={`${listener.containerId.substring(0, 8)}:${listener.port}`}
              icon={<Circle color={listener.listeningPaused ? "warning" : "success"} />}
              iconPosition="start"
              {...a11yProps(`${listener.containerId.substring(0, 8)}-${listener.port}`)} 
            />
          ))}

          <Tab 
            icon={<Add />} 
            iconPosition="start" 
            label="Start New Capture" 
            value="start-capture"
            {...a11yProps("start-new")} 
            onClick={onStartCapture}
          />
        </Tabs>
      </Box>

      { containerId && port && (
        <PacketView containerId={containerId} port={port} />
      )}

      <StartCaptureModal
        show={showCaptureModal}
        onClose={onCaptureModalClose}
      />
    </>
  )
};