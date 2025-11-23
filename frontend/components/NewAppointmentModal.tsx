"use client";
import { X, User, Headphones, Utensils, Clock, DollarSign, Armchair } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewAppointmentModal({ isOpen, onClose }: ModalProps) {
    if (!isOpen) return null;

    const presets = [
        { name: 'Meeting', desc: 'Let others book a meeting in your calendar', icon: User },
        { name: 'Video Call', desc: 'Schedule a video meeting in a virtual room', icon: Headphones },
        { name: 'Table Booking', desc: 'Let customers book a table in your restaurant or bar', icon: Utensils },
        { name: 'Book a Resource', desc: 'Let customers book a resource such as a room, a tennis court, etc.', icon: Clock },
        { name: 'Paid Consultation', desc: 'Let customers book a paid slot in your calendar with you', icon: DollarSign },
        { name: 'Paid Seats', desc: 'Let customers book a fee per person for activities such as a theater, etc.', icon: Armchair },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1E293B] rounded-lg shadow-2xl w-full max-w-4xl border border-gray-700 transform transition-all scale-100">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Choose an appointment preset</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {presets.map((preset) => (
                        <div key={preset.name} className="bg-[#0F172A] p-6 rounded border border-gray-700 hover:border-purple-500 cursor-pointer group flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-200 group-hover:text-purple-400 mb-2">{preset.name}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{preset.desc}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                                <preset.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-start">
                    <button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm font-medium shadow-lg shadow-purple-600/20 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
