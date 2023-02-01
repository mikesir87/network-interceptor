import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { FC, useCallback, useEffect, useState } from "react";
import { useCaptureContext } from "../CaptureContext";

type Container = {
  Id: string;
  Names: string[];
  Image: string;
  Status: string;
}

type Port = {
  port: number;
  process: string;
}

type StartCaptureModalProps = {
  show: boolean;
  onClose: (containerId?: string, port?: string) => void;
}

const modalStyle = {
  position: 'absolute',
  top: '75px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export const StartCaptureModal : FC<StartCaptureModalProps> = ({ show, onClose }) => {
  const { startListening } = useCaptureContext();

  const [containers, setContainers] = useState<Container[] | null>(null);
  const [containerId, setContainerId] = useState<string>("");
  const [refreshContainerCount, setRefreshContainerCount] = useState(0);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [ports, setPorts] = useState<Port[] | null>(null);
  const [port, setPort] = useState<string>("");

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!show) return;

    fetch("/api/containers")
      .then(r => r.json())
      .then(setContainers);
  }, [show, setContainers, refreshContainerCount]);

  useEffect(() => {
    if (containerId === "") {
      setPorts(null);
      return;
    }

    setPort("");
    setLoadingPorts(true);
    fetch(`/api/containers/${containerId}/ports`)
      .then(r => r.json())
      .then(d => setPorts(d.ports))
      .finally(() => setLoadingPorts(false));
  }, [containerId, setPort]);

  useEffect(() => {
    if (!show) {
      setContainers(null);
      setContainerId("");
      setPort("");
    }
  }, [show]);

  const onStartListening = useCallback(() => {
    startListening(containerId, port);
    onClose(containerId, port);
  }, [startListening, containerId, port, onClose]);

  return (
    <Modal
      open={show}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Start a New Capture
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2, }}>
          Let's choose a container and process to listen to!
          &nbsp;&nbsp;
          <Button variant="text" onClick={() => setRefreshContainerCount(c => c + 1)}>Refresh</Button>
        </Typography>

        { containers && (
          <FormControl fullWidth>
            <InputLabel id="container-select-label">Container</InputLabel>
            <Select
              labelId="container-select-label"
              id="container-select"
              value={containerId}
              label="Container"
              onChange={(e) => setContainerId(e.target.value)}
              sx={{ mb: 3 }}
            >
              { containers.map(container => (
                <MenuItem value={container.Id} key={container.Id}>
                  { container.Names[0].substring(1) }&nbsp;<em>({ container.Image })</em>&nbsp;-&nbsp;{ container.Status }
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        { (ports || loadingPorts) && (
          <FormControl fullWidth>
            <InputLabel id="port-select-label">{ ports ? "Port" : "Loading port information..." }</InputLabel>
            <Select
              labelId="port-select-label"
              id="port-select"
              value={port}
              label="Port"
              onChange={(e) => setPort(e.target.value)}
              sx={{mb: 3}}
              disabled={!ports}
            >
              { ports && ports.map(port => (
                <MenuItem value={port.port} key={port.port}>
                  { port.port } - { port.process ? port.process : <em>Unknown</em> }
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button
          variant="contained"
          disabled={!containerId || !port}
          onClick={onStartListening}
        >Start Listening</Button>
      </Box>
    </Modal>
  );
}