import { Packet, TcpPacketInfo } from "./CaptureContext";

export function packetParser(packet: string) : Packet {
  const ipVersion = packet.substring(0, 1);
  const ipHeaderLength = parseInt(packet.substring(2, 1), 16);
  const totalPacketLength = parseInt(packet.substring(4, 8), 16);
  const identification = packet.substring(8, 4);

  // const ipFlagsByte = packet.substring(12, 13);
  const ipTtl = parseInt(packet.substring(16, 18), 16);
  const protocolNumber = parseInt(packet.substring(18, 20), 16);
  const protocol = getProtocol(protocolNumber);
  const headerChecksum = packet.substring(20, 24);
  const sourceIp = convertHexToIp(packet.substring(24, 32));
  const destinationIp = convertHexToIp(packet.substring(32, 40));

  // IP Header length = number of 32-bit words, but have to convert to hex representation
  // const ipOptions = packet.substring(20, ipHeaderLength * 8);

  const ipPayload = packet.substring(ipHeaderLength * 8);

  let tcpInfo = undefined;
  if (protocol === "TCP") {
    tcpInfo = parseTcpPacket(ipPayload);
  }

  return { 
    rawBytes: packet,
    sourceIp, 
    destinationIp, 
    ipVersion, 
    ipHeaderLength, 
    length: totalPacketLength, 
    identification, 
    // ipFlagsByte, 
    ttl: ipTtl, 
    protocol, 
    protocolNumber, 
    checksum: headerChecksum,
    // ipOptions, 
    // ipPayload, 
    tcpInfo,
  };
}

function convertHexToIp(hex: string) {
  let ipSegments = [];
  for (let i = 0; i < 4; i++) {
    ipSegments.push( parseInt(hex.substring(i * 2, i * 2 + 2), 16));
  }
  return ipSegments.join(".");
}

function getProtocol(protocolNumber: number) {
  switch (protocolNumber) {
    case 1: return "ICMP";
    case 6: return "TCP";
    case 17: return "UDP";
    case 27: return "RDP"
    default: return null;
  }
}

function hex2a(hex : string) {
  let str = "";
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  return str;
}

function parseTcpPacket(ipPayload: string) : TcpPacketInfo {
  let tcpInfo = {} as TcpPacketInfo;
  tcpInfo.sourcePort = parseInt(ipPayload.substring(0, 4), 16);
  tcpInfo.destinationPort = parseInt(ipPayload.substring(4, 8), 16);
  tcpInfo.sequenceNumber = parseInt(ipPayload.substring(8, 16), 16);
  tcpInfo.ackNumber = parseInt(ipPayload.substring(16, 24), 16);

  const headerOctet = parseInt(ipPayload.substring(24, 26), 16);
  tcpInfo.headerLength = (headerOctet & 0xf0) >> 4;
  
  tcpInfo.flags = {
    FIN: false,
    SYN: false,
    RST: false,
    PSH: false,
    ACK: false,
    URG: false,
    ECE: false,
    CWR: false,
    NS: (headerOctet & 1) === 1,
  };

  const rawFlags = parseInt(ipPayload.substring(26, 28), 16);
  if (rawFlags & 1) tcpInfo.flags.FIN = true;
  if (rawFlags & 2) tcpInfo.flags.SYN = true;
  if (rawFlags & 4) tcpInfo.flags.RST = true;
  if (rawFlags & 8) tcpInfo.flags.PSH = true;
  if (rawFlags & 16) tcpInfo.flags.ACK = true;
  if (rawFlags & 32) tcpInfo.flags.URG = true;
  if (rawFlags & 64) tcpInfo.flags.ECE = true;
  if (rawFlags & 128) tcpInfo.flags.CWR = true;

  tcpInfo.windowSize = parseInt(ipPayload.substring(28, 32), 16);
  tcpInfo.checksum = ipPayload.substring(32, 36);
  tcpInfo.options = ipPayload.substring(40, tcpInfo.headerLength * 4 * 2);
  tcpInfo.payload = ipPayload.substring(tcpInfo.headerLength * 4 * 2);
  tcpInfo.payloadAsAscii = hex2a(tcpInfo.payload);
  return tcpInfo;
}