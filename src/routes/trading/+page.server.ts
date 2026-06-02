import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { obp_requests } from '$lib/obp/requests';
import { OBPRequestError } from '$lib/obp/errors';
import {
	fetchBanks,
	getCurrentBankField,
	saveCurrentBankField,
	type BankOption
} from '$lib/obp/currentBank';

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	const accessToken = session.data.oauth?.access_token;

	const defaults = {
		bank_id: env.PUBLIC_DEFAULT_BANK_ID ?? '',
		account_id: env.PUBLIC_DEFAULT_ACCOUNT_ID ?? '',
		view_id: env.PUBLIC_DEFAULT_VIEW_ID ?? 'owner'
	};

	if (!accessToken) {
		return {
			isAuthenticated: false,
			defaults,
			accounts: null,
			banks: [] as BankOption[],
			currentBankId: '',
			error: null
		};
	}

	// Fetch banks and the stored current bank in parallel. Either may fail
	// independently without blocking the accounts list below.
	const [banks, current] = await Promise.all([
		fetchBanks(accessToken).catch(() => [] as BankOption[]),
		getCurrentBankField(accessToken).catch(() => ({ bankId: null, attributeId: null }))
	]);

	// Selection precedence: stored CURRENT_BANK_ID -> env default -> first bank.
	const currentBankId =
		current.bankId || defaults.bank_id || (banks.length > 0 ? banks[0].bank_id : '');

	try {
		const response = await obp_requests.get('/obp/v3.0.0/my/accounts', accessToken);
		const accounts = response.accounts ?? [];
		return {
			isAuthenticated: true,
			defaults: { ...defaults, bank_id: currentBankId || defaults.bank_id },
			accounts,
			banks,
			currentBankId,
			error: null
		};
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				defaults: { ...defaults, bank_id: currentBankId || defaults.bank_id },
				accounts: null,
				banks,
				currentBankId,
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return {
			isAuthenticated: true,
			defaults: { ...defaults, bank_id: currentBankId || defaults.bank_id },
			accounts: null,
			banks,
			currentBankId,
			error: errorMessage
		};
	}
};

export const actions: Actions = {
	setBank: async ({ request, locals }) => {
		const session = locals.session;
		const accessToken = session.data.oauth?.access_token;

		if (!accessToken) {
			return { success: false, error: 'Not authenticated' };
		}

		const formData = await request.formData();
		const bankId = (formData.get('bank_id') as string)?.trim() ?? '';

		if (!bankId) {
			return { success: false, error: 'No bank selected' };
		}

		try {
			// Re-read the field to get the current attribute id, so we update
			// rather than duplicate it (and avoid trusting a stale hidden value).
			const { attributeId } = await getCurrentBankField(accessToken);
			await saveCurrentBankField(accessToken, bankId, attributeId);
			return { success: true, currentBankId: bankId };
		} catch (error) {
			if (error instanceof OBPRequestError) {
				return { success: false, error: error.message, errorDetails: error.toJSON() };
			}
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return { success: false, error: errorMessage };
		}
	}
};
