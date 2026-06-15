import { useState, useEffect, useRef } from 'react';

export interface UseAntigravityVoiceReturn {
    status: 'idle' | 'connecting' | 'recording' | 'processing' | 'speaking' | 'error';
    transcript: string;
    requiresApproval: boolean;
    codeSnippet: string;
    error: string | null;
    startRecording: () => void;
    stopRecording: () => void;
    sendTextCommand: (text: string) => void;
    executeSnippet: () => Promise<void>;
    declineSnippet: () => void;
    resetState: () => void;
}

export function useAntigravityVoice(): UseAntigravityVoiceReturn {
    const [status, setStatus] = useState<UseAntigravityVoiceReturn['status']>('idle');
    const [transcript, setTranscript] = useState<string>('');
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [codeSnippet, setCodeSnippet] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // Initialize/clean WebSocket connection
    const connectWS = (): WebSocket => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            return socketRef.current;
        }

        setStatus('connecting');
        
        // Resolve backend URL
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
        const wsUrl = apiBase.replace('http://', 'ws://').replace('https://', 'wss://') + '/antigravity/ws';

        // Retrieve auth token
        let token = localStorage.getItem('token') || '';
        if (!token) {
            const authData = localStorage.getItem('auth_data');
            if (authData) {
                try {
                    const parsed = JSON.parse(authData);
                    token = parsed.access_token || '';
                } catch {
                    // ignore
                }
            }
        }

        const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] Antigravity connection opened.');
            setStatus('idle');
            setError(null);
        };

        ws.onmessage = async (event) => {
            // Check if binary data (audio playback)
            if (event.data instanceof Blob) {
                console.log('[WS] Received audio blob. Playing...');
                setStatus('speaking');
                
                try {
                    const audioUrl = URL.createObjectURL(event.data);
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.pause();
                    }
                    const audio = new Audio(audioUrl);
                    audioPlayerRef.current = audio;
                    audio.onended = () => {
                        setStatus('idle');
                    };
                    await audio.play();
                } catch (e) {
                    console.error('Audio playback failed', e);
                    setStatus('idle');
                }
                return;
            }

            // Parse text updates
            try {
                const payload = JSON.parse(event.data);
                console.log('[WS] Received payload:', payload);

                if (payload.text_payload) {
                    setTranscript(payload.text_payload);
                }
                
                if (payload.requires_approval) {
                    setRequiresApproval(true);
                    setCodeSnippet(payload.code || '');
                    setStatus('idle');
                } else if (payload.code) {
                    setCodeSnippet(payload.code);
                } else {
                    // Set processing or speaking state
                    setStatus(payload.requires_approval ? 'idle' : 'processing');
                }
            } catch (e) {
                console.error('[WS] JSON parse failed:', e);
            }
        };

        ws.onerror = (e) => {
            console.error('[WS] Connection error:', e);
            setError('WebSocket connection error.');
            setStatus('error');
        };

        ws.onclose = () => {
            console.log('[WS] Antigravity connection closed.');
            if (status !== 'error') {
                setStatus('idle');
            }
        };

        return ws;
    };

    const disconnectWS = () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            disconnectWS();
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
        };
    }, []);

    const startRecording = async () => {
        setError(null);
        setTranscript('');
        setRequiresApproval(false);
        setCodeSnippet('');
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            
            // Connect socket if closed
            connectWS();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                setStatus('processing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                
                // Stream full voice input once stopped
                const ws = connectWS();
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(audioBlob);
                } else {
                    // Send fallback text prompt if socket not ready
                    ws.onopen = () => {
                        ws.send(audioBlob);
                    };
                }
                
                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            mediaRecorder.start();
            setStatus('recording');
        } catch (err: any) {
            console.error('Failed to access microphone:', err);
            setError(err.message || 'Microphone access denied');
            setStatus('error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const sendTextCommand = (text: string) => {
        setError(null);
        setTranscript('');
        setRequiresApproval(false);
        setCodeSnippet('');
        setStatus('processing');

        const ws = connectWS();
        const payload = JSON.stringify({ type: 'text', text });

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        } else {
            const tempListener = () => {
                ws.send(payload);
                ws.removeEventListener('open', tempListener);
            };
            ws.addEventListener('open', tempListener);
        }
    };

    const executeSnippet = async () => {
        if (!codeSnippet) return;
        setStatus('processing');
        setError(null);

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
        let token = localStorage.getItem('token') || '';
        
        try {
            const response = await fetch(`${apiBase}/antigravity/execute-snippet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: codeSnippet })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                setTranscript(`Execution Output:\n${data.output}`);
                setRequiresApproval(false);
                setCodeSnippet('');
                setStatus('idle');
            } else {
                setError(data.error || 'Execution failed');
                setStatus('error');
            }
        } catch (err: any) {
            setError(err.message || 'Network error executing code');
            setStatus('error');
        }
    };

    const declineSnippet = () => {
        setRequiresApproval(false);
        setCodeSnippet('');
        setTranscript('Execution declined.');
        setStatus('idle');
    };

    const resetState = () => {
        setStatus('idle');
        setTranscript('');
        setRequiresApproval(false);
        setCodeSnippet('');
        setError(null);
    };

    return {
        status,
        transcript,
        requiresApproval,
        codeSnippet,
        error,
        startRecording,
        stopRecording,
        sendTextCommand,
        executeSnippet,
        declineSnippet,
        resetState
    };
}
