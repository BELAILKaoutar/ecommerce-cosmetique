export function toMoneyNumber(value) {
  return Number(value);
}

export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function serializeOrder(order) {
  if (!order) {
    return order;
  }

  return {
    ...order,
    subtotal: toMoneyNumber(order.subtotal),
    deliveryFee: toMoneyNumber(order.deliveryFee),
    total: toMoneyNumber(order.total),
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          unitPrice: toMoneyNumber(item.unitPrice),
          lineTotal: toMoneyNumber(item.lineTotal),
        }))
      : order.items,
  };
}
