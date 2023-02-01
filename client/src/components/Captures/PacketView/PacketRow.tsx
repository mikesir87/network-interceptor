import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Packet } from "../CaptureContext"

type PacketRowProps = {
  packet: Packet;
  port: string;
}

export const PacketRow : FC<PacketRowProps> = ({ port, packet }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow 
        sx={{ 
          bgcolor: open ? "grey.400" : (packet.tcpInfo && packet.tcpInfo.destinationPort == parseInt(port) ? "grey.50" : "grey.200"),
          '& > *': { borderBottom: 'unset' },
          "&:hover": { bgcolor: open ? "grey.400" : "grey.300", cursor: "pointer", },
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          { packet.tcpInfo && packet.tcpInfo.sourcePort == parseInt(port) ?
            <ArrowBack /> : <ArrowForward /> 
          }
        </TableCell>
        <TableCell>{ packet.sourceIp }{ packet.tcpInfo && `:${packet.tcpInfo.sourcePort}` }</TableCell>
        <TableCell>{ packet.destinationIp }{ packet.tcpInfo && `:${packet.tcpInfo.destinationPort}` }</TableCell>
        <TableCell>
          { packet.tcpInfo && (
            <>
              { Object.entries(packet.tcpInfo.flags)
                .filter(([_, isSet]) => isSet) 
                .map(([flag]) => flag)
                .join(", ")
              }
            </>
          )}
        </TableCell>
        <TableCell>
          { packet.tcpInfo && packet.tcpInfo.sequenceNumber }
        </TableCell>
        <TableCell>{ packet.tcpInfo && packet.tcpInfo.payload.length / 2 }</TableCell>
      </TableRow>


      <TableRow
        sx={{bgcolor: "grey.400"}}
      >
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, maxWidth:"100px" }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Payload
              </Typography>
              <Typography gutterBottom component="div" sx={{ overflowX: "scroll" }}>
                <pre>{ packet.tcpInfo?.payloadAsAscii }</pre>
              </Typography>

              { packet.tcpInfo && packet.tcpInfo.flags.ACK && (
                <>
                  <Typography variant="h6" gutterBottom component="div">
                    Ack Number
                  </Typography>
                  <Typography gutterBottom component="div" sx={{ overflowX: "scroll" }}>
                    <pre>{ packet.tcpInfo?.ackNumber }</pre>
                  </Typography>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};