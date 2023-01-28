import Delete from "@mui/icons-material/Delete";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { FC, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCaptureContext } from "../CaptureContext";
import { PacketRow } from "./PacketRow";

type PacketViewProps = {
  containerId: string;
  port: string;
};

export const PacketView : FC<PacketViewProps> = ({ containerId, port }) => {
  const navigate = useNavigate();
  const { listeners, clearPacketsForListener, stopListening, pauseListening, resumeListening } = useCaptureContext();
  const listener = useMemo(
    () => listeners.find(l => l.containerId === containerId && l.port === port), 
    [containerId, port, listeners]
  );

  useEffect(() => {
    if (!listener) {
      navigate("/");
    }
  }, [navigate, listener]);

  if (!listener)
    return null;

  return (
    <>
      <Box marginBottom={2}>
        <Button variant="contained" onClick={() => clearPacketsForListener(listener.containerId, listener.port)}>Clear Packets</Button>
        &nbsp;
        { listener.listeningPaused ? (
          <Button variant="contained" color="inherit" onClick={() => resumeListening(listener.containerId, listener.port)}><PlayArrow />&nbsp;Resume Listening</Button>
        ) : (
          <Button variant="contained" color="inherit" onClick={() => pauseListening(listener.containerId, listener.port)}><Pause />&nbsp;Pause Listening</Button>
        )}
        &nbsp;
        <Button 
          variant="contained" 
          color="error"
          onClick={() => stopListening(listener.containerId, listener.port)}
        ><Delete />&nbsp;Remove Listener</Button>
      </Box>

      <Table size="small" sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Flags</TableCell>
            <TableCell>Seq #</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { listener?.packets.map((packet, index) => (
            <PacketRow packet={packet} port={listener.port} key={index} />
          ))}
        </TableBody>
      </Table>
      <em>Displaying { listener && listener.packets.length } packets</em>
    </>
  );
}