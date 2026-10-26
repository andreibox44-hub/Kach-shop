// Delivery prices (EUR) by country and method, and the order sum from which delivery is free.
// The same table is in supabase/functions/payments/index.ts (SHIPPING): change both together,
// then run `node scripts/make-feeds.js` so Google Shopping shows the same prices.
window.KACH_SHIPPING = (function () {
  const RATES = {
    RO: { courier: 4, post: 3, freeFrom: 40 },
    IT: { courier: 12, post: 12, freeFrom: 80 },
    DE: { courier: 12, post: 12, freeFrom: 80 },
    FR: { courier: 12, post: 12, freeFrom: 80 }
  };
  // Delivery cost for an order of `subtotal` euros
  function cost(country, method, subtotal) {
    const r = RATES[country];
    if (!r) return null;
    if (subtotal >= r.freeFrom) return 0;
    return r[method] != null ? r[method] : r.courier;
  }
  return { RATES, cost };
})();
