<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { ArrowRightLeft, ArrowLeft, Trash2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);
</script>

<div class="flex items-center gap-4 mb-6">
	<a href="{ctxBase}/market" class="btn preset-outlined-surface-500">
		<ArrowLeft class="size-4" />
		<span>Back</span>
	</a>
	<ArrowRightLeft class="size-6 text-primary-500" />
	<h2 class="h2">Market Order</h2>
</div>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else if data.error}
	<div class="card p-8 preset-filled-surface-100-900">
		<h2 class="h3 text-error-500 mb-4">Error Loading Order</h2>
		{#if data.errorDetails}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(data.errorDetails.response, null, 2)}</pre>
		{:else}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{data.error}</pre>
		{/if}
	</div>
{:else if data.order}
	{#if form?.cancelSuccess}
		<div class="card p-6 preset-filled-surface-100-900 mb-6">
			<h2 class="h3 mb-2 text-success-500">Order Cancelled</h2>
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
					{data.order.side ?? '?'} {data.order.quantity ?? '?'} @ {data.order.price ?? '?'}
				</h3>
				<p class="text-sm text-surface-600-400 mt-2">ID: {data.order.order_id}</p>
				{#if data.order.status}
					<p class="text-sm text-surface-600-400">Status: <strong>{data.order.status}</strong></p>
				{/if}
				{#if data.order.account_id}
					<p class="text-sm text-surface-600-400">Account: {data.order.account_id}</p>
				{/if}
			</div>

			{#if data.order.status === 'active'}
				<form method="POST" action="?/cancel" use:enhance>
					<button type="submit" class="btn preset-filled-error-500">
						<Trash2 class="size-4" />
						<span>Cancel Order</span>
					</button>
				</form>
			{/if}
		</div>

		<details class="mt-4">
			<summary class="cursor-pointer text-sm text-surface-600-400">Raw API Response</summary>
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-xs mt-2">{JSON.stringify(data.order, null, 2)}</pre>
		</details>
	</div>
{/if}
