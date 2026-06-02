import { obp_requests } from '$lib/obp/requests';

/**
 * Server-side helpers for the user's "current bank" selection.
 *
 * The current bank is persisted in OBP as a personal data field (user attribute)
 * named CURRENT_BANK_ID. This mirrors how the OBP Portal and API Manager store it,
 * so the selection is shared across all three apps for a given user.
 *
 * Unlike the Portal (which calls OBP from the browser via a /proxy route), OGCR-App
 * talks to OBP server-side with the session's access token, so these run in load
 * functions and form actions.
 */

export const CURRENT_BANK_FIELD = 'CURRENT_BANK_ID';

export interface BankOption {
	bank_id: string;
	bank_code?: string;
	short_name?: string;
	full_name?: string;
}

interface PersonalDataField {
	user_attribute_id: string;
	name: string;
	value: string;
	type?: string;
}

/**
 * Fetch the list of banks, normalised and sorted by bank_id.
 *
 * Uses /obp/v6.0.0/banks because that version returns `bank_id` and `bank_code`
 * (v7.0.0 renamed `bank_id` -> `id` and dropped `bank_code`). We still defensively
 * fall back to `id` so a future version bump won't silently produce empty options.
 */
export async function fetchBanks(accessToken: string): Promise<BankOption[]> {
	const response = await obp_requests.get('/obp/v6.0.0/banks', accessToken);
	return ((response.banks ?? []) as Record<string, string>[])
		.map((b) => ({
			bank_id: b.bank_id ?? b.id,
			bank_code: b.bank_code,
			short_name: b.short_name,
			full_name: b.full_name
		}))
		.filter((b) => b.bank_id != null)
		.sort((a, b) => a.bank_id.localeCompare(b.bank_id));
}

/**
 * Read the user's stored CURRENT_BANK_ID personal data field.
 * Returns the bank id and the attribute id (needed to update it later).
 */
export async function getCurrentBankField(
	accessToken: string
): Promise<{ bankId: string | null; attributeId: string | null }> {
	const response = await obp_requests.get('/obp/v6.0.0/my/personal-data-fields', accessToken);
	const attrs = (response.user_attributes ?? []) as PersonalDataField[];
	const attr = attrs.find((a) => a.name === CURRENT_BANK_FIELD);
	return {
		bankId: attr?.value || null,
		attributeId: attr?.user_attribute_id || null
	};
}

/**
 * Persist the user's CURRENT_BANK_ID. Updates the existing field if present,
 * otherwise creates it. Returns the (possibly newly created) attribute id.
 */
export async function saveCurrentBankField(
	accessToken: string,
	bankId: string,
	attributeId: string | null
): Promise<string | null> {
	const body = { name: CURRENT_BANK_FIELD, value: bankId, type: 'STRING' };

	if (attributeId) {
		await obp_requests.put(
			`/obp/v6.0.0/my/personal-data-fields/${encodeURIComponent(attributeId)}`,
			body,
			accessToken
		);
		return attributeId;
	}

	const response = await obp_requests.post('/obp/v6.0.0/my/personal-data-fields', body, accessToken);
	return response?.user_attribute_id ?? null;
}
