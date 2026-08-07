/**
 * Org-membership role vocabulary — the client mirror of
 * `organization_members.role` and of what `is_org_admin` treats as a
 * writer (owner/admin, with the platform admin bypassing entirely).
 * Pure module: rankings and predicates only, no data access.
 */

export const ORG_MEMBER_ROLES = ['viewer', 'member', 'manager', 'admin', 'owner'] as const
export type OrgMemberRole = (typeof ORG_MEMBER_ROLES)[number]

const RANK: Record<OrgMemberRole, number> = {
  viewer: 0,
  member: 1,
  manager: 2,
  admin: 3,
  owner: 4,
}

export function isOrgMemberRole(value: unknown): value is OrgMemberRole {
  return typeof value === 'string' && value in RANK
}

/** True when `role` sits at or above `min` in the vocabulary's ordering. */
export function roleAtLeast(role: OrgMemberRole | null, min: OrgMemberRole): boolean {
  if (role === null) return false
  return RANK[role] >= RANK[min]
}

/** The roles RLS's `is_org_admin` accepts as writers. */
export function isAdminRole(role: OrgMemberRole | null): boolean {
  return roleAtLeast(role, 'admin')
}
