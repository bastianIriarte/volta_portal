import { ArrowRight } from "lucide-react";

export const StatCard = ({
  label,
  description,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  onClick
}) => {
  const isPositive = trend === "up";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header: Icon + Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 102, 158, 0.1)' }}
            >
              <Icon className="w-5 h-5" style={{ color: '#00669e' }} strokeWidth={1.5} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Value + Details Button */}
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {onClick && (
          <button
            onClick={onClick}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            style={{ color: '#00669e' }}
          >
            Detalles <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Trend */}
      {trendValue && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span
            className="text-xs font-semibold"
            style={{ color: isPositive ? '#00669e' : '#f4b000' }}
          >
            {trendValue}
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-400 ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
