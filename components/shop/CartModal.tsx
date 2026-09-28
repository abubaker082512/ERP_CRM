"use client";

import { X, Trash2, ShoppingBag, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
};

export default function CartModal({ 
    isOpen, 
    onClose, 
    items, 
    updateQuantity, 
    removeItem 
}: { 
    isOpen: boolean, 
    onClose: () => void,
    items: CartItem[],
    updateQuantity: (id: string, qty: number) => void,
    removeItem: (id: string) => void
}) {
    const router = useRouter();
    if (!isOpen) return null;

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0F172A] border-l border-gray-700 shadow-2xl h-full flex flex-col animate-in slide-in-from-right-full duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-purple-500" size={24} /> 
                        Your Cart
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <ShoppingBag size={64} className="opacity-20" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <button onClick={onClose} className="text-purple-400 hover:text-purple-300 font-medium">Continue Shopping</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-[#1E293B] rounded-lg border border-gray-800">
                                <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <Package size={24} className="text-gray-600" /> /* Fallback icon conceptually */
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-200 text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-purple-400 font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-[#0F172A] rounded border border-gray-700 overflow-hidden">
                                            <button 
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-800"
                                            >-</button>
                                            <span className="px-2 py-1 text-xs font-medium text-white w-8 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-800"
                                            >+</button>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-800 bg-[#1E293B]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400 font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-6">Taxes and shipping calculated at checkout</p>
                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
