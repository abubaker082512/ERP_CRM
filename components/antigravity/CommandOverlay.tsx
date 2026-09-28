import React, { useState } from 'react';
import { useAntigravityVoice } from '../../lib/hooks/useAntigravityVoice';
import { Mic, MicOff, Send, X, Play, Code, Check, AlertCircle } from 'lucide-react';

interface CommandOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandOverlay({ isOpen, onClose }: CommandOverlayProps) {
    const {
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
    } = useAntigravityVoice();

    const [textInput, setTextInput] = useState('');

    if (!isOpen) return null;

    const handleSendText = () => {
        if (!textInput.trim()) return;
        sendTextCommand(textInput);
        setTextInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendText();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            {/* Sliding Panel */}
            <div className="relative w-full max-w-lg h-[90vh] bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 animate-slide-in">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛸</span>
                        <div>
                            <h2 className="text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400">
                                ANTIGRAVITY CO-PILOT
                            </h2>
                            <p className="text-xs text-slate-400">Macro/Micro-Brain Hybrid Intelligence</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { resetState(); onClose(); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
                    
                    {/* Status Log & Response Box */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 min-h-[150px] flex flex-col justify-between shadow-inner">
                            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Response Log
                            </span>
                            
                            <div className="mt-3 flex-1 flex flex-col justify-center">
                                {status === 'connecting' && (
                                    <p className="text-sm text-slate-400 animate-pulse">Establishing secure link...</p>
                                )}
                                {status === 'idle' && !transcript && (
                                    <p className="text-sm text-slate-500 italic">Say something like "Draft a lead activity analysis" or type a command below.</p>
                                )}
                                {transcript && (
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                                        {transcript}
                                    </div>
                                )}
                                {status === 'processing' && (
                                    <div className="flex flex-col gap-2 items-center justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs text-purple-400">Thinking...</p>
                                    </div>
                                )}
                                {status === 'speaking' && (
                                    <div className="flex gap-1 justify-center items-center h-10">
                                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-4 delay-75"></span>
                                        <span className="w-1 bg-purple-500 rounded-full animate-bounce h-6 delay-150"></span>
                                        <span className="w-1 bg-sky-500 rounded-full animate-bounce h-8 delay-200"></span>
                                        <span className="w-1 bg-purple-500 rounded-full animate-bounce h-6 delay-150"></span>
                                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-4 delay-75"></span>
                                    </div>
                                )}
                            </div>

                            {/* Waveforms during recording */}
                            {status === 'recording' && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <div className="flex gap-1.5 justify-center items-center h-8">
                                        <span className="w-1 bg-sky-400 rounded-full animate-pulse h-4"></span>
                                        <span className="w-1 bg-purple-400 rounded-full animate-pulse h-7"></span>
                                        <span className="w-1 bg-pink-400 rounded-full animate-pulse h-10"></span>
                                        <span className="w-1 bg-purple-400 rounded-full animate-pulse h-7"></span>
                                        <span className="w-1 bg-sky-400 rounded-full animate-pulse h-4"></span>
                                    </div>
                                    <span className="text-[10px] text-sky-400 animate-pulse tracking-wide font-medium">LISTENING</span>
                                </div>
                            )}
                        </div>

                        {/* Errors */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Interactive E2B Execution Sandbox Confirmation Panel */}
                        {requiresApproval && (
                            <div className="bg-slate-950/80 border border-purple-500/50 rounded-xl p-5 space-y-4 shadow-xl animate-fade-in">
                                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                                    <Code className="w-4 h-4" />
                                    <span>Review Generated Automation Code</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    This script will execute inside your isolated workspace sandbox respecting all tenant data constraints.
                                </p>
                                
                                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs font-mono overflow-x-auto text-emerald-400 max-h-[180px]">
                                    <code>{codeSnippet}</code>
                                </pre>

                                <div className="flex gap-3">
                                    <button
                                        onClick={executeSnippet}
                                        className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-900/30"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve Execution
                                    </button>
                                    <button
                                        onClick={declineSnippet}
                                        className="flex-1 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Microphone Command Controller / Input controls */}
                    <div className="space-y-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/80">
                        <div className="flex justify-center">
                            {status === 'recording' ? (
                                <button
                                    onClick={stopRecording}
                                    className="p-5 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg shadow-red-900/50 animate-pulse transition-all transform hover:scale-105"
                                >
                                    <MicOff className="w-7 h-7" />
                                </button>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    className="p-5 bg-gradient-to-tr from-sky-500 via-purple-500 to-pink-500 hover:opacity-90 rounded-full text-white shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105"
                                >
                                    <Mic className="w-7 h-7" />
                                </button>
                            )}
                        </div>
                        
                        {/* Text command input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a request (e.g. outstanding payments report)"
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-655"
                            />
                            <button
                                onClick={handleSendText}
                                className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl hover:text-sky-400 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
