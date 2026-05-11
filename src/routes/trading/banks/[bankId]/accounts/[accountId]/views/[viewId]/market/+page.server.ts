import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const accessToken = locals.session.data.oauth?.access_token;
	return { isAuthenticated: !!accessToken };
};
