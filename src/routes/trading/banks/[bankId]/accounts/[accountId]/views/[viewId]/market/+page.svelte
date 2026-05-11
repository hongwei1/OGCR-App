<script lang="ts">
	import type { PageData } from './$types';
	import {
		BarChart3,
		Plus,
		Search,
		Handshake,
		ArrowRightLeft,
		Banknote,
		Send
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);

	let orderLookupId = $state('');
	let tradeLookupId = $state('');

	function lookupOrder(e: Event) {
		e.preventDefault();
		const id = orderLookupId.trim();
		if (!id) return;
		goto(`${ctxBase}/market/orders/${encodeURIComponent(id)}`);
	}

	function lookupTrade(e: Event) {
		e.preventDefault();
		const id = tradeLookupId.trim();
		if (!id) return;
		goto(`${ctxBase}/market/trades/${encodeURIComponent(id)}`);
	}
</script>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<BarChart3 class="size-16 mx-auto mb-4 text-surface-400" />
		<h2 class="h3 mb-2">Authentication Required</h2>
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else}
	<p class="text-surface-600-400 mb-6">
		The Market endpoints don't expose list operations — create new entities, or look up existing
		ones by ID.
	</p>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="card p-6 preset-filled-surface-100-900">
			<div class="flex items-center gap-3 mb-3">
				<ArrowRightLeft class="size-6 text-primary-500" />
				<h3 class="h3">Orders</h3>
			</div>
			<p class="text-sm text-surface-600-400 mb-4">
				Create market orders and look up or cancel existing ones.
			</p>
			<div class="flex flex-wrap gap-2 mb-4">
				<a href="{ctxBase}/market/orders/create" class="btn preset-filled-primary-500">
					<Plus class="size-4" />
					<span>Create Order</span>
				</a>
			</div>
			<form onsubmit={lookupOrder} class="flex gap-2">
				<input
					type="text"
					bind:value={orderLookupId}
					class="input"
					placeholder="Order ID"
				/>
				<button type="submit" class="btn preset-outlined-primary-500">
					<Search class="size-4" />
					<span>Look up</span>
				</button>
			</form>
		</div>

		<div class="card p-6 preset-filled-surface-100-900">
			<div class="flex items-center gap-3 mb-3">
				<Handshake class="size-6 text-primary-500" />
				<h3 class="h3">Matches</h3>
			</div>
			<p class="text-sm text-surface-600-400 mb-4">
				Match a buy and sell order to create a trade.
			</p>
			<a href="{ctxBase}/market/matches/create" class="btn preset-filled-primary-500">
				<Plus class="size-4" />
				<span>Create Match</span>
			</a>
		</div>

		<div class="card p-6 preset-filled-surface-100-900">
			<div class="flex items-center gap-3 mb-3">
				<BarChart3 class="size-6 text-primary-500" />
				<h3 class="h3">Trades</h3>
			</div>
			<p class="text-sm text-surface-600-400 mb-4">
				Look up trade details by ID.
			</p>
			<form onsubmit={lookupTrade} class="flex gap-2">
				<input
					type="text"
					bind:value={tradeLookupId}
					class="input"
					placeholder="Trade ID"
				/>
				<button type="submit" class="btn preset-outlined-primary-500">
					<Search class="size-4" />
					<span>Look up</span>
				</button>
			</form>
		</div>

		<div class="card p-6 preset-filled-surface-100-900">
			<div class="flex items-center gap-3 mb-3">
				<Banknote class="size-6 text-primary-500" />
				<h3 class="h3">Settlements</h3>
			</div>
			<p class="text-sm text-surface-600-400 mb-4">
				Request settlement for a completed trade.
			</p>
			<a href="{ctxBase}/market/settlements" class="btn preset-filled-primary-500">
				<Send class="size-4" />
				<span>Request Settlement</span>
			</a>
		</div>

		<div class="card p-6 preset-filled-surface-100-900 md:col-span-2">
			<div class="flex items-center gap-3 mb-3">
				<Send class="size-6 text-primary-500" />
				<h3 class="h3">Withdrawals</h3>
			</div>
			<p class="text-sm text-surface-600-400 mb-4">
				Withdraw funds to a blockchain address.
			</p>
			<a href="{ctxBase}/market/withdrawals" class="btn preset-filled-primary-500">
				<Send class="size-4" />
				<span>Request Withdrawal</span>
			</a>
		</div>
	</div>
{/if}
