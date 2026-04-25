"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#09111d]/95 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-[#8ea7c2]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-2 text-sm font-medium text-white">
          {entry.name}: {Number(entry.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function ChartPanel({ title, description, children }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-[#8ea7c2]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function AdminAnalyticsCharts({ growth = [], weekly = [] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartPanel
        title="User Growth"
        description="Daily active users for the last 30 days."
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="growthStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8ea7c2", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#8ea7c2", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="url(#growthStroke)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: "#ffffff", stroke: "#60a5fa", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="Weekly Users"
        description="A compact view of the last 7 days of activity."
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="weeklyBars" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8ea7c2", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#8ea7c2", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="users"
                name="Users"
                fill="url(#weeklyBars)"
                radius={[10, 10, 4, 4]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>
    </div>
  );
}
