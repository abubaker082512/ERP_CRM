"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    Monitor,
    MessageSquare,
    Users,
    PhoneOff,
    Settings,
    Copy,
    Mail,
    Send,
    Sparkles,
    Shield,
    CheckCircle2,
    X,
    Maximize2,
    Minimize2,
    Hand,
    RefreshCw,
    Download,
    Radio,
    Sliders,
    Zap,
    ExternalLink,
    UserPlus
} from "lucide-react";

type ChatMessage = {
    id: string;
    sender: string;
    time: string;
    text: string;
    isHost?: boolean;
    isAi?: boolean;
};

type RemotePeer = {
    peer_id: string;
    name: string;
    role: string;
    is_host: boolean;
    is_muted: boolean;
    is_video_off: boolean;
    is_hand_raised?: boolean;
};

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        ...(process.env.NEXT_PUBLIC_TURN_URL
            ? [
                  {
                      urls: process.env.NEXT_PUBLIC_TURN_URL,
                      username: process.env.NEXT_PUBLIC_TURN_USER || "",
                      credential: process.env.NEXT_PUBLIC_TURN_PASS || "",
                  },
              ]
            : []),
    ],
};

function getInitialUserName(): string {
    if (typeof window === "undefined") return "Workspace User";
    try {
        const rawUser = localStorage.getItem("user") || localStorage.getItem("auth_data");
        if (rawUser) {
            const parsed = JSON.parse(rawUser);
            const u = parsed.user || parsed;
            if (u.full_name) return u.full_name;
            if (u.name) return u.name;
            if (u.email) return u.email.split("@")[0];
        }
    } catch {}
    return `Participant ${Math.floor(100 + Math.random() * 900)}`;
}

function RemoteVideoTile({
    peer,
    stream,
}: {
    peer: RemotePeer;
    stream: MediaStream | undefined;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const hasLiveVideo = Boolean(
        stream &&
        stream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled) &&
        !peer.is_video_off
    );

    const initials = peer.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "P";

    return (
        <div className="bg-[#141C2E] border border-gray-800 hover:border-purple-500/40 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group w-full h-full min-h-[220px]">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover absolute inset-0 ${hasLiveVideo ? "block" : "hidden"}`}
            />

            {!hasLiveVideo && (
                <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#3B0764]/40 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,transparent_70%)]" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 border-purple-400/40">
                                {initials}
                            </div>
                            <span
                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#141C2E] flex items-center justify-center ${
                                    peer.is_muted ? "bg-rose-500" : "bg-emerald-500"
                                }`}
                            >
                                {peer.is_muted ? <MicOff size={11} className="text-white" /> : <Mic size={11} className="text-white" />}
                            </span>
                        </div>
                        <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                            {stream ? "Camera Off (Audio Connected)" : "Connecting WebRTC Stream..."}
                        </span>
                    </div>
                </div>
            )}

            {peer.is_hand_raised && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg animate-bounce z-10">
                    <Hand size={13} />
                    <span>Hand Raised</span>
                </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs flex items-center gap-2 text-white font-medium z-10">
                <span>{peer.name}</span>
                {peer.is_muted ? <MicOff size={13} className="text-rose-400" /> : <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
        </div>
    );
}

