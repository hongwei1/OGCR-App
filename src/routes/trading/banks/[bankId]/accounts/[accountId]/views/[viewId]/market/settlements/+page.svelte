<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Banknote, ArrowLeft, Copy, Check } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let copied = $state(false);

	const ctxBase = $derived(
		`/trading/banks/${encodeURIComponent(data.ctx.bankId)}/accounts/${encodeURIComponent(data.ctx.accountId)}/views/${encodeURIComponent(data.ctx.viewId)}`
	);

	function v(field: string): string {
		return form?.values?.[field] ?? '';
	}

	async function copyErrorDetails() {
		if (!form?.errorDetails) return;
		const errorText = `API Request:\n${JSON.stringify(form.errorDetails.request, null, 2)}\n\nAPI Response:\n${JSON.stringify(form.errorDetails.response, null, 2)}`;
		await navigator.clipboard.writeText(errorText);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex items-center gap-4 mb-6">
	<a href="{ctxBase}/market" class="btn preset-outlined-surface-500">
		<ArrowLeft class="size-4" />
		<span>Back</span>
	</a>
	<Banknote class="size-6 text-primary-500" />
	<h2 class="h2">Request Settlement</h2>
</div>

{#if !data.isAuthenticated}
	<div class="card p-8 preset-filled-surface-100-900 text-center">
		<a href="/login" class="btn preset-filled-primary-500">Login</a>
	</div>
{:else if form?.success}
	<div class="card p-8 preset-filled-surface-100-900 mb-6">
		<h2 class="h3 mb-2 text-success-500">Settlement Requested</h2>
		<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(form.response, null, 2)}</pre>
		<a href="{ctxBase}/market" class="btn preset-filled-primary-500 mt-4">Back to Market</a>
	</div>
{:else}
	{#if form?.error}
		<div class="card p-8 preset-filled-surface-100-900 mb-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="h3 text-error-500">Settlement Failed</h2>
				{#if form.errorDetails}
					<button onclick={copyErrorDetails} class="btn preset-outlined-surface-500 btn-sm">
						{#if copied}<Check class="size-4 text-success-500" /><span>Copied</span>
						{:else}<Copy class="size-4" /><span>Copy</span>{/if}
					</button>
				{/if}
			</div>
			{#if form.errorDetails}
				<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{JSON.stringify(form.errorDetails.response, null, 2)}</pre>
			{:else}
				<pre class="bg-surface-200-800 p-4 rounded overflow-auto text-sm">{form.error}</pre>
			{/if}
		</div>
	{/if}

	<div class="card p-8 preset-filled-surface-100-900">
		<form method="POST" use:enhance class="space-y-6">
			<label class="label">
				<span class="label-text">Trade ID *</span>
				<input
					type="text"
					name="trade_id"
					value={v('trade_id')}
					class="input"
					placeholder="e.g., trade-789"
					required
				/>
			</label>

			<label class="label">
				<span class="label-text">Step</span>
				<input
					type="text"
					name="step"
					value={v('step')}
					class="input"
					placeholder="optional, e.g., step1"
				/>
			</label>

			<button type="submit" class="btn preset-filled-primary-500">Request Settlement</button>
		</form>
	</div>
{/if}
