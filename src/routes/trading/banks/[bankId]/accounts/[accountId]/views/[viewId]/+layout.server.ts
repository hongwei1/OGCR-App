import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const session = locals.session;
	const accessToken = session.data.oauth?.access_token;

	return {
		isAuthenticated: !!accessToken,
		ctx: {
			bankId: params.bankId,
			accountId: params.accountId,
			viewId: params.viewId
		}
	};
};
