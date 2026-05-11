import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { obp_requests } from '$lib/obp/requests';
import { OBPRequestError } from '$lib/obp/errors';

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	const accessToken = session.data.oauth?.access_token;

	const defaults = {
		bank_id: env.PUBLIC_DEFAULT_BANK_ID ?? '',
		account_id: env.PUBLIC_DEFAULT_ACCOUNT_ID ?? '',
		view_id: env.PUBLIC_DEFAULT_VIEW_ID ?? 'owner'
	};

	if (!accessToken) {
		return { isAuthenticated: false, defaults, accounts: null, error: null };
	}

	try {
		const response = await obp_requests.get('/obp/v3.0.0/my/accounts', accessToken);
		const accounts = response.accounts ?? [];
		return { isAuthenticated: true, defaults, accounts, error: null };
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				defaults,
				accounts: null,
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return { isAuthenticated: true, defaults, accounts: null, error: errorMessage };
	}
};
