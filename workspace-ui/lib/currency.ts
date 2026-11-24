const yuan = new Intl.NumberFormat("zh-CN", {
  style: "currency", currency: "CNY", minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const yuanFixed = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });
const yuanAxis = new Intl.NumberFormat("zh-CN", {
  style: "currency", currency: "CNY", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export const formatYuan = (amount: number) => yuan.format(amount);
export const formatYuanFixed = (amount: number) => yuanFixed.format(amount);
export const formatCompactYuan = (amount: number) => yuanAxis.format(amount);
