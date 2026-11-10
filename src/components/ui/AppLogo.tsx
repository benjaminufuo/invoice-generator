import React from "react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const dimensions = {
    sm: { text: "text-sm", imgClass: "w-7 h-7" },
    md: { text: "text-base", imgClass: "w-8.5 h-8.5" },
    lg: { text: "text-xl", imgClass: "w-11 h-11" },
    xl: { text: "text-2xl", imgClass: "w-14 h-14" },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="InvoiceGen"
        className={`${dimensions.imgClass} object-contain shrink-0 drop-shadow-2xs`}
      />
      {showText && (
        <span className={`font-bold text-zinc-900 tracking-tight ${dimensions.text}`}>
          Invoice<span className="text-indigo-600">Gen</span>
        </span>
      )}
    </div>
  );
};
