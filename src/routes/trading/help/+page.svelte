<script lang="ts">
	import {
		HelpCircle,
		Tag,
		BarChart3,
		ArrowRightLeft,
		Handshake,
		Banknote,
		Send,
		Info,
		ArrowLeft,
		ArrowDown
	} from '@lucide/svelte';
</script>

<div class="p-8 max-w-4xl mx-auto space-y-8">
	<div class="flex items-center gap-4">
		<HelpCircle class="size-8 text-primary-500" />
		<h1 class="h1">Trading — How it works</h1>
	</div>

	<a href="/trading" class="anchor inline-flex items-center gap-1 text-sm">
		<ArrowLeft class="size-4" /> Back to Trading
	</a>

	<p class="text-surface-600-400">
		This app talks to the Open Bank Project (OBP) trading API. Everything below is a plain-English
		guide for people new to trading, but every term maps directly to a real OBP endpoint. The asset
		being traded has a code such as <code>OGCR</code> (a carbon-credit token), and it is priced in a
		currency such as <code>EUR</code>.
	</p>

	<!-- The big picture -->
	<section class="card p-8 preset-filled-surface-100-900 space-y-4">
		<h2 class="h2">The big picture: two separate systems</h2>
		<p class="text-surface-600-400">
			The trading screens are split into <strong>Offers</strong> and <strong>Market</strong>. These
			are <em>two independent ways to trade</em> — not two steps of one process. Each has its own
			matching engine inside OBP:
		</p>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="card p-6 preset-filled-surface-50-950 space-y-2">
				<div class="flex items-center gap-3">
					<Tag class="size-6 text-primary-500" />
					<h3 class="h3">Offers</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					A simple, all-in-one <strong>order book</strong>. You post what you want to buy or sell,
					and OBP automatically matches your offer against other people's offers. Easiest place to
					start. You can list, filter and cancel your offers.
				</p>
			</div>
			<div class="card p-6 preset-filled-surface-50-950 space-y-2">
				<div class="flex items-center gap-3">
					<BarChart3 class="size-6 text-primary-500" />
					<h3 class="h3">Market</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					A low-level toolkit where you drive each step by hand: place orders, match a buy with a
					sell, create the resulting trade, settle it, and move funds on-chain. More control, more
					steps. These endpoints can't be listed — you create things or look them up by ID.
				</p>
			</div>
		</div>
		<div class="card p-4 preset-tonal-primary flex gap-3">
			<Info class="size-5 shrink-0 mt-0.5 text-primary-500" />
			<p class="text-sm">
				<strong>Key point:</strong> an offer never becomes a market
				order. Offers are matched against other <em>offers</em>; market orders are matched against
				other <em>orders</em>. They are parallel subsystems, so pick one model and stick with it for a
				given trade.
			</p>
		</div>
	</section>

	<!-- Offers detail -->
	<section class="card p-8 preset-filled-surface-100-900 space-y-4">
		<div class="flex items-center gap-3">
			<Tag class="size-6 text-primary-500" />
			<h2 class="h2">Offers, in detail</h2>
		</div>
		<p class="text-surface-600-400">
			An <strong>offer</strong> is a standing advertisement: <em
				>"I will BUY 100 OGCR at 1 EUR each."</em
			> When you post it, OBP tries to match it against existing offers in the order book. As it gets
			matched — fully or in part — each fill is recorded on the offer as an <strong>execution</strong>.
		</p>
		<dl class="space-y-3">
			<div>
				<dt class="font-semibold">offer_type</dt>
				<dd class="text-sm text-surface-600-400">
					<code>BUY</code> or <code>SELL</code> — the direction you want to trade.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">asset_code / asset_amount</dt>
				<dd class="text-sm text-surface-600-400">
					What you're trading (e.g. <code>OGCR</code>) and how much.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">price_currency / price_amount</dt>
				<dd class="text-sm text-surface-600-400">
					The price <em>per unit</em> of the asset and the currency it's quoted in.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">settlement_account_id</dt>
				<dd class="text-sm text-surface-600-400">
					The account that money and assets move through when the offer is filled.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">expiry_datetime <span class="font-normal">(optional)</span></dt>
				<dd class="text-sm text-surface-600-400">
					When the offer should automatically lapse if not filled.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">minimum_fill <span class="font-normal">(optional)</span></dt>
				<dd class="text-sm text-surface-600-400">
					The smallest amount you'll accept in a single match — avoids tiny partial fills.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">status</dt>
				<dd class="text-sm text-surface-600-400">
					Set by OBP: <code>active</code>, <code>filled</code>, <code>cancelled</code> or
					<code>expired</code>.
				</dd>
			</div>
			<div>
				<dt class="font-semibold">executions</dt>
				<dd class="text-sm text-surface-600-400">
					The fill history. Each execution records the amount, price, time and the
					<code>counterpart_offer_id</code> it matched against.
				</dd>
			</div>
		</dl>
	</section>

	<!-- Market detail -->
	<section class="card p-8 preset-filled-surface-100-900 space-y-4">
		<div class="flex items-center gap-3">
			<BarChart3 class="size-6 text-primary-500" />
			<h2 class="h2">Market, in detail</h2>
		</div>
		<p class="text-surface-600-400">
			The Market endpoints model each stage of a trade's life as its own resource. The usual flow
			runs top to bottom:
		</p>

		<div class="space-y-3">
			<div class="card p-5 preset-filled-surface-50-950 space-y-1">
				<div class="flex items-center gap-3">
					<ArrowRightLeft class="size-5 text-primary-500" />
					<h3 class="h4">1. Orders</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					A concrete instruction to buy or sell: a <code>side</code> (BUY/SELL), a
					<code>price</code>, a <code>quantity</code> and a settlement account. You create an order,
					look it up, or cancel it (cancelling is idempotent — cancelling twice is still a success).
				</p>
			</div>
			<div class="flex justify-center text-surface-400"><ArrowDown class="size-5" /></div>
			<div class="card p-5 preset-filled-surface-50-950 space-y-1">
				<div class="flex items-center gap-3">
					<Handshake class="size-5 text-primary-500" />
					<h3 class="h4">2. Matches</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					Pairs a buy order with a counter (sell) order, for a given amount and price. Creating a
					match <strong>automatically generates the corresponding trade</strong>.
				</p>
			</div>
			<div class="flex justify-center text-surface-400"><ArrowDown class="size-5" /></div>
			<div class="card p-5 preset-filled-surface-50-950 space-y-1">
				<div class="flex items-center gap-3">
					<BarChart3 class="size-5 text-primary-500" />
					<h3 class="h4">3. Trades</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					The agreed deal that comes out of a match, linking a <code>buy_order_id</code> and a
					<code>sell_order_id</code> with the agreed amount and price. Look these up by ID.
				</p>
			</div>
			<div class="flex justify-center text-surface-400"><ArrowDown class="size-5" /></div>
			<div class="card p-5 preset-filled-surface-50-950 space-y-1">
				<div class="flex items-center gap-3">
					<Banknote class="size-5 text-primary-500" />
					<h3 class="h4">4. Settlements</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					The follow-through that finalises a completed trade — moving the money and the asset. A
					trade is the <em>agreement</em>; settlement is the <em>delivery</em>, and it can run in
					steps until it's <code>completed</code>.
				</p>
			</div>
			<div class="flex justify-center text-surface-400"><ArrowDown class="size-5" /></div>
			<div class="card p-5 preset-filled-surface-50-950 space-y-1">
				<div class="flex items-center gap-3">
					<Send class="size-5 text-primary-500" />
					<h3 class="h4">5. Withdrawals</h3>
				</div>
				<p class="text-sm text-surface-600-400">
					Moves funds out of the system to a blockchain address. Tracked on-chain via a
					transaction hash and confirmation count.
				</p>
			</div>
		</div>
	</section>

	<!-- Offers vs market table -->
	<section class="card p-8 preset-filled-surface-100-900 space-y-4">
		<h2 class="h2">Offers vs Market at a glance</h2>
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th></th>
						<th>Offers</th>
						<th>Market</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="font-semibold">What it is</td>
						<td>A standing, advertised intention</td>
						<td>A step-by-step settlement toolkit</td>
					</tr>
					<tr>
						<td class="font-semibold">Matching</td>
						<td>Automatic, against other offers</td>
						<td>Manual — the marketplace operator pairs a buy and a sell order by their IDs</td>
					</tr>
					<tr>
						<td class="font-semibold">Can you list them?</td>
						<td>Yes — filter by status / type</td>
						<td>No — create or look up by ID</td>
					</tr>
					<tr>
						<td class="font-semibold">Best for</td>
						<td>Getting started; everyday trading</td>
						<td>Fine-grained control over each stage</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Why amounts are strings -->
	<section class="card p-8 preset-filled-surface-100-900 space-y-4">
		<div class="flex items-center gap-3">
			<Info class="size-6 text-primary-500" />
			<h2 class="h2">Why amounts are sent as strings</h2>
		</div>
		<p class="text-surface-600-400">
			When creating offers and orders, amounts (<code>asset_amount</code>, <code>price_amount</code>,
			<code>quantity</code>, etc.) must be sent as JSON <strong>strings</strong> — e.g.
			<code>"100.00"</code>, not <code>100</code>. Sending a bare number returns
			<code>OBP-10001: Incorrect json format</code>.
		</p>
		<p class="text-surface-600-400">
			This is deliberate. OBP stores money as an arbitrary-precision decimal (<code>BigDecimal</code
			>), and its JSON layer only accepts these values from strings — the code paths that would read
			them from JSON numbers are disabled on purpose, with the note that converting from a JSON
			number <em>"may lose precision"</em>. Standard binary floating point can't represent values
			like <code>0.1</code> exactly, which is unacceptable for money, so the string form is required
			to preserve the exact value end to end.
		</p>
	</section>
</div>
