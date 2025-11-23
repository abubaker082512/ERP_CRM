"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const salesData = [
    { month: 'Jan 2025', value: 800 },
    { month: 'Feb 2025', value: 950 },
    { month: 'Mar 2025', value: 1100 },
    { month: 'Apr 2025', value: 1300 },
    { month: 'May 2025', value: 1450 },
    { month: 'Jun 2025', value: 1700 },
    { month: 'Jul 2025', value: 1900 },
    { month: 'Aug 2025', value: 2200 },
    { month: 'Sep 2025', value: 2500 },
    { month: 'Oct 2025', value: 2800 },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div className="bg-surface border-b border-gray-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">Dashboards</h1>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-400">Dashboards</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white">🔔</button>
                    <button className="text-gray-400 hover:text-white">⚙️</button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">A&I IT Innovation PVT LTD</span>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-surface border-r border-gray-700 min-h-screen p-4">
                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Dashboards</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Dashboards
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Configuration
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">SALES</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Sales
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Product
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Point of Sale
button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">CRM</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Leads
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Pipeline
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">FINANCE</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Accounting
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Invoicing
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Benchmark
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">LOGISTICS</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Warehouse Daily Dashboard
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Operation analysis
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Warehouse Metrics
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">SERVICES</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Project
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Timesheets
                        </button>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">HUMAN RESOURCES</h2>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-background text-sm">
                            Payroll
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-surface rounded-lg p-6">
                            <div className="text-gray-400 text-sm mb-2">Quotations</div>
                            <div className="text-3xl font-bold mb-1">189</div>
                            <div className="flex items-center text-sm text-green-400">
                                <TrendingUp size={16} className="mr-1" />
                                +53.7% since last period
                            </div>
                        </div>

                        <div className="bg-surface rounded-lg p-6">
                            <div className="text-gray-400 text-sm mb-2">Orders</div>
                            <div className="text-3xl font-bold mb-1">456</div>
                            <div className="flex items-center text-sm text-green-400">
                                <TrendingUp size={16} className="mr-1" />
                                +32.2% since last period
                            </div>
                        </div>

                        <div className="bg-surface rounded-lg p-6">
                            <div className="text-gray-400 text-sm mb-2">Revenue</div>
                            <div className="text-3xl font-bold mb-1">$491,617</div>
                            <div className="flex items-center text-sm text-green-400">
                                <TrendingUp size={16} className="mr-1" />
                                +24.5% since last period
                            </div>
                        </div>

                        <div className="bg-surface rounded-lg p-6">
                            <div className="text-gray-400 text-sm mb-2">Average Order</div>
                            <div className="text-3xl font-bold mb-1">$6,828</div>
                            <div className="flex items-center text-sm text-green-400">
                                <TrendingUp size={16} className="mr-1" />
                                +31.9% since last period
                            </div>
                        </div>
                    </div>

                    {/* Monthly Sales Chart */}
                    <div className="bg-surface rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-6">Monthly Sales</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151' }}
                                    labelStyle={{ color: '#F8FAFC' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tables */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-surface rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Top Quotations</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3">Salesperson</th>
                                        <th className="pb-3">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3">Acme Corp</td>
                                        <td className="py-3">John Doe</td>
                                        <td className="py-3">$45,000</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3">Tech Solutions</td>
                                        <td className="py-3">Jane Smith</td>
                                        <td className="py-3">$38,500</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3">Global Industries</td>
                                        <td className="py-3">Mike Johnson</td>
                                        <td className="py-3">$32,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-surface rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Top Sales Orders</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3">Salesperson</th>
                                        <th className="pb-3">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3">Enterprise LLC</td>
                                        <td className="py-3">Sarah Williams</td>
                                        <td className="py-3">$52,000</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3">Startup Inc</td>
                                        <td className="py-3">Tom Brown</td>
                                        <td className="py-3">$41,200</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3">Mega Corp</td>
                                        <td className="py-3">Lisa Davis</td>
                                        <td className="py-3">$39,800</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
