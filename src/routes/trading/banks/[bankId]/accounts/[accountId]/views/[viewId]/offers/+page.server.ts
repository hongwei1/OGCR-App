import type { PageServerLoad } from './$types';
import { obp_requests } from '$lib/obp/requests';
import { OBPRequestError } from '$lib/obp/errors';
import { tradingPaths } from '$lib/obp/trading';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = locals.session;
	const accessToken = session.data.oauth?.access_token;

	if (!accessToken) {
		return { isAuthenticated: false, offers: null, error: null };
	}

	const ctx = {
		bankId: params.bankId,
		accountId: params.accountId,
		viewId: params.viewId
	};

	try {
		const response = await obp_requests.get(tradingPaths.offers(ctx), accessToken);
		const offers = response.offers ?? [];
		return { isAuthenticated: true, offers, rawResponse: response, error: null };
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				offers: null,
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return { isAuthenticated: true, offers: null, error: errorMessage };
	}
};
