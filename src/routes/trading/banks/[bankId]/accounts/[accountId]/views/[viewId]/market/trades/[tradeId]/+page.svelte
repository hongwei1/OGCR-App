<script lang="ts">
	import type { PageData } from './$types';
	import { BarChart3, ArrowLeft } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);
</script>

<div class="flex items-center gap-4 mb-6">
	<a href="{ctxBase}/market" class="btn preset-outlined-surface-500">
		<ArrowLeft class="size-4" />
		<span>Back</span>
	</a>
	<BarChart3 class="size-6 text-primary-500" />
	<h2 class="h2">Market Trade</h2>
</div>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else if data.error}
	<div class="card p-8 preset-filled-surface-100-900">
		<h2 class="h3 text-error-500 mb-4">Error Loading Trade</h2>
		{#if data.errorDetails}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(data.errorDetails.response, null, 2)}</pre>
		{:else}
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{data.error}</pre>
		{/if}
	</div>
{:else if data.trade}
	<div class="card p-6 preset-filled-surface-100-900 mb-6">
		<div class="mb-4">
			<h3 class="h3">
				{data.trade.amount ?? '?'} @ {data.trade.price ?? '?'}
			</h3>
			<p class="text-sm text-surface-600-400 mt-2">Trade ID: {data.trade.trade_id}</p>
			{#if data.trade.status}
				<p class="text-sm text-surface-600-400">Status: <strong>{data.trade.status}</strong></p>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
			{#if data.trade.buy_order_id}
				<div>
					<p class="text-sm text-surface-600-400">Buy Order:</p>
					<a
						href="{ctxBase}/market/orders/{data.trade.buy_order_id}"
						class="text-primary-500 hover:underline"
					>
						{data.trade.buy_order_id}
					</a>
				</div>
			{/if}
			{#if data.trade.sell_order_id}
				<div>
					<p class="text-sm text-surface-600-400">Sell Order:</p>
					<a
						href="{ctxBase}/market/orders/{data.trade.sell_order_id}"
						class="text-primary-500 hover:underline"
					>
						{data.trade.sell_order_id}
					</a>
				</div>
			{/if}
		</div>

		<details class="mt-4">
			<summary class="cursor-pointer text-sm text-surface-600-400">Raw API Response</summary>
			<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-xs mt-2">{JSON.stringify(data.trade, null, 2)}</pre>
		</details>
	</div>
{/if}
