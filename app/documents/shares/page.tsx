"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { FileText, Share2, Link, Clock, Globe } from "lucide-react";

const MENU_ITEMS = [
    { name: "Documents", href: "/documents" },
    { name: "Shares", href: "/documents/shares" },
    { name: "Reporting", href: "/documents/reporting" },
    { name: "Configuration", href: "/documents/configuration" },
];

type Share = {
    id: string;
    document: string;
    type: string;
    recipient: string;
    created: string;
    expires: string;
    downloads: number;
};

const mockShares: Share[] = [
    { id: "SHR/001", document: "Project Proposal.pdf", type: "Public Link", recipient: "Anyone", created: "2025-12-01", expires: "2025-12-31", downloads: 12 },
    { id: "SHR/002", document: "Financial Report Q4.xlsx", type: "Email", recipient: "investors@company.com", created: "2025-12-02", expires: "2025-12-09", downloads: 5 },
    { id: "SHR/003", document: "Office Layout.png", type: "Internal", recipient: "All Employees", created: "2025-11-28", expires: "Never", downloads: 45 },
];

export default function DocumentsSharesPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Documents"
                moduleIcon={<FileText size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search shares..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Shared Links</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockShares.length} active shares</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Share2 size={18} /> New Share
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Document</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Share Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Recipient</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Expires</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Downloads</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockShares.map(share => (
                                <tr key={share.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{share.document}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            {share.type === 'Public Link' ? <Link size={14} /> :
                                                share.type === 'Email' ? <Globe size={14} /> :
                                                    <Share2 size={14} />}
                                            {share.type}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{share.recipient}</td>
                                    <td className="px-4 py-3 text-gray-400">{new Date(share.created).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-gray-400">{share.expires}</td>
                                    <td className="px-4 py-3 text-white font-medium">{share.downloads}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-red-400 hover:text-red-300 text-sm">Revoke</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
