export interface TradingContext {
	bankId: string;
	accountId: string;
	viewId: string;
}

const base = ({ bankId, accountId, viewId }: TradingContext) =>
	`/obp/v7.0.0/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/views/${encodeURIComponent(viewId)}`;

export const tradingPaths = {
	offers: (ctx: TradingContext) => `${base(ctx)}/trading/offers`,
	offer: (ctx: TradingContext, offerId: string) =>
		`${base(ctx)}/trading/offers/${encodeURIComponent(offerId)}`,

	orders: (ctx: TradingContext) => `${base(ctx)}/market/orders`,
	order: (ctx: TradingContext, orderId: string) =>
		`${base(ctx)}/market/orders/${encodeURIComponent(orderId)}`,

	matches: (ctx: TradingContext) => `${base(ctx)}/market/matches`,
	trade: (ctx: TradingContext, tradeId: string) =>
		`${base(ctx)}/market/trades/${encodeURIComponent(tradeId)}`,

	settlements: (ctx: TradingContext) => `${base(ctx)}/market/settlements`,
	withdrawals: (ctx: TradingContext) => `${base(ctx)}/market/withdrawals`
};

export const uiBase = ({ bankId, accountId, viewId }: TradingContext) =>
	`/trading/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/views/${encodeURIComponent(viewId)}`;
