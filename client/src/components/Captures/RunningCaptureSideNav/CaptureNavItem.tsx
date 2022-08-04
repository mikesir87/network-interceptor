import { FC, useCallback } from "react";
import Circle from "@mui/icons-material/Circle";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ContainerPortListener } from "../CaptureContext"
import { useNavigate } from "react-router-dom";
import { Badge } from "@mui/material";

type CaptureNavItemProps = {
  listener : ContainerPortListener;
  selected : boolean;
};

export const CaptureNavItem : FC<CaptureNavItemProps> = ({ listener, selected }) => {
  const navigate = useNavigate();
  const navigateToListener = useCallback(() => {
    navigate(`/containers/${listener.containerId}/ports/${listener.port}`);
  }, [listener.containerId, listener.port, navigate]);

  return (
    <ListItemButton onClick={navigateToListener} selected={selected}>
      <ListItemIcon>
        <Badge color="secondary" badgeContent={listener.packets.length} max={999}>
          <Circle color="success" />
        </Badge>
      </ListItemIcon>
      <ListItemText primary={`${listener.containerId.substring(0, 8)} : ${listener.port}`} />
    </ListItemButton>
  );
}