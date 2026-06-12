import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, valuePrefix }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-admin-border rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="text-admin-text-3 text-xs mb-1">{label}</p>
      <p className="font-semibold text-admin-text-1">
        {valuePrefix}{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString('en-IN') : payload[0].value}
      </p>
    </div>
  );
};

const BookingChart = ({ data, valuePrefix = '' }) => {
  if (!data?.labels?.length) {
    return (
      <div className="h-52 flex items-center justify-center text-admin-text-3 text-sm">
        No data for selected period
      </div>
    );
  }

  const chartData = data.labels.map((label, i) => ({
    date:  label,
    value: data.values[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => {
            const d = new Date(v);
            return isNaN(d) ? v : `${d.getDate()}/${d.getMonth() + 1}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => valuePrefix + (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
          width={52}
        />
        <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#colorValue)"
          dot={false}
          activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BookingChart;
