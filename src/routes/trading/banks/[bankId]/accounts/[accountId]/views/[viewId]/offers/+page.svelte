<script lang="ts">
	import type { PageData } from './$types';
	import { Tag, RefreshCw, ChevronRight, Plus, Copy, Check } from '@lucide/svelte';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	let copied = $state(false);

	const basePath = $derived(page.url.pathname);
	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);

	async function copyErrorDetails() {
		if (!data.errorDetails) return;
		const errorText = `API Request:\n${JSON.stringify(data.errorDetails.request, null, 2)}\n\nAPI Response:\n${JSON.stringify(data.errorDetails.response, null, 2)}`;
		await navigator.clipboard.writeText(errorText);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex items-center justify-between mb-6">
	<h2 class="h2">Trading Offers</h2>
	{#if data.isAuthenticated}
		<div class="flex gap-2">
			<a href="{ctxBase}/offers/create" class="btn preset-filled-primary-500">
				<Plus class="size-4" />
				<span>Create Offer</span>
			</a>
			<a href={basePath} class="btn preset-outlined-primary-500">
				<RefreshCw class="size-4" />
				<span>Refresh</span>
			</a>
		</div>
	{/if}
</div>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<Tag class="size-16 mx-auto mb-4 text-surface-400" />
		<h2 class="h3 mb-2">Authentication Required</h2>
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else if data.error}
	<div class="card p-8 preset-filled-surface-100-900">
		<div class="flex items-center justify-between mb-4">
			<h2 class="h3 text-error-500">Error Loading Offers</h2>
			{#if data.errorDetails}
				<button
					onclick={copyErrorDetails}
					class="btn preset-outlined-surface-500 btn-sm"
					title="Copy error details"
				>
					{#if copied}
						<Check class="size-4 text-success-500" />
						<span>Copied</span>
					{:else}
						<Copy class="size-4" />
						<span>Copy</span>
					{/if}
				</button>
			{/if}
		</div>

		{#if data.errorDetails}
			<div class="space-y-4">
				<div>
					<p class="text-surface-600-400 mb-2 font-semibold">API Request:</p>
					<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(data.errorDetails.request, null, 2)}</pre>
				</div>
				<div>
					<p class="text-surface-600-400 mb-2 font-semibold">API Response:</p>
					<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(data.errorDetails.response, null, 2)}</pre>
				</div>
			</div>
		{:else}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{data.error}</pre>
		{/if}
	</div>
{:else if data.offers && data.offers.length === 0}
	<div class="card p-8 preset-filled-surface-100-900">
		<h2 class="h3 mb-2">No Offers Found</h2>
		<p class="text-surface-600-400 mb-4">No trading offers exist for this account yet.</p>
		<a href="{ctxBase}/offers/create" class="btn preset-filled-primary-500">
			<Plus class="size-4" />
			<span>Create First Offer</span>
		</a>
	</div>
{:else if data.offers}
	<details class="mb-4">
		<summary class="cursor-pointer text-sm text-surface-600-400">Debug: Raw API Response</summary>
		<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-xs mt-2">{JSON.stringify(data.rawResponse, null, 2)}</pre>
	</details>

	<div class="grid gap-4">
		{#each data.offers as offer}
			<div class="card p-6 preset-filled-surface-100-900 hover:preset-tonal transition-colors">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="h4">
							<a
								href="{ctxBase}/offers/{offer.offer_id}"
								class="text-primary-500 hover:underline"
							>
								{offer.offer_details?.offer_type ?? '?'}
								{offer.offer_details?.asset_amount ?? '?'}
								{offer.offer_details?.asset_code ?? '?'}
							</a>
						</h3>
						<div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-surface-600-400">
							<span>
								@ {offer.offer_details?.price_amount}
								{offer.offer_details?.price_currency}
							</span>
							{#if offer.status}
								<span>Status: <strong>{offer.status}</strong></span>
							{/if}
							<span>ID: {offer.offer_id}</span>
						</div>
					</div>
					<a
						href="{ctxBase}/offers/{offer.offer_id}"
						class="btn preset-outlined-primary-500"
					>
						<span>View Details</span>
						<ChevronRight class="size-4" />
					</a>
				</div>
			</div>
		{/each}
	</div>
{/if}
