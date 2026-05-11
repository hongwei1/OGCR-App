<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Tag, ArrowLeft, Trash2, Copy, Check } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let copied = $state(false);

	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);

	const offerDetails = $derived(data.offer?.offer_details ?? {});

	async function copyErrorDetails(details: any) {
		if (!details) return;
		const errorText = `API Request:\n${JSON.stringify(details.request, null, 2)}\n\nAPI Response:\n${JSON.stringify(details.response, null, 2)}`;
		await navigator.clipboard.writeText(errorText);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex items-center gap-4 mb-6">
	<a href="{ctxBase}/offers" class="btn preset-outlined-surface-500">
		<ArrowLeft class="size-4" />
		<span>Back</span>
	</a>
	<Tag class="size-6 text-primary-500" />
	<h2 class="h2">Trading Offer</h2>
</div>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else if data.error}
	<div class="card p-8 preset-filled-surface-100-900">
		<div class="flex items-center justify-between mb-4">
			<h2 class="h3 text-error-500">Error Loading Offer</h2>
			{#if data.errorDetails}
				<button
					onclick={() => copyErrorDetails(data.errorDetails)}
					class="btn preset-outlined-surface-500 btn-sm"
				>
					{#if copied}<Check class="size-4 text-success-500" /><span>Copied</span>
					{:else}<Copy class="size-4" /><span>Copy</span>{/if}
				</button>
			{/if}
		</div>
		{#if data.errorDetails}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(data.errorDetails.response, null, 2)}</pre>
		{:else}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{data.error}</pre>
		{/if}
	</div>
{:else if data.offer}
	{#if form?.cancelSuccess}
		<div class="card p-6 preset-filled-surface-100-900 mb-6">
			<h2 class="h3 mb-2 text-success-500">Offer Cancelled</h2>
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(form.cancelResponse, null, 2)}</pre>
		</div>
	{:else if form?.cancelError}
		<div class="card p-6 preset-filled-surface-100-900 mb-6">
			<h2 class="h3 mb-2 text-error-500">Cancel Failed</h2>
			{#if form.cancelErrorDetails}
				<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(form.cancelErrorDetails.response, null, 2)}</pre>
			{:else}
				<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{form.cancelError}</pre>
			{/if}
		</div>
	{/if}

	<div class="card p-6 preset-filled-surface-100-900 mb-6">
		<div class="flex items-start justify-between gap-4 mb-4">
			<div>
				<h3 class="h3">
					{offerDetails.offer_type ?? '?'}
					{offerDetails.asset_amount ?? '?'}
					{offerDetails.asset_code ?? '?'}
				</h3>
				<p class="text-surface-600-400">
					@ {offerDetails.price_amount} {offerDetails.price_currency}
				</p>
				<p class="text-sm text-surface-600-400 mt-2">ID: {data.offer.offer_id}</p>
				{#if data.offer.status}
					<p class="text-sm text-surface-600-400">Status: <strong>{data.offer.status}</strong></p>
				{/if}
			</div>

			{#if data.offer.status === 'active'}
				<form method="POST" action="?/cancel" use:enhance>
					<button type="submit" class="btn preset-filled-error-500">
						<Trash2 class="size-4" />
						<span>Cancel Offer</span>
					</button>
				</form>
			{/if}
		</div>

		<details class="mt-4">
			<summary class="cursor-pointer text-sm text-surface-600-400">Raw API Response</summary>
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-xs mt-2">{JSON.stringify(data.offer, null, 2)}</pre>
		</details>
	</div>
{/if}
