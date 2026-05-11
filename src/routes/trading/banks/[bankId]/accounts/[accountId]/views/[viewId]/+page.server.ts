import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	throw redirect(
		302,
		`/trading/banks/${encodeURIComponent(params.bankId)}/accounts/${encodeURIComponent(params.accountId)}/views/${encodeURIComponent(params.viewId)}/offers`
	);
};
