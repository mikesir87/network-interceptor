import { createContext, useContext, FC, ReactNode, useState, useEffect, useCallback, } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { packetParser } from "./packetParser";

export type HexBytes = string;

export type PacketFlag = "ACK" | "PSH" | "RST" | "SYN" | "FIN";

export type IcmpPacketInfo = {
  type: number;
  code: number;
}

export type TcpPacketInfo = {
  sourcePort: number;
  destinationPort: number;
  sequenceNumber: number;
  ackNumber: number;
  headerLength: number;
  flags: {
    FIN: boolean,
    SYN: boolean,
    RST: boolean,
    PSH: boolean,
    ACK: boolean,
    URG: boolean,
    ECE: boolean,
    CWR: boolean,
    NS:  boolean,
  }
  windowSize: number;
  checksum: string;
  options: HexBytes;
  payload: HexBytes;
  payloadAsAscii: string;
}

export type UdpPacketInfo = {
  sourcePort: number;
  destinationPort: number;
}

export type Packet = {
  rawBytes: HexBytes;
  sourceIp: string;
  destinationIp: string;
  ipVersion: string;
  ipHeaderLength: number;
  identification: string;
  ttl: number;
  length: number;
  protocol: "TCP" | "UDP" | "ICMP" | "RDP" | null;
  protocolNumber: number;
  checksum: string;
  tcpInfo?: TcpPacketInfo;
}

export type ContainerPortListener = {
  containerId : string;
  port: string;
  packets: Packet[];
  listeningPaused: boolean;
}

type CaptureContextType = {
  listeners : ContainerPortListener[];
  startListening: (containerId: string, port: string) => void;
  stopListening: (containerId: string, port: string) => void;
  pauseListening: (containerId: string, port: string) => void;
  resumeListening: (containerId: string, port: string) => void;
  clearPacketsForListener: (containerId: string, port: string) => void;
};

const DEFAULT_CONTEXT: CaptureContextType = {
  listeners: [],
  startListening: () => {},
  stopListening: () => {},
  pauseListening: () => {},
  resumeListening: () => {},
  clearPacketsForListener: () => {},
};

const CaptureContext = createContext<CaptureContextType>(DEFAULT_CONTEXT);

type Props = {
  children: ReactNode,
};

export const CaptureContextProvider: FC<Props> = ({ children }) => {
  const [listeners, setListeners] = useState<ContainerPortListener[]>([]);
  const [webSocket, setWebSocket] = useState<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const rws = new ReconnectingWebSocket(window.location.origin.replace("http", "ws") + "/api/tcpdump");
    setWebSocket(rws);

    rws.addEventListener("open", () => {
      setListeners([]);
    });

    rws.addEventListener("message", (event) => {
      const { message, containerId, port } = JSON.parse(event.data);
      const packet = packetParser(message);
      console.log("Received packet", packet);

      setListeners(listeners => {
        const listenerIndex = listeners.findIndex(l => l.containerId === containerId && l.port === port);
        if (listenerIndex === -1) return listeners;

        const listener = { ...listeners[listenerIndex] };
        if (listener.listeningPaused) return listeners;

        listener.packets = [...listener.packets, packet];
        return [...listeners.slice(0, listenerIndex), listener, ...listeners.slice(listenerIndex + 1)];
      });
    });
    
    return () => {
      setListeners([]);
      rws.close();
    }
  }, [setWebSocket, setListeners]);

  const startListening = useCallback((containerId: string, port: string) => {
    webSocket?.send(JSON.stringify({ type: "START_CAPTURE", containerId, port }));
    setListeners((listeners: ContainerPortListener[]) => [
      ...listeners,
      { containerId, port, packets: [] as Packet[], listeningPaused: false, },
    ]);
  }, [webSocket, setListeners]);

  const pauseListening = useCallback((containerId: string, port: string) => {
    setListeners(listeners => {
      const listenerIndex = listeners.findIndex(l => l.containerId === containerId && l.port === port);
      if (listenerIndex === -1) return listeners;

      const listener = listeners[listenerIndex];

      const newListener = { ...listener, listeningPaused: true } as ContainerPortListener;
      console.log("Setting listener to be paused");
      return [...listeners.slice(0, listenerIndex), newListener, ...listeners.slice(listenerIndex + 1)];
    });
  }, [setListeners]);

  const resumeListening = useCallback((containerId: string, port: string) => {
    setListeners(listeners => {
      const listenerIndex = listeners.findIndex(l => l.containerId === containerId && l.port === port);
      if (listenerIndex === -1) return listeners;

      const listener = listeners[listenerIndex];

      const newListener = { ...listener, listeningPaused: false } as ContainerPortListener;
      return [...listeners.slice(0, listenerIndex), newListener, ...listeners.slice(listenerIndex + 1)];
    });
  }, [setListeners]);

  const stopListening = useCallback((containerId: string, port: string) => {
    webSocket?.send(JSON.stringify({ type: "STOP_CAPTURE", containerId, port }));
    setListeners((listeners: ContainerPortListener[]) => 
      listeners.filter(l => l.containerId !== containerId || l.port !== port));
  }, [webSocket, setListeners]);

  const clearPacketsForListener = useCallback((containerId: string, port: string) => {
    setListeners(listeners => {
      const listenerIndex = listeners.findIndex(l => l.containerId === containerId && l.port === port);
      if (listenerIndex === -1) return listeners;
  
      const listener = listeners[listenerIndex];

      const newListener = { ...listener, packets: [] } as ContainerPortListener;
      return [...listeners.slice(0, listenerIndex), newListener, ...listeners.slice(listenerIndex + 1)];
    })
  }, [setListeners]);

  return (
    <CaptureContext.Provider value={{ listeners, startListening, stopListening, pauseListening, resumeListening, clearPacketsForListener }}>
      { children }
    </CaptureContext.Provider>
  )
};

export const useCaptureContext = () => useContext(CaptureContext);