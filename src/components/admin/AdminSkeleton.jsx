import React from "react";

/**
 * Beautiful skeleton shimmer components to replace blocking loaders.
 */
export const AnalyticsWidgetsSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid gap-4 mb-8 grid-cols-2 md:grid-cols-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 glass-card rounded-2xl flex flex-col gap-3 shadow-sm bg-white border border-slate-100"
        >
          {/* Label placeholder */}
          <div className="h-3 w-20 rounded bg-slate-200 shimmer-bg" />
          {/* Value placeholder */}
          <div className="h-7 w-28 rounded-lg bg-slate-200 shimmer-bg" />
        </div>
      ))}
    </div>
  );
};

export const TableTabSkeleton = ({ rows = 6, cols = 6 }) => {
  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Filtering and Search Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="h-9 w-full sm:max-w-md rounded-xl bg-white border border-slate-200/80 flex items-center px-3">
          <div className="h-4 w-4 rounded-full bg-slate-200 shimmer-bg mr-2" />
          <div className="h-3 w-40 rounded bg-slate-100 shimmer-bg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-10 rounded bg-slate-200 shimmer-bg" />
          <div className="h-9 w-28 rounded-xl bg-white border border-slate-200 shimmer-bg" />
        </div>
      </div>

      {/* Table Container Placeholder */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3.5 w-16 rounded bg-slate-200 shimmer-bg" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-100">
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-4">
                    {colIdx === 0 && (rowIdx % 2 === 0) ? (
                      <div className="flex items-center gap-2">
                        {/* Shimmer Image/Icon placeholder */}
                        <div className="h-8 w-8 rounded bg-slate-200 shimmer-bg flex-shrink-0" />
                        <div className="h-3 w-20 rounded bg-slate-200 shimmer-bg" />
                      </div>
                    ) : (
                      <div
                        className={`h-3 rounded bg-slate-200 shimmer-bg ${
                          colIdx === cols - 1 ? "w-12 ml-auto" : "w-24"
                        }`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const OverviewTabSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Chart Card Placeholder */}
      <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm bg-white border border-slate-100">
        <div className="h-4 w-40 rounded bg-slate-200 shimmer-bg mb-6" />
        <div className="flex justify-around items-end h-[220px] pt-8 border-b-2 border-slate-100 gap-2 md:gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center flex-1 min-w-[50px] max-w-[80px] gap-2"
            >
              <div className="w-7 bg-slate-200 shimmer-bg rounded-t-lg transition-all" style={{ height: `${20 + idx * 12}%` }} />
              <div className="h-2.5 w-10 rounded bg-slate-100 shimmer-bg" />
              <div className="h-2.5 w-8 rounded bg-slate-200 shimmer-bg" />
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Table Placeholder */}
      <div className="p-6 md:p-8 glass-card rounded-2xl shadow-sm bg-white border border-slate-100">
        <div className="h-4 w-32 rounded bg-slate-200 shimmer-bg mb-4" />
        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-3.5 w-16 rounded bg-slate-200 shimmer-bg" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-100">
                  {Array.from({ length: 4 }).map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-4">
                      <div className="h-3 w-24 rounded bg-slate-200 shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminSkeleton = ({ type = "table", count = 4, rows = 6, cols = 6 }) => {
  if (type === "analytics") {
    return <AnalyticsWidgetsSkeleton count={count} />;
  }
  if (type === "overview") {
    return <OverviewTabSkeleton />;
  }
  return <TableTabSkeleton rows={rows} cols={cols} />;
};

export default AdminSkeleton;
