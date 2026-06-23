import React from "react";

const AdminAnalyticsWidgets = ({ analytics, t }) => {
  if (!analytics) return null;

  return (
    <div
      className={`grid gap-2 mb-8 ${
        analytics.totalPayouts > 0
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          : "grid-cols-2 md:grid-cols-4"
      }`}
    >
      <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm bg-white border border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
          {t("admin:total_sales")}
        </span>
        <h3 className="text-2xl font-extrabold text-brand-cyan font-heading text-left">
          ₹{analytics.totalRevenue}
        </h3>
      </div>
      <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm bg-white border border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
          {t("admin:total_orders")}
        </span>
        <h3 className="text-2xl font-extrabold text-brand-cyan font-heading text-left">
          {analytics.totalOrders}
        </h3>
      </div>
      <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm bg-white border border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
          {t("admin:customer")}
        </span>
        <h3 className="text-2xl font-extrabold text-brand-cyan font-heading text-left">
          {analytics.totalUsers}
        </h3>
      </div>
      <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm bg-white border border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
          {t("admin:nav_products")}
        </span>
        <h3 className="text-2xl font-extrabold text-brand-cyan font-heading text-left">
          {analytics.totalProducts}
        </h3>
      </div>
      {analytics.totalPayouts > 0 && (
        <>
          <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm border border-red-500/10 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
              {t("admin:payouts")}
            </span>
            <h3 className="text-2xl font-extrabold text-red-500 font-heading text-left">
              ₹{analytics.totalPayouts}
            </h3>
          </div>
          <div className="p-5 glass-card flex flex-col gap-1.5 shadow-sm border border-emerald-500/10 bg-white">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
              {t("admin:net_effective")}
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-500 font-heading text-left">
              ₹{analytics.netEffective}
            </h3>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(AdminAnalyticsWidgets);
