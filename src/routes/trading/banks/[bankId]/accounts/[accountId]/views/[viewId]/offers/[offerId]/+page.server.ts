import type { Actions, PageServerLoad } from './$types';
import { obp_requests } from '$lib/obp/requests';
import { OBPRequestError } from '$lib/obp/errors';
import { tradingPaths } from '$lib/obp/trading';

export const load: PageServerLoad = async ({ locals, params }) => {
	const accessToken = locals.session.data.oauth?.access_token;
	if (!accessToken) {
		return { isAuthenticated: false, offer: null, error: null };
	}

	const ctx = {
		bankId: params.bankId,
		accountId: params.accountId,
		viewId: params.viewId
	};

	try {
		const response = await obp_requests.get(tradingPaths.offer(ctx, params.offerId), accessToken);
		return { isAuthenticated: true, offer: response, error: null };
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				offer: null,
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return { isAuthenticated: true, offer: null, error: errorMessage };
	}
};

export const actions: Actions = {
	cancel: async ({ locals, params }) => {
		const accessToken = locals.session.data.oauth?.access_token;
		if (!accessToken) {
			return { cancelSuccess: false, cancelError: 'Not authenticated' };
		}

		const ctx = {
			bankId: params.bankId,
			accountId: params.accountId,
			viewId: params.viewId
		};

		try {
			const response = await obp_requests.delete(
				tradingPaths.offer(ctx, params.offerId),
				accessToken
			);
			return { cancelSuccess: true, cancelResponse: response };
		} catch (error) {
			if (error instanceof OBPRequestError) {
				return {
					cancelSuccess: false,
					cancelError: error.message,
					cancelErrorDetails: error.toJSON()
				};
			}
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return { cancelSuccess: false, cancelError: errorMessage };
		}
	}
};
