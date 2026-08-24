// Mocked assigned-client data for the Marketing Team workspace switcher.
// Swap for a real `/marketing-team/clients` API call once the backend exists.
export const MOCK_CLIENTS = [
  { id: "nike", name: "Nike", activeCampaigns: 2, scheduledPosts: 6 },
  { id: "samsung", name: "Samsung", activeCampaigns: 1, scheduledPosts: 3 },
  { id: "swiggy", name: "Swiggy", activeCampaigns: 3, scheduledPosts: 9 },
];

export function getMockClient(id: string) {
  return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
}
