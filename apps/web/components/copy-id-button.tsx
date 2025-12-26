"use client";

interface Props {
  id: string;
}

export function CopyIdButton({ id }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(id);
  };

  return (
    <dd
      className="cursor-pointer font-mono text-xs text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
      onClick={handleCopy}
      title="Click to copy full ID"
    >
      {id.slice(0, 8)}...
    </dd>
  );
}
