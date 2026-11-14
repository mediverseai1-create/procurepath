"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SpendChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <div role="img" aria-label="Approved spend by category" className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} stroke="#e2e4ee" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} width={70} />
          <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Spend"]} />
          <Bar dataKey="total" fill="#2b45d8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
