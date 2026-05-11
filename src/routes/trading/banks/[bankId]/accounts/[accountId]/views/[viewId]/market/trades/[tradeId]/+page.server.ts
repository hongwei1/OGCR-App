import type { PageServerLoad } from './$types';
import { obp_requests } from '$lib/obp/requests';
import { OBPRequestError } from '$lib/obp/errors';
import { tradingPaths } from '$lib/obp/trading';

export const load: PageServerLoad = async ({ locals, params }) => {
	const accessToken = locals.session.data.oauth?.access_token;
	if (!accessToken) {
		return { isAuthenticated: false, trade: null, error: null };
	}

	const ctx = {
		bankId: params.bankId,
		accountId: params.accountId,
		viewId: params.viewId
	};

	try {
		const response = await obp_requests.get(tradingPaths.trade(ctx, params.tradeId), accessToken);
		return { isAuthenticated: true, trade: response, error: null };
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				trade: null,
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return { isAuthenticated: true, trade: null, error: errorMessage };
	}
};