export default function InSystemVideoMeetPage() {
    const params = useParams();
    const router = useRouter();
    const meetId = typeof params?.id === "string" ? params.id : "room-live-demo";

    // Unique Peer ID for this session
    const selfPeerIdRef = useRef<string>(`peer_${Math.random().toString(36).slice(2, 10)}`);
    const [displayName, setDisplayName] = useState<string>("Workspace Host");

    // Media & WebRTC Refs
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
    const lastSeqRef = useRef<number>(0);

    // Call & Media States
    const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    // Devices & Settings
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioId, setSelectedAudioId] = useState<string>("");
    const [selectedVideoId, setSelectedVideoId] = useState<string>("");

    // Side Drawers & Modals
    const [activeDrawer, setActiveDrawer] = useState<"chat" | "participants" | "invite" | "settings" | null>(null);
    const [showInstantModal, setShowInstantModal] = useState(false);
    const [instantGeneratedLink, setInstantGeneratedLink] = useState("");
    const [isCallEnded, setIsCallEnded] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [signalingStatus, setSignalingStatus] = useState<"connecting" | "connected" | "local-only">("connecting");

    // Call Timer
    const [callSeconds, setCallSeconds] = useState(0);
    useEffect(() => {
        if (isCallEnded) return;
        const interval = setInterval(() => setCallSeconds((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isCallEnded]);

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "m1",
            sender: "Beraxis Meet",
            time: "Just now",
            text: `🔒 Room ${meetId} ready (WebRTC DTLS-SRTP). Share the link for anyone to join live audio, video & screen share.`,
            isAi: true,
        },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");

    const showToast = useCallback((msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 4500);
    }, []);

    useEffect(() => {
        setDisplayName(getInitialUserName());
    }, []);

    const sendSignal = useCallback(
        async (type: string, payload: Record<string, unknown>, targetId?: string) => {
            try {
                await fetch(`/api/v1/meet/rooms/${encodeURIComponent(meetId)}/signal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sender_id: selfPeerIdRef.current,
                        target_id: targetId || null,
                        type,
                        payload,
                    }),
                });
            } catch {}
        },
        [meetId]
    );

    const createPeerConnection = useCallback(
        (remotePeerId: string): RTCPeerConnection => {
            const existing = peerConnectionsRef.current.get(remotePeerId);
            if (existing) return existing;

            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Attach local audio/video tracks
            const activeStream = mediaStreamRef.current;
            if (activeStream) {
                activeStream.getTracks().forEach((track) => {
                    pc.addTrack(track, activeStream);
                });
            }

            // If currently screen sharing, swap video track
            if (screenStreamRef.current) {
                const screenTrack = screenStreamRef.current.getVideoTracks()[0];
                if (screenTrack) {
                    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                    if (sender) sender.replaceTrack(screenTrack).catch(() => {});
                }
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal("ice", { candidate: event.candidate.toJSON() }, remotePeerId);
                }
            };

            pc.ontrack = (event) => {
                const [stream] = event.streams;
                if (stream) {
                    setRemoteStreams((prev) => ({ ...prev, [remotePeerId]: stream }));
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "failed" || pc.connectionState === "closed") {
                    pc.close();
                    peerConnectionsRef.current.delete(remotePeerId);
                }
            };

            peerConnectionsRef.current.set(remotePeerId, pc);
            return pc;
        },
        [sendSignal]
    );

    // 1. Initialize Real Camera & Mic Stream
    const startLocalStream = useCallback(
        async (audioId?: string, videoId?: string) => {
            try {
                setMediaError(null);
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                }

                const constraints: MediaStreamConstraints = {
                    audio: audioId ? { deviceId: { exact: audioId } } : true,
                    video: videoId
                        ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                        : { width: { ideal: 1280 }, height: { ideal: 720 } },
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                mediaStreamRef.current = stream;
                setHasMediaPermission(true);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                stream.getAudioTracks().forEach((t) => {
                    t.enabled = !isMuted;
                });
                stream.getVideoTracks().forEach((t) => {
                    t.enabled = !isVideoOff;
                });

                // Update any existing RTCPeerConnections with new tracks
                peerConnectionsRef.current.forEach((pc) => {
                    const senders = pc.getSenders();
                    stream.getTracks().forEach((track) => {
                        const existingSender = senders.find((s) => s.track?.kind === track.kind);
                        if (existingSender) {
                            existingSender.replaceTrack(track).catch(() => {});
                        } else {
                            pc.addTrack(track, stream);
                        }
                    });
                });

                try {
                    const AudioCtx =
                        window.AudioContext ||
                        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                    const audioCtx = new AudioCtx();
                    audioContextRef.current = audioCtx;
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    analyserRef.current = analyser;

                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const checkAudioLevel = () => {
                        if (analyserRef.current && !isMuted) {
                            analyserRef.current.getByteFrequencyData(dataArray);
                            let sum = 0;
                            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                            setAudioLevel(Math.min(100, Math.round((sum / dataArray.length / 128) * 100)));
                        } else {
                            setAudioLevel(0);
                        }
                        animFrameRef.current = requestAnimationFrame(checkAudioLevel);
                    };
                    checkAudioLevel();
                } catch {}

                const devices = await navigator.mediaDevices.enumerateDevices();
                setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
                setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
            } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : "Media permission denied";
                setMediaError(errorMsg);
                setHasMediaPermission(false);
                showToast("⚠️ Camera/Microphone unavailable — joining in listen/chat mode.");
            }
        },
        [isMuted, isVideoOff, showToast]
    );

    // 2. Join WebRTC Signaling Room & Poll Events
    useEffect(() => {
        if (typeof window !== "undefined" && Boolean(navigator?.mediaDevices?.getUserMedia)) {
            startLocalStream();
        }

        let cancelled = false;
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        const selfId = selfPeerIdRef.current;

        const initiateOffer = async (remoteId: string) => {
            try {
                const pc = createPeerConnection(remoteId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await sendSignal("offer", { sdp: pc.localDescription }, remoteId);
            } catch {}
        };

        const handleSignalEvent = async (ev: {
            seq: number;
            sender_id: string;
            type: string;
            payload: Record<string, any>;
        }) => {
            const from = ev.sender_id;
            if (ev.type === "peer_joined") {
                showToast(`👋 ${ev.payload.name || "Participant"} joined the room`);
                if (selfId < from) {
                    await initiateOffer(from);
                }
            } else if (ev.type === "peer_left") {
                const pc = peerConnectionsRef.current.get(from);
                if (pc) {
                    pc.close();
                    peerConnectionsRef.current.delete(from);
                }
                setRemoteStreams((prev) => {
                    const copy = { ...prev };
                    delete copy[from];
                    return copy;
                });
            } else if (ev.type === "offer") {
                const pc = createPeerConnection(from);
                await pc.setRemoteDescription(new RTCSessionDescription(ev.payload.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await sendSignal("answer", { sdp: pc.localDescription }, from);
            } else if (ev.type === "answer") {
                const pc = peerConnectionsRef.current.get(from);
                if (pc && pc.signalingState !== "stable") {
                    await pc.setRemoteDescription(new RTCSessionDescription(ev.payload.sdp));
                }
            } else if (ev.type === "ice" && ev.payload.candidate) {
                const pc = peerConnectionsRef.current.get(from);
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(ev.payload.candidate)).catch(() => {});
                }
            } else if (ev.type === "chat" && ev.payload.message) {
                setMessages((prev) =>
                    prev.some((m) => m.id === ev.payload.message.id)
                        ? prev
                        : [...prev, ev.payload.message]
                );
            }
        };

        const connectRoom = async () => {
            try {
                const res = await fetch(`/api/v1/meet/rooms/${encodeURIComponent(meetId)}/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        peer_id: selfId,
                        name: getInitialUserName(),
                        role: "Participant",
                        is_muted: false,
                        is_video_off: false,
                    }),
                });
                if (!res.ok) throw new Error("Signaling unreachable");
                const data = await res.json();
                if (cancelled) return;
                setSignalingStatus("connected");
                lastSeqRef.current = data.seq || 0;
                const peers: RemotePeer[] = data.peers || [];
                setRemotePeers(peers);

                for (const p of peers) {
                    if (selfId < p.peer_id) {
                        await initiateOffer(p.peer_id);
                    }
                }

                pollTimer = setInterval(async () => {
                    if (cancelled) return;
                    try {
                        const pollRes = await fetch(
                            `/api/v1/meet/rooms/${encodeURIComponent(meetId)}/poll?peer_id=${encodeURIComponent(selfId)}&since=${lastSeqRef.current}`
                        );
                        if (!pollRes.ok) return;
                        const pollData = await pollRes.json();
                        if (typeof pollData.seq === "number") {
                            lastSeqRef.current = pollData.seq;
                        }
                        if (Array.isArray(pollData.peers)) {
                            setRemotePeers(pollData.peers);
                        }
                        if (Array.isArray(pollData.events)) {
                            for (const ev of pollData.events) {
                                await handleSignalEvent(ev);
                            }
                        }
                    } catch {}
                }, 900);
            } catch {
                setSignalingStatus("local-only");
            }
        };

        connectRoom();

        return () => {
            cancelled = true;
            if (pollTimer) clearInterval(pollTimer);
            fetch(`/api/v1/meet/rooms/${encodeURIComponent(meetId)}/leave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peer_id: selfId }),
            }).catch(() => {});
            peerConnectionsRef.current.forEach((pc) => pc.close());
            peerConnectionsRef.current.clear();
            if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, [meetId, createPeerConnection, sendSignal, showToast, startLocalStream]);

    // Toggle Microphone
    const toggleMic = () => {
        const nextState = !isMuted;
        setIsMuted(nextState);
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !nextState;
            });
        }
        sendSignal("state", { is_muted: nextState });
        showToast(nextState ? "Microphone muted" : "Microphone unmuted");
    };

    // Toggle Camera
    const toggleVideo = () => {
        const nextState = !isVideoOff;
        setIsVideoOff(nextState);
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !nextState;
            });
        }
        sendSignal("state", { is_video_off: nextState });
        showToast(nextState ? "Camera turned off" : "Camera turned on");
    };

    // Real Screen Share (getDisplayMedia + WebRTC replaceTrack)
    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                if (!navigator.mediaDevices?.getDisplayMedia) {
                    showToast("❌ Screen sharing is not supported by this browser.");
                    return;
                }
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStreamRef.current = screenStream;
                if (screenVideoRef.current) {
                    screenVideoRef.current.srcObject = screenStream;
                }
                const screenTrack = screenStream.getVideoTracks()[0];
                peerConnectionsRef.current.forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                    if (sender && screenTrack) sender.replaceTrack(screenTrack).catch(() => {});
                });
                setIsScreenSharing(true);
                showToast("🖥️ Screen sharing is now live to all participants!");

                screenTrack.onended = () => {
                    setIsScreenSharing(false);
                    screenStreamRef.current = null;
                    const camTrack = mediaStreamRef.current?.getVideoTracks()[0];
                    if (camTrack) {
                        peerConnectionsRef.current.forEach((pc) => {
                            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                            if (sender) sender.replaceTrack(camTrack).catch(() => {});
                        });
                    }
                    showToast("Screen sharing stopped");
                };
            } catch {
                setIsScreenSharing(false);
            }
        } else {
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((t) => t.stop());
                screenStreamRef.current = null;
            }
            const camTrack = mediaStreamRef.current?.getVideoTracks()[0];
            if (camTrack) {
                peerConnectionsRef.current.forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                    if (sender) sender.replaceTrack(camTrack).catch(() => {});
                });
            }
            setIsScreenSharing(false);
            showToast("Screen sharing stopped");
        }
    };

    // In-System Meeting Recorder
    const toggleRecording = () => {
        if (!isRecording) {
            try {
                const streamToRecord = screenStreamRef.current || mediaStreamRef.current;
                if (!streamToRecord) {
                    showToast("⚠️ No active stream available to record.");
                    return;
                }
                recordedChunksRef.current = [];
                const recorder = new MediaRecorder(streamToRecord, {
                    mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
                        ? "video/webm;codecs=vp9"
                        : "video/webm",
                });
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data);
                };
                recorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                    setRecordedBlobUrl(URL.createObjectURL(blob));
                    showToast("✅ Recording saved! Ready to download.");
                };
                recorder.start(1000);
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
                showToast("🔴 Meeting recording started");
            } catch {
                showToast("⚠️ Recording unsupported on this device.");
            }
        } else {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        }
    };

    // Send Live Chat Message over WebRTC Signaling
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const newMsg: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sender: displayName,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: chatInput.trim(),
            isHost: true,
        };
        setMessages((prev) => [...prev, newMsg]);
        sendSignal("chat", { message: { ...newMsg, isHost: false } });
        setChatInput("");
    };

    const handleGenerateInstantMeeting = () => {
        const uniqueRoomCode = `meet-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}`;
        const fullUrl =
            typeof window !== "undefined"
                ? `${window.location.origin}/meet/${uniqueRoomCode}`
                : `https://www.beraxis.online/meet/${uniqueRoomCode}`;
        setInstantGeneratedLink(fullUrl);
        setShowInstantModal(true);
    };

    const copyMeetingUrl = (urlToCopy?: string) => {
        const url =
            urlToCopy ||
            (typeof window !== "undefined"
                ? window.location.href
                : `https://www.beraxis.online/meet/${meetId}`);
        navigator.clipboard.writeText(url);
        showToast("📋 Meeting room URL copied to clipboard!");
    };

    const handleSendEmailInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        try {
            await fetch("/api/v1/meet/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: meetId,
                    recipient_email: inviteEmail,
                    recipient_name: inviteName,
                    host_name: displayName,
                }),
            });
        } catch {}
        showToast(`✉️ Video meeting invite dispatched to ${inviteEmail}!`);
        setInviteEmail("");
        setInviteName("");
        setActiveDrawer(null);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    const totalParticipantsCount = 1 + remotePeers.length;
    const selfInitials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "ME";

    return (
        <div className="fixed inset-0 h-[100dvh] w-full max-h-screen max-w-full bg-[#070B14] text-white flex flex-col overflow-hidden select-none font-sans z-[100]">
            {/* Top Conference Header */}
            <header className="h-14 bg-[#0F172A]/95 border-b border-gray-800 px-3 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <Link href="/meet" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-purple-900/30">
                            B
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">Beraxis Meet</span>
                    </Link>

                    <span className="text-gray-700 hidden sm:inline">•</span>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-300 font-mono bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    signalingStatus === "connected" ? "bg-emerald-400" : "bg-amber-400"
                                }`}
                            />
                            {meetId}
                        </span>
                        {isRecording && (
                            <button
                                onClick={toggleRecording}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full animate-pulse cursor-pointer"
                            >
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                REC
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1.5 rounded-xl border border-gray-700 font-mono font-bold text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>{formatTimer(callSeconds)}</span>
                    </div>

                    <button
                        onClick={handleGenerateInstantMeeting}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all cursor-pointer text-xs"
                    >
                        <Zap size={13} className="text-amber-300 fill-amber-300" />
                        <span className="hidden md:inline">Instant Link</span>
                    </button>

                    <button
                        onClick={() => copyMeetingUrl()}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer hidden sm:flex"
                    >
                        <Copy size={13} />
                        <span>Copy Link</span>
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </header>

            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-[#1E293B]/95 border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
                    <Sparkles size={16} className="text-purple-400 shrink-0" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Main Stage & Drawers */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative w-full">
                <div className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col justify-center items-center overflow-hidden w-full h-full">
                    {isCallEnded ? (
                        <div className="max-w-md w-full bg-[#1E293B] border border-gray-700 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                            <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Call Ended</h2>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Total duration: <span className="text-white font-mono font-bold">{formatTimer(callSeconds)}</span>.
                            </p>
                            {recordedBlobUrl && (
                                <a
                                    href={recordedBlobUrl}
                                    download={`beraxis-meeting-${meetId}.webm`}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
                                >
                                    <Download size={14} />
                                    Download Meeting Recording (.webm)
                                </a>
                            )}
                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => router.push("/meet")}
                                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Back to Meet Hub
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCallEnded(false);
                                        startLocalStream();
                                    }}
                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Rejoin Call
                                </button>
                            </div>
                        </div>
                    ) : isScreenSharing ? (
                        <div className="w-full h-full max-w-6xl flex flex-col gap-2 min-h-0">
                            <div className="flex-1 min-h-0 bg-black rounded-2xl md:rounded-3xl border border-purple-500/40 relative overflow-hidden flex items-center justify-center shadow-2xl">
                                <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-2">
                                    <Monitor size={14} className="text-purple-400" />
                                    <span>You are presenting your screen</span>
                                </div>
                            </div>

                            <div className="h-24 flex items-center gap-3 overflow-x-auto shrink-0 pb-1">
                                <div className="w-36 h-full bg-[#141C2E] border border-gray-800 rounded-xl relative overflow-hidden shrink-0 shadow-lg">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover -scale-x-100 ${isVideoOff ? "hidden" : "block"}`}
                                    />
                                    {isVideoOff && (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-900">
                                            Camera Off
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white">
                                        {displayName} (You)
                                    </div>
                                </div>
                                {remotePeers.map((peer) => (
                                    <div key={peer.peer_id} className="w-36 h-full bg-[#141C2E] border border-gray-800 rounded-xl relative overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
                                        <span className="text-xs font-bold text-purple-300">{peer.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`w-full h-full max-w-6xl grid grid-cols-1 ${remotePeers.length >= 2 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3 sm:gap-4 items-stretch justify-center min-h-0 max-h-full`}>
                            {/* LOCAL HOST VIDEO TILE */}
                            <div className="bg-[#141C2E] border border-gray-800 hover:border-gray-700 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group w-full h-full min-h-[220px]">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover object-center absolute inset-0 -scale-x-100 ${
                                        isVideoOff || !hasMediaPermission ? "hidden" : "block"
                                    }`}
                                />

                                {(isVideoOff || !hasMediaPermission) && (
                                    <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] flex flex-col items-center justify-center overflow-hidden">
                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 border-indigo-400/40">
                                                    {selfInitials}
                                                </div>
                                                <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#141C2E] flex items-center justify-center ${isMuted ? "bg-rose-500" : "bg-emerald-500"}`}>
                                                    {isMuted ? <MicOff size={11} className="text-white" /> : <Mic size={11} className="text-white" />}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                {isVideoOff ? "Your Camera is Off" : "Initializing Webcam..."}
                                            </span>
                                            {mediaError && !isVideoOff && (
                                                <button
                                                    onClick={() => startLocalStream()}
                                                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1 cursor-pointer"
                                                >
                                                    <RefreshCw size={11} /> Allow Camera / Retry
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!isMuted && (
                                    <div className="absolute bottom-3 left-3 z-10 flex items-end gap-1 h-5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.2)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.35)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.25)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.15)}px` }} />
                                    </div>
                                )}

                                {isHandRaised && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg animate-bounce z-10">
                                        <Hand size={13} />
                                        <span>Hand Raised</span>
                                    </div>
                                )}

                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs flex items-center gap-2 text-white font-medium z-10">
                                    <span>{displayName} (You)</span>
                                    {isMuted ? <MicOff size={13} className="text-rose-400" /> : <Mic size={13} className="text-emerald-400" />}
                                </div>
                            </div>

                            {/* REAL REMOTE WEBRTC PEERS OR INVITE WAITING CARD */}
                            {remotePeers.length > 0 ? (
                                remotePeers.map((peer) => (
                                    <RemoteVideoTile
                                        key={peer.peer_id}
                                        peer={peer}
                                        stream={remoteStreams[peer.peer_id]}
                                    />
                                ))
                            ) : (
                                <div className="bg-[#141C2E] border border-dashed border-purple-500/30 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl w-full h-full min-h-[220px]">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                                        <UserPlus size={28} />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">
                                        Waiting for Participants to Join
                                    </h3>
                                    <p className="text-xs text-gray-400 max-w-xs mb-5 leading-relaxed">
                                        Share this room URL with your team or clients. As soon as they open it on any browser, live WebRTC HD video &amp; audio connects automatically.
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            onClick={() => copyMeetingUrl()}
                                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
                                        >
                                            <Copy size={13} /> Copy Room Link
                                        </button>
                                        <button
                                            onClick={() => setActiveDrawer("invite")}
                                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Mail size={13} /> Send Invite
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side Drawer */}
                {activeDrawer && (
                    <aside className="w-80 md:w-96 bg-[#0F172A] border-l border-gray-800 flex flex-col shadow-2xl z-30 h-full min-h-0">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-white text-sm capitalize flex items-center gap-2">
                                {activeDrawer === "chat" && <><MessageSquare size={16} className="text-purple-400" /> In-Meeting Chat</>}
                                {activeDrawer === "participants" && <><Users size={16} className="text-purple-400" /> Participants ({totalParticipantsCount})</>}
                                {activeDrawer === "invite" && <><Mail size={16} className="text-purple-400" /> Invite via Email</>}
                                {activeDrawer === "settings" && <><Sliders size={16} className="text-purple-400" /> Audio &amp; Video Settings</>}
                            </h3>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 min-h-0">
                            {activeDrawer === "chat" && (
                                <div className="h-full flex flex-col justify-between">
                                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                        {messages.map((m) => (
                                            <div key={m.id} className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                    <span className={`font-bold ${m.isHost ? "text-purple-400" : m.isAi ? "text-amber-400" : "text-cyan-400"}`}>
                                                        {m.sender}
                                                    </span>
                                                    <span>{m.time}</span>
                                                </div>
                                                <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                                                    m.isAi ? "bg-amber-500/10 border-amber-500/20 text-amber-200" : "bg-[#1E293B] border-white/5 text-gray-200"
                                                }`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-800 flex gap-2 shrink-0">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Send message to room..."
                                            className="flex-1 bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl text-xs font-bold cursor-pointer">
                                            <Send size={14} />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeDrawer === "participants" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1E293B] border border-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                                                {selfInitials}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-xs">{displayName} (You)</div>
                                                <div className="text-[10px] text-gray-400">Local Host</div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                                            You
                                        </span>
                                    </div>
                                    {remotePeers.map((p) => (
                                        <div key={p.peer_id} className="flex items-center justify-between p-3 rounded-2xl bg-[#1E293B] border border-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-xs">{p.name}</div>
                                                    <div className="text-[10px] text-gray-400">{p.role}</div>
                                                </div>
                                            </div>
                                            {p.is_muted ? <MicOff size={13} className="text-rose-400" /> : <Mic size={13} className="text-emerald-400" />}
                                        </div>
                                    ))}
                                    <div className="pt-4 space-y-2">
                                        <button
                                            onClick={() => setActiveDrawer("invite")}
                                            className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Mail size={14} /> <span>+ Invite via Email</span>
                                        </button>
                                        <button
                                            onClick={() => copyMeetingUrl()}
                                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Copy size={14} /> <span>Copy Meeting Link</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeDrawer === "invite" && (
                                <form onSubmit={handleSendEmailInvite} className="space-y-4 text-xs">
                                    <p className="text-gray-400 text-[11px] leading-relaxed">
                                        Enter a recipient email address to dispatch an instant video room invite link from Beraxis.
                                    </p>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Participant Name</label>
                                        <input
                                            type="text"
                                            value={inviteName}
                                            onChange={(e) => setInviteName(e.target.value)}
                                            placeholder="e.g. Alex Morgan"
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="e.g. alex@company.com"
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                                    >
                                        Dispatch Video Room Invite
                                    </button>
                                </form>
                            )}

                            {activeDrawer === "settings" && (
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Display Name in Room</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => {
                                                setDisplayName(e.target.value);
                                                sendSignal("state", { name: e.target.value });
                                            }}
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Camera Input Device</label>
                                        <select
                                            value={selectedVideoId}
                                            onChange={(e) => {
                                                setSelectedVideoId(e.target.value);
                                                startLocalStream(selectedAudioId, e.target.value);
                                            }}
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">Default Camera</option>
                                            {videoDevices.map((d) => (
                                                <option key={d.deviceId} value={d.deviceId}>
                                                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Microphone Input Device</label>
                                        <select
                                            value={selectedAudioId}
                                            onChange={(e) => {
                                                setSelectedAudioId(e.target.value);
                                                startLocalStream(e.target.value, selectedVideoId);
                                            }}
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">Default Microphone</option>
                                            {audioDevices.map((d) => (
                                                <option key={d.deviceId} value={d.deviceId}>
                                                    {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Bottom Control Bar */}
            <footer className="h-16 md:h-18 bg-[#0F172A] border-t border-gray-800 px-4 md:px-8 flex items-center justify-between shrink-0 z-20">
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Shield size={14} className="text-emerald-400" />
                        <span>{signalingStatus === "connected" ? "WebRTC P2P Connected" : "Local Mode"}</span>
                    </div>
                    <button
                        onClick={toggleRecording}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isRecording
                                ? "bg-rose-600/20 border-rose-500/40 text-rose-300 animate-pulse"
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                        }`}
                    >
                        <Radio size={13} className={isRecording ? "text-rose-400" : "text-gray-400"} />
                        <span>{isRecording ? "Stop Recording" : "Record Meeting"}</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mx-auto">
                    <button
                        onClick={toggleMic}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isMuted ? "bg-rose-600 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                    >
                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isVideoOff ? "bg-rose-600 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                    >
                        {isVideoOff ? <VideoOff size={18} /> : <VideoIcon size={18} />}
                    </button>
                    <button
                        onClick={toggleScreenShare}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isScreenSharing ? "bg-purple-600 text-white animate-pulse" : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => {
                            const next = !isHandRaised;
                            setIsHandRaised(next);
                            sendSignal("state", { is_hand_raised: next });
                            showToast(next ? "Hand raised ✋" : "Hand lowered");
                        }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isHandRaised ? "bg-amber-500 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                    >
                        <Hand size={18} />
                    </button>
                    <button
                        onClick={() => setIsCallEnded(true)}
                        className="h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer ml-1"
                    >
                        <PhoneOff size={16} />
                        <span className="hidden sm:inline">End Call</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "chat" ? null : "chat")}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "chat" ? "bg-purple-600 border-purple-500 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "participants" ? null : "participants")}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "participants" ? "bg-purple-600 border-purple-500 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                    >
                        <Users size={16} />
                    </button>
                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "settings" ? null : "settings")}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "settings" ? "bg-purple-600 border-purple-500 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </footer>

            {/* INSTANT MEETING MODAL */}
            {showInstantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                    <Zap size={20} className="text-purple-400 fill-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Instant Video Meeting Link</h3>
                                    <p className="text-xs text-gray-400">Share this link to invite any participant instantly</p>
                                </div>
                            </div>
                            <button onClick={() => setShowInstantModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300">Generated Video Room URL</label>
                            <div className="flex items-center gap-2 bg-[#0F172A] border border-purple-500/20 rounded-2xl p-2.5 text-xs font-mono text-purple-200">
                                <span className="flex-1 truncate">{instantGeneratedLink}</span>
                                <button onClick={() => copyMeetingUrl(instantGeneratedLink)} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer shrink-0">
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button onClick={() => copyMeetingUrl(instantGeneratedLink)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer">
                                <Copy size={14} /> <span>Copy Link</span>
                            </button>
                            <a href={instantGeneratedLink} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 text-center">
                                <span>Launch Room</span> <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
