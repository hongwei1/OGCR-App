import { createLogger } from '$lib/utils/logger';
import { redisService } from '$lib/redis/services/RedisService';

const logger = createLogger('MarketplaceListings');

// Marketplace listings are *marketplace-owned* data — the operator's commercial
// terms (price, credits) plus a marketing overlay. They are the marketplace's
// own truth and deliberately NOT written back to the registry activity record:
// the registry is read-only here (see design_goals.md). We key everything by the
// registry `activity_id` and keep all listings in a single Redis hash.
const LISTINGS_HASH = 'ogcr-app:marketplace-listings';

export interface ActivityListing {
	activity_id: string;
	/** The operator that listed this activity (snapshot of activity.operator_id at list time). */
	operator_id: string;
	/** Whether the activity is currently published to the marketplace grid. */
	listed: boolean;

	// --- Marketing overlay (operator-editable presentation) ---
	summary?: string;
	/** Thumbnail image URL. */
	image?: string;
	media_links?: string;
	website?: string;

	// --- Commercial terms (marketplace-owned truth) ---
	price_per_credit?: number;
	credits_available?: number;

	// --- Provenance ---
	listed_by_email?: string;
	created_at?: string;
	updated_at?: string;
}

function client() {
	return redisService.getClient();
}

/** Read the listing overlay for a single activity, or null if it has never been listed. */
export async function getListing(activityId: string): Promise<ActivityListing | null> {
	const raw = await client().hget(LISTINGS_HASH, activityId);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as ActivityListing;
	} catch (error) {
		logger.warn('Failed to parse listing for activity', activityId, error);
		return null;
	}
}

/** Read every listing, keyed by activity_id. Demo-scale: small hash, read in one call. */
export async function getAllListings(): Promise<Map<string, ActivityListing>> {
	const all = await client().hgetall(LISTINGS_HASH);
	const map = new Map<string, ActivityListing>();
	for (const [activityId, raw] of Object.entries(all)) {
		try {
			map.set(activityId, JSON.parse(raw) as ActivityListing);
		} catch (error) {
			logger.warn('Failed to parse listing for activity', activityId, error);
		}
	}
	return map;
}

/**
 * Create or update a listing. Merges over any existing record so partial edits
 * (e.g. just the price) don't wipe other fields, and stamps updated_at.
 */
export async function saveListing(
	activityId: string,
	patch: Partial<ActivityListing> & { operator_id: string }
): Promise<ActivityListing> {
	const existing = await getListing(activityId);
	const now = new Date().toISOString();

	const merged: ActivityListing = {
		listed: true,
		...existing,
		...patch,
		activity_id: activityId,
		created_at: existing?.created_at ?? now,
		updated_at: now
	};

	await client().hset(LISTINGS_HASH, activityId, JSON.stringify(merged));
	logger.debug('Saved listing for activity', activityId);
	return merged;
}
