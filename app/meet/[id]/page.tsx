"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
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
    UserPlus,
    UserCheck,
    UserX,
    Clock,
    Lock,
    Volume2
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
    email?: string;
    role: string;
    is_host: boolean;
    status?: "admitted" | "waiting" | "rejected";
    is_muted: boolean;
    is_video_off: boolean;
    is_hand_raised?: boolean;
};

type AttendeeLog = {
    name: string;
    email: string;
    role: string;
    status: "admitted" | "waiting" | "rejected";
    requested_at: string;
    admitted_at?: string;
};

type RemoteMediaEntry = {
    stream: MediaStream;
    rev: number;
};

const ICE_SERVERS: RTCConfiguration = {
    iceCandidatePoolSize: 10,
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
        {
            urls: [
                "turn:openrelay.metered.ca:80",
                "turn:openrelay.metered.ca:443",
                "turn:openrelay.metered.ca:443?transport=tcp",
                "turns:openrelay.metered.ca:443?transport=tcp",
            ],
            username: "openrelayproject",
            credential: "openrelayproject",
        },
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

function getInitialUserProfile(): { name: string; email: string; isAuthenticated: boolean } {
    if (typeof window === "undefined") return { name: "", email: "", isAuthenticated: false };
    try {
        const rawUser = localStorage.getItem("user") || localStorage.getItem("auth_data");
        const token = localStorage.getItem("token");
        if (rawUser) {
            const parsed = JSON.parse(rawUser);
            const u = parsed.user || parsed;
            const name = u.full_name || u.name || (u.email ? u.email.split("@")[0] : "");
            const email = u.email || "";
            if (name || email) {
                return { name, email, isAuthenticated: Boolean(token) };
            }
        }
    } catch {}
    return { name: "", email: "", isAuthenticated: false };
}

function RemoteVideoTile({
    peer,
    mediaEntry,
}: {
    peer: RemotePeer;
    mediaEntry: RemoteMediaEntry | undefined;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioBlocked, setAudioBlocked] = useState(false);
    const [, setTrackTick] = useState(0);

    const stream = mediaEntry?.stream;
    const rev = mediaEntry?.rev || 0;

    useEffect(() => {
        if (!stream) return;

        if (videoRef.current) {
            if (videoRef.current.srcObject !== stream) {
                videoRef.current.srcObject = stream;
            }
            videoRef.current.play().catch(() => {});
        }

        if (audioRef.current) {
            if (audioRef.current.srcObject !== stream) {
                audioRef.current.srcObject = stream;
            }
            audioRef.current.muted = false;
            audioRef.current.volume = 1.0;
            audioRef.current
                .play()
                .then(() => setAudioBlocked(false))
                .catch(() => {
                    if (stream.getAudioTracks().length > 0) {
                        setAudioBlocked(true);
                    }
                });
        }

        const bump = () => {
            setTrackTick((t) => t + 1);
            if (videoRef.current) videoRef.current.play().catch(() => {});
            if (audioRef.current) {
                audioRef.current
                    .play()
                    .then(() => setAudioBlocked(false))
                    .catch(() => {});
            }
        };

        stream.addEventListener("addtrack", bump);
        stream.addEventListener("removetrack", bump);
        stream.getTracks().forEach((t) => {
            t.addEventListener("unmute", bump);
            t.addEventListener("mute", bump);
            t.addEventListener("ended", bump);
        });

        return () => {
            stream.removeEventListener("addtrack", bump);
            stream.removeEventListener("removetrack", bump);
            stream.getTracks().forEach((t) => {
                t.removeEventListener("unmute", bump);
                t.removeEventListener("mute", bump);
                t.removeEventListener("ended", bump);
            });
        };
    }, [stream, rev]);

    const videoTracks = stream ? stream.getVideoTracks() : [];
    const audioTracks = stream ? stream.getAudioTracks() : [];
    const hasLiveVideo = Boolean(
        videoTracks.some((t) => t.readyState === "live" && t.enabled) && !peer.is_video_off
    );
    const hasLiveAudio = Boolean(audioTracks.some((t) => t.readyState === "live"));

    const initials =
        peer.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "P";

    const unlockAudio = () => {
        if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.volume = 1.0;
            audioRef.current
                .play()
                .then(() => setAudioBlocked(false))
                .catch(() => {});
        }
    };

    return (
        <div
            onClick={audioBlocked ? unlockAudio : undefined}
            className="bg-[#141C2E] border border-gray-800 hover:border-purple-500/40 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group w-full aspect-video max-h-[68vh]"
        >
            {/* Dedicated muted video element (never blocked by browser autoplay policies) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-200 ${
                    hasLiveVideo ? "opacity-100 z-[2]" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Dedicated unmuted audio element for crystal-clear voice playback */}
            <audio ref={audioRef} autoPlay playsInline />

            {!hasLiveVideo && (
                <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#3B0764]/40 flex flex-col items-center justify-center overflow-hidden z-[1]">
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
                                {peer.is_muted ? (
                                    <MicOff size={11} className="text-white" />
                                ) : (
                                    <Mic size={11} className="text-white" />
                                )}
                            </span>
                        </div>
                        <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                            {peer.is_video_off
                                ? hasLiveAudio
                                    ? "Camera Off • Audio Live"
                                    : "Camera Off"
                                : hasLiveAudio
                                ? "Voice Connected"
                                : "Connecting Live Audio & Video..."}
                        </span>
                    </div>
                </div>
            )}

            {audioBlocked && (
                <button
                    type="button"
                    onClick={unlockAudio}
                    className="absolute top-3 left-3 z-20 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl animate-pulse cursor-pointer"
                >
                    <Volume2 size={14} /> Tap to Unmute {peer.name}
                </button>
            )}

            {peer.is_hand_raised && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg animate-bounce z-20">
                    <Hand size={13} />
                    <span>Hand Raised</span>
                </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex flex-col gap-0.5 text-white font-medium z-20">
                <div className="flex items-center gap-2">
                    <span className="font-bold">{peer.name}</span>
                    {peer.is_muted ? (
                        <MicOff size={13} className="text-rose-400" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                </div>
                {peer.email && <span className="text-[10px] text-gray-300">{peer.email}</span>}
            </div>
        </div>
    );
}

export default function InSystemVideoMeetPage() {
    const params = useParams();
    const router = useRouter();
    const meetId = typeof params?.id === "string" ? params.id : "room-live-demo";

    const selfPeerIdRef = useRef<string>(`peer_${Math.random().toString(36).slice(2, 10)}`);

    // Participant / Host Identity & Lobby Phase
    const [displayName, setDisplayName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState<boolean>(false);
    const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);
    const [joinPhase, setJoinPhase] = useState<"initializing" | "prejoin" | "waiting" | "admitted" | "rejected">("initializing");
    const [isHost, setIsHost] = useState<boolean>(false);
    const [hostName, setHostName] = useState<string>("Meeting Host");
    const [requireAdmission, setRequireAdmission] = useState<boolean>(true);

    // Media & WebRTC Refs
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // WebRTC Perfect Negotiation + ICE Candidate Queuing Refs
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const makingOfferRef = useRef<Map<string, boolean>>(new Map());
    const outgoingIceBufferRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const outgoingIceTimerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const processedSignalIdsRef = useRef<Set<string>>(new Set());
    const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

    const [remoteMedia, setRemoteMedia] = useState<Record<string, RemoteMediaEntry>>({});
    const [httpPeers, setHttpPeers] = useState<RemotePeer[]>([]);
    const [presencePeers, setPresencePeers] = useState<RemotePeer[]>([]);
    const [httpWaitingPeers, setHttpWaitingPeers] = useState<RemotePeer[]>([]);
    const [presenceWaitingPeers, setPresenceWaitingPeers] = useState<RemotePeer[]>([]);
    const [attendeeLogs, setAttendeeLogs] = useState<AttendeeLog[]>([]);
    const lastSeqRef = useRef<number>(0);

    // Merge Presence + HTTP peers seamlessly (deduplicated by peer_id)
    const remotePeers = (() => {
        const map = new Map<string, RemotePeer>();
        for (const p of httpPeers) {
            if (p.peer_id !== selfPeerIdRef.current) map.set(p.peer_id, p);
        }
        for (const p of presencePeers) {
            if (p.peer_id !== selfPeerIdRef.current) {
                map.set(p.peer_id, { ...(map.get(p.peer_id) || {}), ...p });
            }
        }
        return Array.from(map.values());
    })();

    const waitingPeers = (() => {
        const admittedIds = new Set(remotePeers.map((p) => p.peer_id));
        const map = new Map<string, RemotePeer>();
        for (const p of httpWaitingPeers) {
            if (p.peer_id !== selfPeerIdRef.current && !admittedIds.has(p.peer_id)) {
                map.set(p.peer_id, p);
            }
        }
        for (const p of presenceWaitingPeers) {
            if (p.peer_id !== selfPeerIdRef.current && !admittedIds.has(p.peer_id)) {
                map.set(p.peer_id, { ...(map.get(p.peer_id) || {}), ...p });
            }
        }
        return Array.from(map.values());
    })();

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

    const [callSeconds, setCallSeconds] = useState(0);
    useEffect(() => {
        if (isCallEnded || joinPhase !== "admitted") return;
        const interval = setInterval(() => setCallSeconds((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isCallEnded, joinPhase]);

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
            text: `🔒 Room ${meetId} active. Share the clean room link with any client or team member — their Name & Email will be recorded and you can let them in with 1 click.`,
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

    // Persist attendee locally for Meet Hub history
    const persistAttendeeLocally = useCallback(
        (name: string, email: string, status: string) => {
            try {
                const key = "beraxis_meet_attendees";
                const raw = localStorage.getItem(key);
                const list = raw ? JSON.parse(raw) : [];
                const next = [
                    {
                        room_id: meetId,
                        name,
                        email,
                        status,
                        timestamp: new Date().toISOString(),
                    },
                    ...list.filter((x: any) => !(x.room_id === meetId && x.email === email)),
                ].slice(0, 200);
                localStorage.setItem(key, JSON.stringify(next));
            } catch {}
        },
        [meetId]
    );

    // Send Signal via BOTH Supabase Realtime WebSocket Broadcast (<30ms) AND Cloud HTTP API Fallback
    const sendSignal = useCallback(
        async (type: string, payload: Record<string, unknown>, targetId?: string) => {
            const signalId = `sig_${selfPeerIdRef.current}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            processedSignalIdsRef.current.add(signalId);

            const envelope = {
                signal_id: signalId,
                sender_id: selfPeerIdRef.current,
                target_id: targetId || null,
                type,
                payload,
            };

            // 1. Instant WebSocket Broadcast via Supabase Realtime
            if (realtimeChannelRef.current) {
                realtimeChannelRef.current
                    .send({
                        type: "broadcast",
                        event: "meet_signal",
                        payload: envelope,
                    })
                    .catch(() => {});
            }

            // 2. Cloud HTTP Fallback
            try {
                await fetch("/api/meet", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "signal",
                        room_id: meetId,
                        ...envelope,
                    }),
                });
            } catch {}
        },
        [meetId]
    );

    const queueOutgoingIce = useCallback(
        (remotePeerId: string, candidate: RTCIceCandidateInit) => {
            const buf = outgoingIceBufferRef.current.get(remotePeerId) || [];
            buf.push(candidate);
            outgoingIceBufferRef.current.set(remotePeerId, buf);

            if (!outgoingIceTimerRef.current.has(remotePeerId)) {
                const t = setTimeout(() => {
                    outgoingIceTimerRef.current.delete(remotePeerId);
                    const batch = outgoingIceBufferRef.current.get(remotePeerId) || [];
                    outgoingIceBufferRef.current.delete(remotePeerId);
                    if (batch.length > 0) {
                        sendSignal("ice_batch", { candidates: batch }, remotePeerId);
                    }
                }, 100);
                outgoingIceTimerRef.current.set(remotePeerId, t);
            }
        },
        [sendSignal]
    );

    const attachLocalTracksToPc = useCallback((pc: RTCPeerConnection) => {
        const activeStream = mediaStreamRef.current;
        const senders = pc.getSenders();

        if (activeStream) {
            activeStream.getTracks().forEach((track) => {
                const existing = senders.find((s) => s.track?.kind === track.kind);
                if (existing) {
                    existing.replaceTrack(track).catch(() => {});
                } else {
                    pc.addTrack(track, activeStream);
                }
            });
        }

        // If screen sharing is active, replace video track with screen track
        if (screenStreamRef.current) {
            const screenTrack = screenStreamRef.current.getVideoTracks()[0];
            if (screenTrack) {
                const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack).catch(() => {});
                } else {
                    pc.addTrack(screenTrack, screenStreamRef.current);
                }
            }
        }
    }, []);

    const ensureReceiveTransceivers = useCallback((pc: RTCPeerConnection) => {
        const transceivers = pc.getTransceivers();
        const hasAudio = transceivers.some(
            (t) => t.sender.track?.kind === "audio" || t.receiver.track?.kind === "audio"
        );
        const hasVideo = transceivers.some(
            (t) => t.sender.track?.kind === "video" || t.receiver.track?.kind === "video"
        );
        if (!hasAudio) {
            try {
                pc.addTransceiver("audio", { direction: "recvonly" });
            } catch {}
        }
        if (!hasVideo) {
            try {
                pc.addTransceiver("video", { direction: "recvonly" });
            } catch {}
        }
    }, []);

    const createPeerConnection = useCallback(
        (remotePeerId: string): RTCPeerConnection => {
            const existing = peerConnectionsRef.current.get(remotePeerId);
            if (
                existing &&
                existing.connectionState !== "closed" &&
                existing.connectionState !== "failed"
            ) {
                attachLocalTracksToPc(existing);
                return existing;
            }
            if (existing) {
                try {
                    existing.close();
                } catch {}
                peerConnectionsRef.current.delete(remotePeerId);
            }

            const pc = new RTCPeerConnection(ICE_SERVERS);
            attachLocalTracksToPc(pc);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    queueOutgoingIce(remotePeerId, event.candidate.toJSON());
                }
            };

            pc.ontrack = (event) => {
                setRemoteMedia((prev) => {
                    const prevEntry = prev[remotePeerId];
                    const combinedTracks = new Map<string, MediaStreamTrack>();

                    if (prevEntry?.stream) {
                        prevEntry.stream.getTracks().forEach((t) => {
                            if (t.readyState === "live") combinedTracks.set(t.kind, t);
                        });
                    }
                    if (event.streams && event.streams[0]) {
                        event.streams[0].getTracks().forEach((t) => {
                            combinedTracks.set(t.kind, t);
                        });
                    }
                    if (event.track) {
                        combinedTracks.set(event.track.kind, event.track);
                    }

                    const nextStream = new MediaStream(Array.from(combinedTracks.values()));
                    return {
                        ...prev,
                        [remotePeerId]: {
                            stream: nextStream,
                            rev: (prevEntry?.rev || 0) + 1,
                        },
                    };
                });
            };

            pc.oniceconnectionstatechange = () => {
                if (pc.iceConnectionState === "failed") {
                    pc.restartIce?.();
                }
            };

            peerConnectionsRef.current.set(remotePeerId, pc);
            return pc;
        },
        [attachLocalTracksToPc, queueOutgoingIce]
    );

    const flushPendingIce = useCallback(async (remotePeerId: string, pc: RTCPeerConnection) => {
        const queued = pendingIceRef.current.get(remotePeerId);
        if (!queued || queued.length === 0) return;
        pendingIceRef.current.delete(remotePeerId);
        for (const cand of queued) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
        }
    }, []);

    const initiateOffer = useCallback(
        async (remoteId: string, iceRestart = false) => {
            if (!remoteId || remoteId === selfPeerIdRef.current) return;
            if (makingOfferRef.current.get(remoteId)) return;

            try {
                makingOfferRef.current.set(remoteId, true);
                const pc = createPeerConnection(remoteId);
                attachLocalTracksToPc(pc);
                ensureReceiveTransceivers(pc);

                if (pc.signalingState !== "stable") return;

                const offer = await pc.createOffer({ iceRestart });
                if (pc.signalingState !== "stable") return;
                await pc.setLocalDescription(offer);
                await sendSignal("offer", { sdp: pc.localDescription }, remoteId);
            } catch {
            } finally {
                makingOfferRef.current.set(remoteId, false);
            }
        },
        [createPeerConnection, attachLocalTracksToPc, ensureReceiveTransceivers, sendSignal]
    );

    // 1. Initialize Real Camera & Mic Stream (with automatic audio-only fallback if camera is busy!)
    const startLocalStream = useCallback(
        async (audioId?: string, videoId?: string) => {
            try {
                setMediaError(null);
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                }

                let stream: MediaStream | null = null;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: audioId
                            ? { deviceId: { exact: audioId }, echoCancellation: true, noiseSuppression: true }
                            : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                        video: videoId
                            ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                            : { width: { ideal: 1280 }, height: { ideal: 720 } },
                    });
                } catch {
                    // Fallback: if webcam is busy/locked by another app or absent, still capture microphone audio!
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: audioId
                            ? { deviceId: { exact: audioId }, echoCancellation: true, noiseSuppression: true }
                            : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                        video: false,
                    });
                    setIsVideoOff(true);
                }

                mediaStreamRef.current = stream;
                setHasMediaPermission(true);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                if (previewVideoRef.current) {
                    previewVideoRef.current.srcObject = stream;
                }

                stream.getAudioTracks().forEach((t) => {
                    t.enabled = !isMuted;
                });
                stream.getVideoTracks().forEach((t) => {
                    t.enabled = !isVideoOff;
                });

                // Attach newly acquired tracks to any existing WebRTC connections and renegotiate!
                peerConnectionsRef.current.forEach((pc, remoteId) => {
                    attachLocalTracksToPc(pc);
                    initiateOffer(remoteId).catch(() => {});
                });

                try {
                    const AudioCtx =
                        window.AudioContext ||
                        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                        await audioContextRef.current.close().catch(() => {});
                    }
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
            }
        },
        [isMuted, isVideoOff, attachLocalTracksToPc, initiateOffer]
    );

    // Perform Server Join Request
    const performRoomJoin = useCallback(
        async (name: string, email: string, creatorFlag: boolean, authFlag: boolean) => {
            const selfId = selfPeerIdRef.current;
            try {
                const res = await fetch("/api/meet", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "join",
                        room_id: meetId,
                        peer_id: selfId,
                        name: name.trim(),
                        email: email.trim(),
                        is_room_creator: creatorFlag,
                        is_authenticated_user: authFlag,
                        is_muted: isMuted,
                        is_video_off: isVideoOff,
                    }),
                });
                if (!res.ok) throw new Error("Join error");
                const data = await res.json();
                setSignalingStatus("connected");
                lastSeqRef.current = data.seq || 0;
                const resolvedHost = Boolean(data.is_host || creatorFlag);
                setIsHost(resolvedHost);
                if (resolvedHost) {
                    try {
                        localStorage.setItem(`beraxis_meet_host_${meetId}`, "1");
                    } catch {}
                }
                setHostName(data.host_name || "Meeting Host");
                if (Array.isArray(data.peers)) setHttpPeers(data.peers);
                if (Array.isArray(data.waiting_peers)) setHttpWaitingPeers(data.waiting_peers);
                if (Array.isArray(data.attendee_logs)) setAttendeeLogs(data.attendee_logs);

                const finalStatus = creatorFlag ? "admitted" : data.my_status || "waiting";
                persistAttendeeLocally(name.trim(), email.trim(), finalStatus);

                if (finalStatus === "waiting") {
                    setJoinPhase("waiting");
                    showToast("⏳ Request sent! Waiting for the meeting host to let you in...");
                } else {
                    setJoinPhase("admitted");
                }
            } catch {
                setSignalingStatus("local-only");
                if (creatorFlag) {
                    setIsHost(true);
                    setJoinPhase("admitted");
                } else {
                    setJoinPhase("admitted");
                }
            }
        },
        [meetId, isMuted, isVideoOff, persistAttendeeLocally, showToast]
    );

    // Boot Identity + Auto-Enter if Host Creator (Fixes Screenshot 1!)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const profile = getInitialUserProfile();
        if (profile.name) setDisplayName(profile.name);
        if (profile.email) setUserEmail(profile.email);
        setIsAuthenticatedUser(profile.isAuthenticated);

        const urlParams = new URLSearchParams(window.location.search);
        const queryHost = urlParams.get("host") === "1";
        let storedCreator = false;
        try {
            storedCreator =
                localStorage.getItem(`beraxis_meet_host_${meetId}`) === "1" ||
                sessionStorage.getItem(`beraxis_meet_host_${meetId}`) === "1";
            if (queryHost) {
                localStorage.setItem(`beraxis_meet_host_${meetId}`, "1");
                sessionStorage.setItem(`beraxis_meet_host_${meetId}`, "1");
                // Clean ?host=1 from address bar so copying the browser URL gives a clean guest link!
                window.history.replaceState({}, "", `/meet/${meetId}`);
                storedCreator = true;
            }
        } catch {}

        setIsRoomCreator(storedCreator);

        if (Boolean(navigator?.mediaDevices?.getUserMedia)) {
            startLocalStream();
        }

        // If this browser created the meeting (Host), skip the guest check-in gate and enter directly!
        if (storedCreator && (profile.name || profile.email || profile.isAuthenticated)) {
            const hostDisplay = profile.name || "Meeting Host";
            const hostMail = profile.email || "host@beraxis.online";
            setDisplayName(hostDisplay);
            setUserEmail(hostMail);
            setIsHost(true);
            setJoinPhase("admitted");
            performRoomJoin(hostDisplay, hostMail, true, true);
        } else {
            setJoinPhase("prejoin");
        }

        return () => {
            if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop());
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close().catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetId]);

    useEffect(() => {
        if (joinPhase === "admitted" && localVideoRef.current && mediaStreamRef.current) {
            localVideoRef.current.srcObject = mediaStreamRef.current;
            localVideoRef.current.play().catch(() => {});
        }
        if (joinPhase === "prejoin" && previewVideoRef.current && mediaStreamRef.current) {
            previewVideoRef.current.srcObject = mediaStreamRef.current;
            previewVideoRef.current.play().catch(() => {});
        }
    }, [joinPhase]);

    // Unified Signal Event Processor (Handles BOTH Supabase Realtime WebSockets & HTTP Fallback)
    const handleSignalEvent = useCallback(
        async (ev: {
            signal_id?: string;
            sender_id: string;
            target_id?: string | null;
            type: string;
            payload: Record<string, any>;
        }) => {
            const selfId = selfPeerIdRef.current;
            if (!ev || ev.sender_id === selfId) return;
            if (ev.target_id && ev.target_id !== selfId) return;

            if (ev.signal_id) {
                if (processedSignalIdsRef.current.has(ev.signal_id)) return;
                processedSignalIdsRef.current.add(ev.signal_id);
            }

            const from = ev.sender_id;

            if (ev.type === "admitted") {
                setJoinPhase("admitted");
                showToast("🎉 The host has let you into the meeting!");
                return;
            }
            if (ev.type === "rejected") {
                setJoinPhase("rejected");
                showToast("❌ The host declined the join request.");
                return;
            }
            if (ev.type === "guest_waiting") {
                if (ev.payload?.name) {
                    setAttendeeLogs((prev) => {
                        const filtered = prev.filter((l) => l.email !== ev.payload.email);
                        return [
                            {
                                name: ev.payload.name,
                                email: ev.payload.email || "Not provided",
                                role: "Client / Guest",
                                status: "waiting",
                                requested_at: new Date().toISOString(),
                            },
                            ...filtered,
                        ];
                    });
                }
                showToast(`🔔 ${ev.payload?.name || "Guest"} (${ev.payload?.email || ""}) is waiting in the lobby!`);
                return;
            }

            // Only process WebRTC media signals once admitted into the meeting!
            if (ev.type === "peer_joined" || ev.type === "ready_for_webrtc") {
                if (selfId < from) {
                    await initiateOffer(from);
                } else {
                    // Polite peer ensures PC is initialized and ready
                    createPeerConnection(from);
                }
            } else if (ev.type === "peer_left") {
                const pc = peerConnectionsRef.current.get(from);
                if (pc) {
                    pc.close();
                    peerConnectionsRef.current.delete(from);
                }
                setRemoteMedia((prev) => {
                    const copy = { ...prev };
                    delete copy[from];
                    return copy;
                });
            } else if (ev.type === "offer" && ev.payload?.sdp) {
                const pc = createPeerConnection(from);
                attachLocalTracksToPc(pc);
                const isPolite = selfId > from;
                const offerCollision =
                    makingOfferRef.current.get(from) || pc.signalingState !== "stable";

                if (offerCollision && !isPolite) {
                    return;
                }
                try {
                    if (offerCollision) {
                        await pc.setLocalDescription({ type: "rollback" }).catch(() => {});
                    }
                    await pc.setRemoteDescription(new RTCSessionDescription(ev.payload.sdp));
                    await flushPendingIce(from, pc);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await sendSignal("answer", { sdp: pc.localDescription }, from);
                } catch {}
            } else if (ev.type === "answer" && ev.payload?.sdp) {
                const pc = peerConnectionsRef.current.get(from);
                if (pc && pc.signalingState === "have-local-offer") {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(ev.payload.sdp));
                        await flushPendingIce(from, pc);
                    } catch {}
                }
            } else if ((ev.type === "ice" && ev.payload?.candidate) || (ev.type === "ice_batch" && Array.isArray(ev.payload?.candidates))) {
                const candidates: RTCIceCandidateInit[] =
                    ev.type === "ice_batch" ? ev.payload.candidates : [ev.payload.candidate];
                const pc = peerConnectionsRef.current.get(from);

                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    for (const c of candidates) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(c));
                        } catch {}
                    }
                } else {
                    const q = pendingIceRef.current.get(from) || [];
                    pendingIceRef.current.set(from, [...q, ...candidates]);
                }
            } else if (ev.type === "chat" && ev.payload?.message) {
                setMessages((prev) =>
                    prev.some((m) => m.id === ev.payload.message.id)
                        ? prev
                        : [...prev, ev.payload.message]
                );
            }
        },
        [createPeerConnection, attachLocalTracksToPc, flushPendingIce, initiateOffer, sendSignal, showToast]
    );

    // 2. Supabase Realtime WebSocket Channel (Broadcast + Presence) — Global Sub-30ms Delivery on Vercel!
    useEffect(() => {
        if (joinPhase !== "waiting" && joinPhase !== "admitted") return;

        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!sbUrl || !sbKey) return;

        const selfId = selfPeerIdRef.current;
        const sb = createClient(sbUrl, sbKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            realtime: { params: { eventsPerSecond: 40 } },
        });

        const channel = sb.channel(`beraxis_meet_${meetId}`, {
            config: {
                broadcast: { self: false },
                presence: { key: selfId },
            },
        });

        channel
            .on("broadcast", { event: "meet_signal" }, ({ payload }) => {
                if (payload) {
                    handleSignalEvent(payload);
                }
            })
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const admittedList: RemotePeer[] = [];
                const waitingList: RemotePeer[] = [];

                Object.entries(state).forEach(([key, presences]) => {
                    if (key === selfId || !Array.isArray(presences) || presences.length === 0) return;
                    const p = presences[presences.length - 1] as any;
                    const peerObj: RemotePeer = {
                        peer_id: p.peer_id || key,
                        name: p.name || "Participant",
                        email: p.email || "",
                        role: p.is_host ? "Host" : "Guest",
                        is_host: Boolean(p.is_host),
                        status: p.status || "waiting",
                        is_muted: Boolean(p.is_muted),
                        is_video_off: Boolean(p.is_video_off),
                        is_hand_raised: Boolean(p.is_hand_raised),
                    };
                    if (p.status === "admitted") {
                        admittedList.push(peerObj);
                    } else if (p.status === "waiting") {
                        waitingList.push(peerObj);
                    }
                });

                setPresencePeers(admittedList);
                setPresenceWaitingPeers(waitingList);

                // Record waiting guests in attendee logs automatically
                if (waitingList.length > 0) {
                    setAttendeeLogs((prev) => {
                        const copy = [...prev];
                        waitingList.forEach((wp) => {
                            if (!copy.some((x) => x.email === wp.email && x.name === wp.name)) {
                                copy.unshift({
                                    name: wp.name,
                                    email: wp.email || "Not provided",
                                    role: "Client / Guest",
                                    status: "waiting",
                                    requested_at: new Date().toISOString(),
                                });
                            }
                        });
                        return copy;
                    });
                }
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    setSignalingStatus("connected");
                    await channel.track({
                        peer_id: selfId,
                        name: displayName || "Participant",
                        email: userEmail || "",
                        is_host: isHost,
                        status: joinPhase,
                        is_muted: isMuted,
                        is_video_off: isVideoOff,
                        is_hand_raised: isHandRaised,
                    });

                    if (joinPhase === "waiting") {
                        sendSignal("guest_waiting", {
                            peer_id: selfId,
                            name: displayName,
                            email: userEmail,
                        });
                    } else if (joinPhase === "admitted") {
                        sendSignal("ready_for_webrtc", {
                            peer_id: selfId,
                            name: displayName,
                            email: userEmail,
                        });
                    }
                }
            });

        realtimeChannelRef.current = channel;

        return () => {
            realtimeChannelRef.current = null;
            sb.removeChannel(channel).catch(() => {});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetId, joinPhase]);

    // Keep Presence metadata updated when mute/camera/hand/name changes
    useEffect(() => {
        if (!realtimeChannelRef.current || (joinPhase !== "waiting" && joinPhase !== "admitted")) return;
        realtimeChannelRef.current
            .track({
                peer_id: selfPeerIdRef.current,
                name: displayName || "Participant",
                email: userEmail || "",
                is_host: isHost,
                status: joinPhase,
                is_muted: isMuted,
                is_video_off: isVideoOff,
                is_hand_raised: isHandRaised,
            })
            .catch(() => {});
    }, [displayName, userEmail, isHost, joinPhase, isMuted, isVideoOff, isHandRaised]);

    // 3. Periodic WebRTC Health & Handshake Watchdog + Cloud HTTP Poll Fallback
    useEffect(() => {
        if (joinPhase !== "waiting" && joinPhase !== "admitted") return;

        let cancelled = false;
        const selfId = selfPeerIdRef.current;

        const pollTimer = setInterval(async () => {
            if (cancelled) return;
            try {
                const pollRes = await fetch(
                    `/api/meet?room_id=${encodeURIComponent(meetId)}&peer_id=${encodeURIComponent(selfId)}&since=${lastSeqRef.current}`,
                    { cache: "no-store" }
                );
                if (!pollRes.ok) return;
                const pollData = await pollRes.json();
                setSignalingStatus("connected");

                if (typeof pollData.seq === "number") {
                    lastSeqRef.current = pollData.seq;
                }
                if (pollData.is_host) {
                    setIsHost(true);
                }
                if (typeof pollData.require_admission === "boolean") {
                    setRequireAdmission(pollData.require_admission);
                }
                if (pollData.host_name) {
                    setHostName(pollData.host_name);
                }
                if (pollData.my_status === "admitted" && joinPhase === "waiting") {
                    setJoinPhase("admitted");
                    showToast("🎉 The host has let you into the meeting!");
                } else if (pollData.my_status === "rejected" && joinPhase === "waiting") {
                    setJoinPhase("rejected");
                }

                if (Array.isArray(pollData.peers)) {
                    setHttpPeers(pollData.peers);
                }
                if (Array.isArray(pollData.waiting_peers)) {
                    setHttpWaitingPeers(pollData.waiting_peers);
                }
                if (Array.isArray(pollData.attendee_logs) && pollData.attendee_logs.length > 0) {
                    setAttendeeLogs((prev) => {
                        const merged = [...pollData.attendee_logs];
                        prev.forEach((p) => {
                            if (!merged.some((m: AttendeeLog) => m.email === p.email && m.name === p.name)) {
                                merged.push(p);
                            }
                        });
                        return merged;
                    });
                }
                if (Array.isArray(pollData.events)) {
                    for (const ev of pollData.events) {
                        await handleSignalEvent(ev);
                    }
                }
            } catch {}
        }, 1800);

        return () => {
            cancelled = true;
            clearInterval(pollTimer);
        };
    }, [joinPhase, meetId, handleSignalEvent, showToast]);

    // Auto-Establish & Auto-Heal WebRTC Media Connections for All Admitted Peers
    useEffect(() => {
        if (joinPhase !== "admitted") return;
        const selfId = selfPeerIdRef.current;

        // Immediately initiate offer for any newly visible admitted peer
        remotePeers.forEach((peer) => {
            const existingPc = peerConnectionsRef.current.get(peer.peer_id);
            if (!existingPc) {
                if (selfId < peer.peer_id) {
                    initiateOffer(peer.peer_id);
                } else {
                    sendSignal("ready_for_webrtc", { peer_id: selfId }, peer.peer_id);
                }
            }
        });

        const watchdog = setInterval(() => {
            remotePeers.forEach((peer) => {
                const pc = peerConnectionsRef.current.get(peer.peer_id);
                const hasMedia = Boolean(
                    remoteMedia[peer.peer_id]?.stream &&
                        remoteMedia[peer.peer_id].stream.getTracks().some((t) => t.readyState === "live")
                );

                if (
                    !pc ||
                    pc.connectionState === "failed" ||
                    pc.connectionState === "disconnected" ||
                    (!hasMedia && pc.connectionState !== "connecting")
                ) {
                    if (selfId < peer.peer_id) {
                        initiateOffer(peer.peer_id, Boolean(pc && pc.connectionState === "failed"));
                    } else {
                        sendSignal("ready_for_webrtc", { peer_id: selfId }, peer.peer_id);
                    }
                }
            });
        }, 3500);

        return () => clearInterval(watchdog);
    }, [joinPhase, remotePeers, remoteMedia, initiateOffer, sendSignal]);

    // Cleanup on Unmount
    useEffect(() => {
        const selfId = selfPeerIdRef.current;
        return () => {
            fetch("/api/meet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "leave", room_id: meetId, peer_id: selfId }),
            }).catch(() => {});
            peerConnectionsRef.current.forEach((pc) => pc.close());
            peerConnectionsRef.current.clear();
        };
    }, [meetId]);

    // Guest Check-In Form Submit
    const handleCheckInAndJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim() || !userEmail.trim()) {
            showToast("⚠️ Please enter both your Full Name and Email Address to join.");
            return;
        }
        await performRoomJoin(displayName, userEmail, isRoomCreator, isAuthenticatedUser);
    };

    // Host Action: Admit or Reject a Waiting Guest (Broadcasts Instantly via WebSocket + Saves to Cloud API)
    const handleHostDecision = async (targetPeer: RemotePeer, decision: "admit" | "reject") => {
        const targetPeerId = targetPeer.peer_id;

        // 1. Instant WebSocket signal so guest enters in <30ms!
        await sendSignal(
            decision === "admit" ? "admitted" : "rejected",
            { peer_id: targetPeerId, name: targetPeer.name, email: targetPeer.email },
            targetPeerId
        );

        // Update local state optimistically
        setHttpWaitingPeers((prev) => prev.filter((p) => p.peer_id !== targetPeerId));
        setPresenceWaitingPeers((prev) => prev.filter((p) => p.peer_id !== targetPeerId));
        setAttendeeLogs((prev) =>
            prev.map((l) =>
                l.email === targetPeer.email || l.name === targetPeer.name
                    ? { ...l, status: decision === "admit" ? "admitted" : "rejected" }
                    : l
            )
        );

        showToast(
            decision === "admit"
                ? `✅ Admitted ${targetPeer.name} into the live meeting!`
                : `Declined ${targetPeer.name}'s request.`
        );

        // 2. Persist decision to Cloud API
        try {
            const res = await fetch("/api/meet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: decision,
                    room_id: meetId,
                    sender_id: selfPeerIdRef.current,
                    target_peer_id: targetPeerId,
                    guest_info: { name: targetPeer.name, email: targetPeer.email },
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.attendee_logs)) setAttendeeLogs(data.attendee_logs);
            }
        } catch {}
    };

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
                peerConnectionsRef.current.forEach((pc, remoteId) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                    if (sender && screenTrack) {
                        sender.replaceTrack(screenTrack).catch(() => {});
                    } else if (screenTrack) {
                        pc.addTrack(screenTrack, screenStream);
                        initiateOffer(remoteId).catch(() => {});
                    }
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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const newMsg: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sender: `${displayName}${userEmail ? ` (${userEmail})` : ""}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: chatInput.trim(),
            isHost,
        };
        setMessages((prev) => [...prev, newMsg]);
        sendSignal("chat", { message: { ...newMsg, isHost: false } });
        setChatInput("");
    };

    const handleGenerateInstantMeeting = () => {
        const uniqueRoomCode = `meet-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}`;
        try {
            localStorage.setItem(`beraxis_meet_host_${uniqueRoomCode}`, "1");
        } catch {}
        const fullUrl =
            typeof window !== "undefined"
                ? `${window.location.origin}/meet/${uniqueRoomCode}`
                : `https://www.beraxis.online/meet/${uniqueRoomCode}`;
        setInstantGeneratedLink(fullUrl);
        setShowInstantModal(true);
    };

    const copyMeetingUrl = (urlToCopy?: string) => {
        const cleanShareUrl =
            urlToCopy ||
            (typeof window !== "undefined"
                ? `${window.location.origin}/meet/${meetId}`
                : `https://www.beraxis.online/meet/${meetId}`);
        navigator.clipboard.writeText(cleanShareUrl);
        showToast("📋 Shareable client meeting link copied to clipboard!");
    };

    const handleSendEmailInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        const shareUrl =
            typeof window !== "undefined"
                ? `${window.location.origin}/meet/${meetId}`
                : `https://www.beraxis.online/meet/${meetId}`;
        navigator.clipboard.writeText(shareUrl);
        showToast(`✉️ Shareable meeting link copied & invite logged for ${inviteName || inviteEmail}!`);
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
    const selfInitials =
        (displayName || "ME")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ME";

    if (joinPhase === "initializing") {
        return (
            <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-bold text-purple-300">
                    <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                    <span>Starting Beraxis HD Video Room...</span>
                </div>
            </div>
        );
    }

    // ─── GUEST / SHARED-LINK CHECK-IN SCREEN (Clean Non-Overlapping Controls!) ───
    if (joinPhase === "prejoin") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#070B14] via-[#0F172A] to-[#070B14] text-white flex flex-col justify-center items-center p-4 font-sans">
                {toastMsg && (
                    <div className="fixed top-6 right-6 z-50 bg-[#1E293B] border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl">
                        <Sparkles size={16} className="text-purple-400 shrink-0" />
                        <span>{toastMsg}</span>
                    </div>
                )}

                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111827]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                    {/* Left: Clean 16:9 Camera Preview + Controls Bar Below Video (Never Covers Face!) */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                                    B
                                </div>
                                <span className="font-extrabold text-sm text-white">BERAXIS MEET</span>
                            </div>
                            <span className="text-xs font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                                {meetId}
                            </span>
                        </div>

                        <div className="relative aspect-video w-full bg-[#090D16] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                            <video
                                ref={previewVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover -scale-x-100 ${
                                    isVideoOff || !hasMediaPermission ? "hidden" : "block"
                                }`}
                            />
                            {(isVideoOff || !hasMediaPermission) && (
                                <div className="flex flex-col items-center gap-2 text-center p-4">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl font-bold text-purple-300">
                                        {selfInitials}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {isVideoOff ? "Camera is turned off" : "Allow camera & microphone for HD video"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Dedicated Control Strip Below Video Preview */}
                        <div className="flex items-center justify-center gap-3 pt-0.5">
                            <button
                                type="button"
                                onClick={toggleMic}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                                    isMuted
                                        ? "bg-rose-600 text-white"
                                        : "bg-[#1E293B] hover:bg-[#293548] text-white border border-white/10"
                                }`}
                            >
                                {isMuted ? <MicOff size={15} /> : <Mic size={15} className="text-emerald-400" />}
                                <span>{isMuted ? "Mic Muted" : "Mic On"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={toggleVideo}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                                    isVideoOff
                                        ? "bg-rose-600 text-white"
                                        : "bg-[#1E293B] hover:bg-[#293548] text-white border border-white/10"
                                }`}
                            >
                                {isVideoOff ? <VideoOff size={15} /> : <VideoIcon size={15} className="text-cyan-400" />}
                                <span>{isVideoOff ? "Camera Off" : "Camera On"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Guest Name & Email Check-In Form */}
                    <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                                <Shield size={12} /> Guest &amp; Client Check-In
                            </span>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                                Join Video Meeting
                            </h1>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Enter your Full Name and Email Address below. Your details will be shared with the meeting host to let you into the call.
                            </p>
                        </div>

                        <form onSubmit={handleCheckInAndJoin} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-gray-300 mb-1">Your Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Sarah Khan"
                                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-300 mb-1">Your Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="e.g. sarah@clientcompany.com"
                                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <UserCheck size={16} />
                                <span>Ask to Join Meeting</span>
                            </button>
                        </form>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                            <button
                                type="button"
                                onClick={() => copyMeetingUrl()}
                                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <Copy size={12} /> Copy Link
                            </button>
                            <Link href="/meet" className="hover:text-white">
                                ← Meet Hub
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── WAITING ROOM LOBBY ───
    if (joinPhase === "waiting" || joinPhase === "rejected") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#070B14] via-[#0F172A] to-[#070B14] text-white flex flex-col justify-center items-center p-4 font-sans">
                <div className="max-w-md w-full bg-[#111827] border border-purple-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                    {joinPhase === "waiting" ? (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mx-auto animate-pulse">
                                <Clock size={30} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                                Waiting for Host Approval
                            </span>
                            <h2 className="text-xl font-extrabold text-white">
                                You are in the Waiting Lobby
                            </h2>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                Your details (<strong className="text-white">{displayName}</strong> • <span className="text-purple-300">{userEmail}</span>) have been recorded and sent to <strong className="text-white">{hostName}</strong>. You will join automatically as soon as the host clicks Admit.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                                <UserX size={30} />
                            </div>
                            <h2 className="text-xl font-extrabold text-white">Entry Request Declined</h2>
                            <p className="text-xs text-gray-400">
                                The host was unable to admit you to this meeting session.
                            </p>
                        </>
                    )}

                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setJoinPhase("prejoin")}
                            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                        >
                            Edit Name / Email
                        </button>
                        <Link
                            href="/meet"
                            className="flex-1 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold"
                        >
                            Leave Lobby
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                        {isHost && (
                            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                Host Controls Active
                            </span>
                        )}
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
                    {waitingPeers.length > 0 && (
                        <button
                            onClick={() => setActiveDrawer("participants")}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 shadow-lg animate-bounce cursor-pointer text-xs"
                        >
                            <UserPlus size={13} />
                            <span>{waitingPeers.length} Waiting in Lobby</span>
                        </button>
                    )}

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
                        <span>Share Link</span>
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </header>

            {/* Floating Host Admission Banner */}
            {waitingPeers.length > 0 && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[94%] bg-[#111827]/95 border-2 border-amber-400/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                            <UserPlus size={15} />
                            Guest Waiting to Join Meeting ({waitingPeers.length})
                        </span>
                        <span className="text-[10px] text-gray-400">Name &amp; Email Recorded</span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {waitingPeers.map((wp) => (
                            <div
                                key={wp.peer_id}
                                className="flex items-center justify-between gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-xs truncate">{wp.name}</div>
                                    <div className="text-[11px] text-purple-300 truncate">{wp.email || "No email"}</div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleHostDecision(wp, "admit")}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md"
                                    >
                                        <UserCheck size={13} /> Admit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleHostDecision(wp, "reject")}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <UserX size={13} /> Deny
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-[#1E293B]/95 border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
                    <Sparkles size={16} className="text-purple-400 shrink-0" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Main Stage & Drawers */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative w-full">
                <div className="flex-1 min-h-0 p-3 sm:p-6 flex flex-col justify-center items-center overflow-y-auto w-full h-full">
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
                                <div className="w-40 h-full bg-[#141C2E] border border-gray-800 rounded-xl relative overflow-hidden shrink-0 shadow-lg">
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
                                    <div key={peer.peer_id} className="w-40 h-full bg-[#141C2E] border border-gray-800 rounded-xl relative overflow-hidden shrink-0 shadow-lg">
                                        <RemoteVideoTile peer={peer} mediaEntry={remoteMedia[peer.peer_id]} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Balanced 16:9 Widescreen Conference Grid */
                        <div
                            className={`w-full max-w-6xl grid grid-cols-1 ${
                                remotePeers.length >= 2 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
                            } gap-4 items-center justify-center my-auto`}
                        >
                            {/* LOCAL VIDEO TILE (16:9 Widescreen) */}
                            <div className="bg-[#141C2E] border border-gray-800 hover:border-gray-700 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group w-full aspect-video max-h-[68vh]">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover object-center absolute inset-0 -scale-x-100 ${
                                        isVideoOff || !hasMediaPermission ? "opacity-0 pointer-events-none" : "opacity-100 z-[2]"
                                    }`}
                                />

                                {(isVideoOff || !hasMediaPermission) && (
                                    <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] flex flex-col items-center justify-center overflow-hidden z-[1]">
                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 border-indigo-400/40">
                                                    {selfInitials}
                                                </div>
                                                <span
                                                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#141C2E] flex items-center justify-center ${
                                                        isMuted ? "bg-rose-500" : "bg-emerald-500"
                                                    }`}
                                                >
                                                    {isMuted ? (
                                                        <MicOff size={11} className="text-white" />
                                                    ) : (
                                                        <Mic size={11} className="text-white" />
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                {isVideoOff ? "Your Camera is Off" : "Camera Ready"}
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
                                    <div className="absolute bottom-3 left-3 z-20 flex items-end gap-1 h-5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.2)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.35)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.25)}px` }} />
                                        <span className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.15)}px` }} />
                                    </div>
                                )}

                                {isHandRaised && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg animate-bounce z-20">
                                        <Hand size={13} />
                                        <span>Hand Raised</span>
                                    </div>
                                )}

                                <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex flex-col items-end text-white font-medium z-20">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{displayName} (You)</span>
                                        {isMuted ? (
                                            <MicOff size={13} className="text-rose-400" />
                                        ) : (
                                            <Mic size={13} className="text-emerald-400" />
                                        )}
                                    </div>
                                    {userEmail && <span className="text-[10px] text-gray-300">{userEmail}</span>}
                                </div>
                            </div>

                            {/* REMOTE WEBRTC PEERS OR SHARE LINK WAITING CARD */}
                            {remotePeers.length > 0 ? (
                                remotePeers.map((peer) => (
                                    <RemoteVideoTile
                                        key={peer.peer_id}
                                        peer={peer}
                                        mediaEntry={remoteMedia[peer.peer_id]}
                                    />
                                ))
                            ) : (
                                <div className="bg-[#141C2E] border border-dashed border-purple-500/30 rounded-2xl md:rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl w-full aspect-video max-h-[68vh]">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                                        <UserPlus size={26} />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">
                                        Share Link to Invite Clients or Team
                                    </h3>
                                    <p className="text-xs text-gray-400 max-w-xs mb-4 leading-relaxed">
                                        When anyone opens your meeting link, BERAXIS records their <strong className="text-white">Full Name &amp; Email</strong> and pops up an <strong className="text-emerald-400">Admit</strong> button so live HD video &amp; audio connect immediately.
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            onClick={() => copyMeetingUrl()}
                                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
                                        >
                                            <Copy size={13} /> Copy Shareable Link
                                        </button>
                                        <button
                                            onClick={() => setActiveDrawer("participants")}
                                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Users size={13} /> Lobby &amp; Guest Log ({attendeeLogs.length})
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
                                {activeDrawer === "participants" && <><Users size={16} className="text-purple-400" /> Lobby &amp; Participants ({totalParticipantsCount})</>}
                                {activeDrawer === "invite" && <><Mail size={16} className="text-purple-400" /> Share &amp; Invite</>}
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
                                <div className="space-y-4">
                                    {waitingPeers.length > 0 && (
                                        <div className="space-y-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                                                <span>Waiting in Lobby ({waitingPeers.length})</span>
                                                <span>Action</span>
                                            </div>
                                            {waitingPeers.map((wp) => (
                                                <div key={wp.peer_id} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white text-xs truncate">{wp.name}</div>
                                                        <div className="text-[10px] text-purple-300 truncate">{wp.email}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleHostDecision(wp, "admit")}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                                                        >
                                                            Admit
                                                        </button>
                                                        <button
                                                            onClick={() => handleHostDecision(wp, "reject")}
                                                            className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[11px] font-bold cursor-pointer"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            In Meeting ({totalParticipantsCount})
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1E293B] border border-white/5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                    {selfInitials}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white text-xs truncate">{displayName} (You)</div>
                                                    <div className="text-[10px] text-gray-400 truncate">{userEmail || "Host"}</div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                                                {isHost ? "Host" : "You"}
                                            </span>
                                        </div>

                                        {remotePeers.map((p) => (
                                            <div key={p.peer_id} className="flex items-center justify-between p-3 rounded-2xl bg-[#1E293B] border border-white/5">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white text-xs truncate">{p.name}</div>
                                                        <div className="text-[10px] text-purple-300 truncate">{p.email || p.role}</div>
                                                    </div>
                                                </div>
                                                {p.is_muted ? <MicOff size={13} className="text-rose-400 shrink-0" /> : <Mic size={13} className="text-emerald-400 shrink-0" />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-gray-800">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                                            <span>Recorded Attendee Log ({attendeeLogs.length})</span>
                                            <span>Status</span>
                                        </div>
                                        {attendeeLogs.length === 0 ? (
                                            <p className="text-[11px] text-gray-500">No external guests recorded yet.</p>
                                        ) : (
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                {attendeeLogs.map((log, i) => (
                                                    <div key={`${log.email}-${i}`} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-2 text-xs">
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-white truncate">{log.name}</div>
                                                            <div className="text-[10px] text-gray-400 truncate">{log.email}</div>
                                                        </div>
                                                        <span
                                                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                                                log.status === "admitted"
                                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                                    : log.status === "waiting"
                                                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                            }`}
                                                        >
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <button
                                            onClick={() => copyMeetingUrl()}
                                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Copy size={14} /> <span>Copy Shareable Client Link</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeDrawer === "invite" && (
                                <form onSubmit={handleSendEmailInvite} className="space-y-4 text-xs">
                                    <p className="text-gray-400 text-[11px] leading-relaxed">
                                        Share the link below with your client or team member. When they open it, BERAXIS records their Name and Email and notifies you to admit them.
                                    </p>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Client / Guest Name</label>
                                        <input
                                            type="text"
                                            value={inviteName}
                                            onChange={(e) => setInviteName(e.target.value)}
                                            placeholder="e.g. Alex Morgan"
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Client / Guest Email *</label>
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
                                        Copy Invite Link &amp; Log Guest
                                    </button>
                                </form>
                            )}

                            {activeDrawer === "settings" && (
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Your Display Name</label>
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
                                    {isHost && (
                                        <div className="p-3 rounded-xl bg-[#1E293B] border border-white/10 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-1.5">
                                                    <Lock size={13} className="text-purple-400" />
                                                    <span>Waiting Room Lobby Gate</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    Require host approval before guests enter
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={requireAdmission}
                                                onChange={async (e) => {
                                                    const next = e.target.checked;
                                                    setRequireAdmission(next);
                                                    await fetch("/api/meet", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            action: "toggle_lobby",
                                                            room_id: meetId,
                                                            require_admission: next,
                                                        }),
                                                    });
                                                }}
                                                className="w-4 h-4 accent-purple-600"
                                            />
                                        </div>
                                    )}
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
                        <span>{signalingStatus === "connected" ? "Live WebRTC Room Active" : "Local Mode"}</span>
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
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer relative ${
                            activeDrawer === "participants" ? "bg-purple-600 border-purple-500 text-white" : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                    >
                        <Users size={16} />
                        {waitingPeers.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                                {waitingPeers.length}
                            </span>
                        )}
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

            {showInstantModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                    <Zap size={20} className="text-purple-400 fill-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Instant Video Meeting Link</h3>
                                    <p className="text-xs text-gray-400">Share this link to invite any client or team member</p>
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
                            <a href={`${instantGeneratedLink}?host=1`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 text-center">
                                <span>Launch Room</span> <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
