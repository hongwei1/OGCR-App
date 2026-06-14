import type { PageServerLoad } from './$types';
import { OBPRequestError } from '$lib/obp/errors';
import { getOperatorsForUserId } from '$lib/marketplace/ownership';

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	const accessToken = session.data.oauth?.access_token;
	const userId = session.data.user?.user_id ?? null;

	if (!accessToken) {
		return { isAuthenticated: false, operators: [], error: null };
	}

	try {
		const operators = await getOperatorsForUserId(accessToken, userId);
		return { isAuthenticated: true, userId, operators, error: null };
	} catch (error) {
		if (error instanceof OBPRequestError) {
			return {
				isAuthenticated: true,
				userId,
				operators: [],
				error: error.message,
				errorDetails: error.toJSON()
			};
		}
		const message = error instanceof Error ? error.message : 'Unknown error';
		return { isAuthenticated: true, userId, operators: [], error: message };
	}
};
