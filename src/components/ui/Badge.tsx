import React from "react";
import { InvoiceStatus } from "@/types";

interface BadgeProps {
  status: InvoiceStatus | string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ status, size = "md" }) => {
  const styles: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    draft: {
      bg: "bg-zinc-100/90 border-zinc-200",
      text: "text-zinc-700",
      dot: "bg-zinc-400",
      label: "Draft",
    },
    sent: {
      bg: "bg-sky-50 border-sky-200",
      text: "text-sky-700",
      dot: "bg-sky-500",
      label: "Sent",
    },
    paid: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Paid",
    },
  };

  const current = styles[status] || styles.draft;
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${current.bg} ${current.text} ${sizeClasses} select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      {current.label}
    </span>
  );
};
