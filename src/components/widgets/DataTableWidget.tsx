import React, { useState } from 'react';
import { DataTableWidget as IDataTableWidget } from '../../types/report';
import { Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface TableProps {
  widget: IDataTableWidget;
}

export const DataTableWidget: React.FC<TableProps> = ({ widget }) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const columns = widget.columns || [];
  const rawRows = widget.rows || [];

  // Filter rows by search term
  const filteredRows = rawRows.filter((row) => {
    if (!search.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];

    // Clean numbers like "$147,200" or "4.79%"
    const cleanNum = (v: any) => {
      if (typeof v === 'number') return v;
      const num = parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? String(v) : num;
    };

    const parsedA = cleanNum(aVal);
    const parsedB = cleanNum(bVal);

    if (parsedA < parsedB) return sortAsc ? -1 : 1;
    if (parsedA > parsedB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      setSortAsc(false); // default descending for metrics
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
          {widget.description && <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter table rows..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-1 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <span>{col.label}</span>
                    {sortCol === col.key ? (
                      sortAsc ? (
                        <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-slate-400 text-xs">
                  No matching data found
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors group">
                  {columns.map((col) => {
                    const val = row[col.key];
                    const isRight = col.align === 'right';
                    const isCenter = col.align === 'center';
                    return (
                      <td
                        key={col.key}
                        className={`py-2.5 px-3 font-medium text-slate-700 ${
                          isRight ? 'text-right font-mono' : isCenter ? 'text-center' : 'text-left'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
        <span>Showing {sortedRows.length} of {rawRows.length} rows</span>
        <span>Google Looker Studio Data Grid</span>
      </div>
    </div>
  );
};
