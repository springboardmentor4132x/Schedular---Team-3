import { create } from "zustand";

export interface TeamAssignment {
  id: string;
  businessOwnerName: string;
  businessOwnerEmail: string;
  assignedAt: string;
}

export interface MarketingTeamGroup {
  teamId: string;
  teamName: string;
  assignments: TeamAssignment[];
}

const INITIAL_GROUPS: MarketingTeamGroup[] = [
  {
    teamId: "team-1",
    teamName: "Nova Digital",
    assignments: [
      { id: "a1", businessOwnerName: "Nike Marketing Co.", businessOwnerEmail: "nike.ops@gmail.com", assignedAt: "2026-02-12" },
      { id: "a2", businessOwnerName: "Samsung India", businessOwnerEmail: "samsung.social@gmail.com", assignedAt: "2026-02-19" },
      { id: "a3", businessOwnerName: "Swiggy", businessOwnerEmail: "swiggy.growth@gmail.com", assignedAt: "2026-03-03" },
    ],
  },
  { teamId: "team-2", teamName: "Brightpath Marketing", assignments: [] },
  { teamId: "team-3", teamName: "Fieldnote Agency", assignments: [] },
];

interface TeamAssignmentsState {
  groups: MarketingTeamGroup[];
  removeAssignment: (teamId: string, assignmentId: string) => void;
}

export const useTeamAssignmentsStore = create<TeamAssignmentsState>((set) => ({
  groups: INITIAL_GROUPS,
  removeAssignment: (teamId, assignmentId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.teamId === teamId ? { ...g, assignments: g.assignments.filter((a) => a.id !== assignmentId) } : g
      ),
    })),
}));
