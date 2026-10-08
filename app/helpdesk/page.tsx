"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { 
  LifeBuoy, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Download, 
  Tag, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Filter,
  UserCheck,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

type TicketPriority = "critical" | "high" | "medium" | "low";
type TicketStage = "new" | "in_progress" | "pending_customer" | "escalated" | "solved";

type TicketMessage = {
  sender: "customer" | "agent";
  author: string;
  time: string;
  text: string;
};

type Ticket = {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  team: string;
  assignedTo: string;
  priority: TicketPriority;
  stage: TicketStage;
  createdAt: string;
  slaDeadline: string;
  isSlaBreached?: boolean;
  tags: string[];
  messages: TicketMessage[];
};

const MENU_ITEMS = [
  { name: "Tickets", href: "/helpdesk" },
  { name: "Support Teams", href: "/helpdesk" },
  { name: "SLA Policies", href: "/helpdesk" },
  { name: "Customer Portal", href: "/helpdesk" },
];

const CANNED_RESPONSES = [
  "Thank you for contacting Beraxis Enterprise Support. We have received your request and our tier-2 engineers are investigating the root cause.",
  "We have verified your account permissions and refreshed your workspace security token. Please log out and back in to verify.",
  "Your billing invoice has been adjusted and the updated PDF statement is now available in your Accounting module.",
  "Our team has deployed a hotfix patch to resolve this unexpected behavior. Kindly let us know if everything is running smoothly."
];

const INITIAL_TICKETS: Ticket[] = [];

