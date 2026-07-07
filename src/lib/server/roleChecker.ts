// Server-only SITE_MAP: which OBP role(s) each route requires to load real data, mirroring
// the pattern used by OBP-Frontend's api-manager (see roleChecker.ts there). Lives under
// `$lib/server` (not universal) because it needs the entity name constants, which read the
// private `OBP_ENTITY_PREFIX` env var — see `$lib/constants/entities`.
import { ENTITY_ACTIVITY, ENTITY_OPERATOR, ENTITY_USER_OPERATOR_RELATIONSHIP } from '$lib/constants/entities';
import type { PageRoleConfig } from '$lib/utils/roleCheck';

// Role names for system-level dynamic entities are `CanGetDynamicEntity_System<entityName>`, 
// where entityName is exactly the string OBP-API registered the entity under.
export const SITE_MAP: Record<string, PageRoleConfig> = {
	'/activities': {
		required: [{ role: `CanGetDynamicEntity_System${ENTITY_ACTIVITY}` }]
	},
	'/my/operators': {
		required: [
			{ role: `CanGetDynamicEntity_System${ENTITY_OPERATOR}` },
			{ role: `CanGetDynamicEntity_System${ENTITY_USER_OPERATOR_RELATIONSHIP}` }
		],
		requirementType: 'AND'
	}
};

export function getPageRoles(routeId: string | null): PageRoleConfig | undefined {
	if (!routeId) return undefined;
	return SITE_MAP[routeId];
}
