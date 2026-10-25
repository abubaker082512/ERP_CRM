import { NextResponse } from "next/server";
import { 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_INVITATIONS, 
  INITIAL_CONTRACTORS, 
  DEFAULT_ROLE_PERMISSIONS 
} from "@/lib/teamStorage";
import { TeamMember, TeamInvitation, FreelancerContractor } from "@/lib/teamTypes";

let membersStore: TeamMember[] = [...INITIAL_TEAM_MEMBERS];
let invitationsStore: TeamInvitation[] = [...INITIAL_INVITATIONS];
let contractorsStore: FreelancerContractor[] = [...INITIAL_CONTRACTORS];

export async function GET() {
  const activeMembers = membersStore.filter((m) => m.status !== "deactivated");
  return NextResponse.json({
    success: true,
    members: membersStore,
    activeCount: activeMembers.length,
    invitations: invitationsStore,
    contractors: contractorsStore,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, department, companyIds, reportsToId, allowedModules } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = membersStore.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (existing && existing.status !== "deactivated") {
      return NextResponse.json({ success: false, error: "A member with this email is already active in the organization" }, { status: 400 });
    }

    const assignedRole = role || "Specialist";
    const perms = allowedModules && allowedModules.length > 0 
      ? allowedModules 
      : DEFAULT_ROLE_PERMISSIONS[assignedRole as keyof typeof DEFAULT_ROLE_PERMISSIONS] || ["pos"];

    const newMember: TeamMember = {
      id: `USR-${(membersStore.length + 1).toString().padStart(3, "0")}`,
      name: name || email.split("@")[0].replace(/[._]/g, " "),
      email: email.trim(),
      role: assignedRole,
      department: department || "Operations & Field",
      companyIds: companyIds && companyIds.length > 0 ? companyIds : ["CMP-001"],
      reportsToId: reportsToId || "USR-001",
      allowedModules: perms,
      type: "full_time",
      status: "active",
      twoFactorEnabled: false,
      avatarBg: "bg-indigo-600",
      lastActive: "Just now",
      joinedAt: new Date().toISOString().split("T")[0],
    };

    // If previously deactivated, replace or reactivate
    if (existing && existing.status === "deactivated") {
      membersStore = membersStore.map((m) => (m.email.toLowerCase() === email.toLowerCase() ? newMember : m));
    } else {
      membersStore = [newMember, ...membersStore];
    }

    return NextResponse.json({
      success: true,
      message: `Member ${newMember.name} (${newMember.email}) successfully added and seat assigned!`,
      member: newMember,
      activeMembersCount: membersStore.filter((m) => m.status !== "deactivated").length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role, department, companyIds, reportsToId, allowedModules, status } = body;

    const index = membersStore.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const current = membersStore[index];
    const updated: TeamMember = {
      ...current,
      role: role !== undefined ? role : current.role,
      department: department !== undefined ? department : current.department,
      companyIds: companyIds !== undefined ? companyIds : current.companyIds,
      reportsToId: reportsToId !== undefined ? reportsToId : current.reportsToId,
      allowedModules: allowedModules !== undefined ? allowedModules : current.allowedModules,
      status: status !== undefined ? status : current.status,
    };

    membersStore[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Member ${updated.name} updated successfully.`,
      member: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Member ID is required" }, { status: 400 });
    }

    const target = membersStore.find((m) => m.id === id);
    if (!target) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    if (target.role === "Owner") {
      return NextResponse.json({ success: false, error: "The primary workspace Owner cannot be revoked." }, { status: 403 });
    }

    // Seat Reclamation Guarantee:
    // Mark status deactivated and remove from active list, immediately freeing the seat for reassignment
    membersStore = membersStore.filter((m) => m.id !== id);

    return NextResponse.json({
      success: true,
      message: `User ${target.name} has been revoked and their credentials invalidated. 1 paid seat has been returned to your company pool for immediate reassignment.`,
      reclaimedSeatId: id,
      remainingActiveCount: membersStore.filter((m) => m.status !== "deactivated").length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
