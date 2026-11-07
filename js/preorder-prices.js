// Transcribed from both user-supplied 1C screenshots on 2026-11-07.
// No stock, delivery promise or regional specification is inferred from these prices.
export const PREORDER_PRICE_SOURCE = Object.freeze({
  kind: 'user_1c_screenshots', verifiedAt: '2026-11-07', currency: 'RUB',
  label: 'Скриншоты 1С от пользователя · проверено 07.11.2026',
});
const COLORS = { black: 'Black', white: 'White', blue: 'Blue', red: 'Red' };
const amounts = {
  'xiaomi-18-pro': { '12/256 ГБ': 139990, '12/512 ГБ': 149990 },
  'xiaomi-18-pro-max': { '12/256 ГБ': 159990, '12/512 ГБ': 169990 },
};
export const PREORDER_PRICES = Object.freeze(Object.entries(amounts).flatMap(([modelId, variants]) =>
  Object.entries(variants).flatMap(([capacity, amount]) => Object.entries(COLORS).map(([colorId, sourceColor]) => Object.freeze({
    modelId, colorId, capacity, amount, currency: 'RUB',
    sourceName: `Смартфон Xiaomi ${modelId.endsWith('max') ? '18 Pro Max' : '18 Pro'} 12GB+${capacity.includes('256') ? '256' : '512'}GB ${sourceColor}`,
  })))));
export function preorderPrice({ model, color, capacity }) {
  return PREORDER_PRICES.find(p => p.modelId === model.id && p.colorId === color.id && p.capacity === capacity) || null;
}
export function formatPreorderPrice(price) {
  return price ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price.amount) : 'Цена уточняется';
}