const STAGES: { id: TicketStage; label: string; color: string }[] = [
  { id: "new", label: "New Unassigned", color: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { id: "in_progress", label: "In Investigation", color: "border-amber-500 bg-amber-500/10 text-amber-400" },
  { id: "pending_customer", label: "Pending Customer", color: "border-purple-500 bg-purple-500/10 text-purple-400" },
  { id: "escalated", label: "Escalated L2/L3", color: "border-red-500 bg-red-500/10 text-red-400" },
  { id: "solved", label: "Solved & Closed", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
];

const PRIORITY_BADGES: Record<TicketPriority, { label: string; badge: string }> = {
  critical: { label: "P1 Critical", badge: "bg-red-500/20 text-red-400 border border-red-500/40" },
  high: { label: "P2 High", badge: "bg-amber-500/20 text-amber-400 border border-amber-500/40" },
  medium: { label: "P3 Medium", badge: "bg-blue-500/20 text-blue-400 border border-blue-500/40" },
  low: { label: "P4 Low", badge: "bg-gray-500/20 text-gray-400 border border-gray-600" },
};

export default function HelpdeskPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modals
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newTeam, setNewTeam] = useState("Hardware & POS");
  const [newPriority, setNewPriority] = useState<TicketPriority>("high");
  const [newDescription, setNewDescription] = useState("");

  // Entity-scoped data loading
  useEffect(() => {
    if (!activeBranch) return;
    const key = getEntityStorageKey("helpdesk_tickets");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch {
        setTickets([]);
      }
    } else {
      setTickets([]);
    }
  }, [activeBranch?.id]);

  const persistTickets = (updated: Ticket[]) => {
    setTickets(updated);
    try {
      const key = getEntityStorageKey("helpdesk_tickets");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newCustEmail.trim()) return;

    const newTicket: Ticket = {
      id: `TCK-${(4000 + tickets.length + 1).toString()}`,
      subject: newSubject,
      customerName: newCustName || "Corporate Client",
      customerEmail: newCustEmail,
      team: newTeam,
      assignedTo: "Unassigned",
      priority: newPriority,
      stage: "new",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString().replace("T", " ").slice(0, 16),
      tags: [newTeam.split(" ")[0]],
      messages: [
        {
          sender: "customer",
          author: newCustName || "Client",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: newDescription || newSubject
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    persistTickets(updated);
    setIsNewTicketModalOpen(false);
    setNewSubject("");
    setNewCustName("");
    setNewCustEmail("");
    setNewDescription("");
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      sender: "agent",
      author: "Enterprise Agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: replyText
    };

    const updatedTickets = tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, stage: "pending_customer" as TicketStage, messages: [...t.messages, newMsg] } 
        : t
    );

    persistTickets(updatedTickets);
    setSelectedTicket(prev => prev ? { ...prev, stage: "pending_customer", messages: [...prev.messages, newMsg] } : null);
    setReplyText("");
  };

  const handleApplyCanned = (canned: string) => {
    setReplyText(canned);
  };

  const handleUpdateStage = (ticketId: string, stage: TicketStage) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, stage } : t);
    persistTickets(updated);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, stage } : null);
    }
  };

  const exportTicketsCSV = () => {
    const headers = ["Ticket ID", "Subject", "Customer", "Email", "Team", "Priority", "Stage", "Created", "SLA Deadline"];
    const rows = tickets.map(t => [
      t.id,
      `"${t.subject}"`,
      `"${t.customerName}"`,
      t.customerEmail,
      `"${t.team}"`,
      t.priority,
      t.stage,
      t.createdAt,
      t.slaDeadline
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `helpdesk_tickets_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const activeCount = tickets.filter(t => t.stage !== "solved").length;
  const criticalCount = tickets.filter(t => t.priority === "critical" && t.stage !== "solved").length;
  const solvedCount = tickets.filter(t => t.stage === "solved").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <StandardModuleHeader
        moduleName="Helpdesk"
        moduleIcon={<LifeBuoy size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search tickets, customers, issue tags..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Tickets</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{activeCount} Unresolved</h3>
              <p className="text-xs text-gray-400 mt-1">SLA average: 18 mins</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Clock size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-red-500/20 bg-red-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Critical P1</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{criticalCount} Urgent</h3>
              <p className="text-xs text-gray-400 mt-1">Requires immediate attention</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
              <ShieldAlert size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SLA Compliance</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">98.8%</h3>
              <p className="text-xs text-gray-400 mt-1">Target 95.0% SLA met</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Zap size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-teal-500/20 bg-teal-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolved Cases</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">{solvedCount} Solved</h3>
              <p className="text-xs text-gray-400 mt-1">100% CSAT satisfaction</p>
            </div>
            <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Filter & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-3.5 rounded-xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveView("kanban")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeView === "kanban" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Kanban Pipeline
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeView === "list" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                List View
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="bg-gray-900 text-xs text-gray-200 border border-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="critical">P1 Critical</option>
                <option value="high">P2 High</option>
                <option value="medium">P3 Medium</option>
                <option value="low">P4 Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportTicketsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-all active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus size={14} /> Create Support Ticket
            </button>
          </div>
        </div>

        {/* KANBAN VIEW */}
        {activeView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start min-h-[500px]">
            {STAGES.map(stage => {
              const stageTickets = filteredTickets.filter(t => t.stage === stage.id);
              return (
                <div key={stage.id} className="bg-[#111622] rounded-xl border border-gray-800 flex flex-col max-h-[750px]">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between rounded-t-xl bg-gray-900/40">
                    <span className="text-xs font-bold text-gray-200">{stage.label}</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {stageTickets.length}
                    </span>
                  </div>

                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageTickets.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-gray-800/60 rounded-lg">
                        <p className="text-xs text-gray-500">No tickets in queue</p>
                      </div>
                    ) : (
                      stageTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="galaxy-card p-3.5 border border-gray-800 hover:border-purple-500/50 bg-[#161c2d] hover:bg-[#1c243a] transition-all rounded-xl cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300">{ticket.id}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${PRIORITY_BADGES[ticket.priority].badge}`}>
                              {PRIORITY_BADGES[ticket.priority].label}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-2 leading-snug">
                            {ticket.subject}
                          </h4>

                          <div className="mt-2 text-xs text-gray-400 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 font-medium">{ticket.customerName}</span>
                              <span className="text-[10px] text-gray-500">{ticket.team}</span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-amber-400" />
                              <span>SLA: {ticket.slaDeadline.split(" ")[1]}</span>
                            </div>
                            <div className="flex items-center gap-1 text-purple-400 font-semibold">
                              <MessageSquare size={11} />
                              <span>{ticket.messages.length} replies</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {activeView === "list" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SLA Target</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredTickets.map(t => {
                    const stageConfig = STAGES.find(s => s.id === t.stage);
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <td className="px-4 py-3.5 font-bold text-purple-400">{t.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-white max-w-xs truncate">{t.subject}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-300">
                          <div>{t.customerName}</div>
                          <div className="text-gray-500">{t.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{t.team}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_BADGES[t.priority].badge}`}>
                            {PRIORITY_BADGES[t.priority].label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stageConfig?.color}`}>
                            {stageConfig?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-amber-400">{t.slaDeadline}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold"
                          >
                            Open Case
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TICKET DETAIL & REPLY CONVERSATION MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{selectedTicket.id}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${PRIORITY_BADGES[selectedTicket.priority].badge}`}>
                    {PRIORITY_BADGES[selectedTicket.priority].label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-400">
                  Requester: <span className="text-gray-200 font-semibold">{selectedTicket.customerName}</span> ({selectedTicket.customerEmail}) • Team: {selectedTicket.team}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Stage Quick Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-gray-400 shrink-0 mr-1">Stage:</span>
              {STAGES.map(st => (
                <button
                  key={st.id}
                  onClick={() => handleUpdateStage(selectedTicket.id, st.id)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-all shrink-0 ${
                    selectedTicket.stage === st.id
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-3 bg-gray-950/60 p-3.5 rounded-xl border border-gray-800 max-h-[300px]">
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    msg.sender === "agent"
                      ? "bg-purple-950/30 border border-purple-800/40 ml-6 text-purple-100"
                      : "bg-gray-900 border border-gray-800 mr-6 text-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                    <span className={msg.sender === "agent" ? "text-purple-300 font-bold" : "text-blue-300 font-bold"}>
                      {msg.author} ({msg.sender === "agent" ? "Enterprise Support" : "Customer"})
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Canned Quick Replies */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" /> Canned Response Templates
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CANNED_RESPONSES.map((cr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyCanned(cr)}
                    className="text-[10px] bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white px-2.5 py-1 rounded-md border border-gray-800 transition-colors truncate max-w-[280px]"
                  >
                    Template #{idx + 1}: {cr.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <div className="space-y-2">
              <textarea
                rows={3}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response to the customer..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Sending response will email the customer and move status to Pending Customer</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStage(selectedTicket.id, "solved")}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/30 transition-all"
                  >
                    <CheckCircle size={13} className="inline mr-1" /> Mark Resolved
                  </button>
                  <button
                    onClick={handleSendReply}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <Send size={13} /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTicket} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LifeBuoy size={20} className="text-purple-400" /> New Support Ticket
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Issue Subject *</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Brief summary of customer issue..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Assigned Support Team</label>
                <select
                  value={newTeam}
                  onChange={e => setNewTeam(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Hardware & POS">Hardware & POS</option>
                  <option value="Billing & Accounting">Billing & Accounting</option>
                  <option value="Product & Integrations">Product & Integrations</option>
                  <option value="HR & Payroll">HR & Payroll</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="critical">P1 - Critical (System Down)</option>
                  <option value="high">P2 - High Priority</option>
                  <option value="medium">P3 - Medium Priority</option>
                  <option value="low">P4 - Low / Minor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Detailed Description *</label>
              <textarea
                rows={3}
                required
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Details of the problem, steps to reproduce, or user error message..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
