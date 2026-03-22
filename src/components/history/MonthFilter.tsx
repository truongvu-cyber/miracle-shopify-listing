import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { useHistoryStore } from "@/hooks/useHistoryStore";

export function MonthFilter() {
  const { filterMonth, setFilterMonth, entries } = useHistoryStore();

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const entry of entries) {
      const ym = entry.createdAt.slice(0, 7);
      months.add(ym);
    }

    const sorted = Array.from(months).sort().reverse();
    return [
      { value: "", label: "Tất cả tháng" },
      ...sorted.map((m) => {
        const [year, month] = m.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const label = date.toLocaleDateString("vi-VN", {
          month: "long",
          year: "numeric",
        });
        return { value: m, label };
      }),
    ];
  }, [entries]);

  return (
    <Select
      options={monthOptions}
      value={filterMonth}
      onChange={(e) => setFilterMonth(e.target.value)}
    />
  );
}
