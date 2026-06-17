import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  children,
  className,
}: {
  columns: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200 bg-white",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3.5">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyRow({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <tr>
      <td className="px-4 py-10 text-center text-sm text-zinc-500" colSpan={colSpan}>
        {text}
      </td>
    </tr>
  );
}
