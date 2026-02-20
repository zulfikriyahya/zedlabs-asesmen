import { clsx } from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, idx: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, idx: number) => string;
  loading?: boolean;
  emptyText?: string;
  className?: string;
  zebra?: boolean;
  compact?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyText = 'Tidak ada data',
  className,
  zebra,
  compact,
}: TableProps<T>) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className={clsx('table w-full', zebra && 'table-zebra', compact && 'table-compact')}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                <span className="loading loading-spinner loading-md" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-base-content/50">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={keyExtractor(row, idx)} className="hover">
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
