import List from "@mui/material/List";
import { FC } from "react";
import { useParams } from "react-router-dom";
import { useCaptureContext } from "../CaptureContext";
import { CaptureNavItem } from "./CaptureNavItem";

type RunningCaptureSideMenuProps = {

};

export const RunningCaptureSideMenu: FC<RunningCaptureSideMenuProps> = () => {
  const { listeners } = useCaptureContext();
  const { containerId, port } = useParams();

  return (
    <List component="nav">
      { listeners.map(listener => (
        <CaptureNavItem 
          key={`${listener.containerId}:${listener.port}`} 
          listener={listener} 
          selected={listener.containerId === containerId && listener.port === port}
        />
      ))}
    </List>
  )
  return null;
};