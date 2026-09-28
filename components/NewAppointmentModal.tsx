"use client";
import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, AlignLeft } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function NewAppointmentModal({ isOpen, onClose, onSuccess }: ModalProps) {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        start_time: '',
        end_time: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchAPI('/appointments/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email || undefined,
                    start_time: new Date(formData.start_time).toISOString(),
                    end_time: new Date(formData.end_time).toISOString(),
                    notes: formData.notes || undefined,
                })
            });
            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                console.error("Failed to create appointment", await res.text());
            }
        } catch (error) {
            console.error("Error creating appointment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1E293B] rounded-lg shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">New Appointment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                            <User size={16} /> Customer Name
                        </label>
                        <input type="text" required value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})}
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                            <User size={16} /> Customer Email (Optional)
                        </label>
                        <input type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})}
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                                <Clock size={16} /> Start Time
                            </label>
                            <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                                <Clock size={16} /> End Time
                            </label>
                            <input type="datetime-local" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none [color-scheme:dark]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                            <AlignLeft size={16} /> Notes
                        </label>
                        <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none" />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
