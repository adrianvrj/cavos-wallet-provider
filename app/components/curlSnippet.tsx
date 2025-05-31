"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  code: string;
};

export default function CurlSnippet({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-4">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 text-[#FFFFE3]/50 hover:text-[#FFFFE3] transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </button>
      <pre className="text-[#FFFFE3]/80 text-sm overflow-x-auto whitespace-pre font-mono">
        {code}
      </pre>
    </div>
  );
}
