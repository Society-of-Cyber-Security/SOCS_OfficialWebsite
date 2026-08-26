export type TeamMember = {
  id?: string;
  _id?: string;
  slug: string;
  name: string;
  role: string;
  skills: string[];
  image?: string;
  github?: string;
  linkedin?: string;
  email?: string;
  tier: "core" | "lead" | "member" | "mentor";
};

// Dummy data removed. Team members are now fetched from the database via /api/team
export const teamMembers: TeamMember[] = [];
