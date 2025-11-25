import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from "lucide-react";

// Fallback to localhost if environment variable is not set or supported in this target
const SIGNALING_WS = "ws://localhost:3000";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:turn.mozilla.org:3478",
    username: "webrtc",
    credential: "webrtc",
  },
];

const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // "patient" or "doctor"

  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const offerCreatedRef = useRef(false); // Prevent double offer

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    if (!role || !["patient", "doctor"].includes(role)) {
      alert("Invalid role — redirecting");
      navigate("/");
      return;
    }

    let isMounted = true;
    let localStream: MediaStream | null = null;

    const safeSetStatus = (msg: string) => isMounted && setStatus(msg);
    const safeSetConnected = (v: boolean) => isMounted && setConnected(v);

    const flushCandidates = async () => {
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) return;

      for (const cand of pendingCandidatesRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn("Pending ICE failed", e);
        }
      }
      pendingCandidatesRef.current = [];
    };

    const start = async () => {
      try {
        safeSetStatus("Accessing camera & microphone...");
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (localRef.current) {
          localRef.current.srcObject = localStream;
          localRef.current.muted = true;
          await localRef.current.play().catch(() => {});
        }

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        localStream.getTracks().forEach((t) => pc.addTrack(t, localStream!));

        pc.ontrack = (event) => {
          if (!remoteRef.current) return;
          remoteRef.current.srcObject = event.streams[0];
          remoteRef.current.play().catch(() => {});
        };

        pc.onicecandidate = (ev) => {
          if (!ev.candidate || !wsRef.current) return;
          wsRef.current.send(
            JSON.stringify({ type: "candidate", candidate: ev.candidate })
          );
        };

        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          console.log("PC STATE:", state);
          safeSetStatus(`Peer connection: ${state}`);
          safeSetConnected(state === "connected");
        };

        // WebSocket connection
        if (!isMounted) return;
        const wsUrl = `${SIGNALING_WS}?room=${roomId}&role=${role}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          safeSetStatus("Connected to signaling server");
          ws.send(JSON.stringify({ type: "join", role }));
        };

        ws.onmessage = async (ev) => {
          const msg = JSON.parse(ev.data);
          if (!pcRef.current) return;
          const pc = pcRef.current;

          switch (msg.type) {
            case "doctor-joined":
              safeSetStatus("Doctor joined the room");
              if (role === "patient" && !offerCreatedRef.current) {
                offerCreatedRef.current = true;
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.send(JSON.stringify({ type: "offer", sdp: offer }));
              }
              break;

            case "offer":
              safeSetStatus("Received offer — answering...");
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              await flushCandidates();
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: "answer", sdp: answer }));
              break;

            case "answer":
              safeSetStatus("Received answer");
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              await flushCandidates();
              break;

            case "candidate":
              if (!pc.remoteDescription) {
                pendingCandidatesRef.current.push(msg.candidate);
              } else {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
              }
              break;

            case "wait":
              safeSetStatus("Waiting for patient to join...");
              break;

            case "left":
              safeSetStatus("Peer left. Call ended.");
              safeSetConnected(false);
              break;

            default:
              console.log("Unknown WS message:", msg);
          }
        };

        ws.onclose = () => safeSetStatus("Signaling disconnected");
        ws.onerror = () => safeSetStatus("Signaling error");
      } catch (err) {
        console.error(err);
        alert("Camera & microphone permission required.");
        navigate("/");
      }
    };

    start();

    return () => {
      isMounted = false;

      if (wsRef.current) {
        try {
          wsRef.current.send(JSON.stringify({ type: "leave" }));
          wsRef.current.close();
        } catch {}
      }

      if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => s.track?.stop());
        pcRef.current.close();
        pcRef.current = null;
      }

      if (localRef.current?.srcObject) {
        (localRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [roomId, role, navigate]);

  const toggleMute = () => {
    const stream = localRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMuted((m) => !m);
    }
  };

  const toggleCamera = () => {
    const stream = localRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraOff((c) => !c);
    }
  };

  const hangup = () => navigate(-1);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      {/* 1. Remote Video (Full Screen Background) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            connected ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Placeholder if not connected */}
        {!connected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="text-gray-400" size={40} />
              </div>
              <p className="text-lg font-medium">{status}</p>
              <p className="text-sm text-gray-400">Room: {roomId}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Local Video (Picture-in-Picture / PiP) */}
      <div className="absolute top-4 right-4 z-20 w-32 md:w-48 lg:w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 transition-all hover:scale-105">
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted // Always mute local to prevent echo
          className={`w-full h-full object-cover transform scale-x-[-1] ${
            cameraOff ? "hidden" : "block"
          }`}
        />
        {/* Camera Off Placeholder for Self */}
        {cameraOff && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <VideoOff size={24} className="text-gray-500" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium backdrop-blur-sm">
          You ({role})
        </div>
      </div>

      {/* 3. Controls (Floating Bottom Bar) */}
      <div className="absolute bottom-8 z-30 flex items-center gap-4 md:gap-6 px-6 py-4 bg-gray-900/80 backdrop-blur-md rounded-full shadow-2xl border border-white/10 transition-all hover:bg-gray-900/90">
        {/* Toggle Mute */}
        <button
          onClick={toggleMute}
          className={`p-3 md:p-4 rounded-full transition-all duration-200 shadow-lg ${
            muted
              ? "bg-red-500/90 hover:bg-red-600 text-white"
              : "bg-gray-700/80 hover:bg-gray-600 text-white"
          }`}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleCamera}
          className={`p-3 md:p-4 rounded-full transition-all duration-200 shadow-lg ${
            cameraOff
              ? "bg-red-500/90 hover:bg-red-600 text-white"
              : "bg-gray-700/80 hover:bg-gray-600 text-white"
          }`}
          title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {cameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        {/* Hang Up */}
        <button
          onClick={hangup}
          className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg hover:scale-105"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Status Overlay (Top Left - Optional info) */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            }`}
          />
          <span className="text-xs md:text-sm font-medium text-white/90">
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;