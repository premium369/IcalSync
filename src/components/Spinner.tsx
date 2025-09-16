import React from "react";

export default function Spinner({ className = "h-4 w-4 border-2 border-gray-300 border-t-gray-900" }: { className?: string }) {
  return (
    <span
      className={"inline-block animate-spin rounded-full " + className}
      aria-hidden="true"
    />
  );
}