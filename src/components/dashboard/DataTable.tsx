import { useState } from 'react';
import { LayoutGrid, List, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, Filter } from 'lucide-react';

export interface TableColumn {
    header: string;
    accessor: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    title?: string;
    columns: TableColumn[];
    data: any[];
    onDeleteSelected?: (ids: string[]) => void;
}

export default function DataTable({ title, columns, data = [], onDeleteSelected }: DataTableProps) {
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleSelectAll = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDelete = () => {
        if (onDeleteSelected) {
            onDeleteSelected(selectedItems);
            setSelectedItems([]);
        }
    };

    return (
        <div className="bg-[var(--bg-panel)] rounded-2xl lg:rounded-[32px] border border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col h-full animate-zoom-fade">
            {/* Header */}
            <div className="p-3 sm:p-6 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-canvas)]/50">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <h2 className="text-sm sm:text-xl font-black text-[var(--text-main)] tracking-tight uppercase italic">{title || 'Data Table'}</h2>
                        <span className="px-1.5 py-0.5 bg-[var(--bg-canvas)]/50 text-[var(--text-muted)] rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-tighter">
                            {data.length} items
                        </span>
                    </div>

                    {/* Compact View Toggle for Mobile */}
                    <div className="flex sm:hidden bg-[var(--bg-canvas)] p-1 rounded-xl">
                        <button
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-[var(--bg-panel)] text-[#FF4700] shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-[var(--bg-panel)] text-[#FF4700] shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                    {selectedItems.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-red-100 transition-all animate-in fade-in"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedItems.length})
                        </button>
                    )}

                    <div className="h-8 w-[1px] bg-[var(--border-subtle)] mx-2 hidden sm:block" />

                    <div className="hidden sm:flex bg-[var(--bg-canvas)] p-1 rounded-xl">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-[var(--bg-panel)] text-[#FF4700] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-[var(--bg-panel)] text-[#FF4700] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-[var(--bg-panel)]">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[var(--bg-canvas)] rounded-full flex items-center justify-center mb-6">
                            <Filter className="w-10 h-10 text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-[var(--text-muted)] max-w-xs text-sm font-medium leading-relaxed">
                            Não encontramos registros que correspondam aos seus critérios de busca. Tente ajustar os termos ou filtros.
                        </p>
                    </div>
                ) : view === 'list' ? (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full">
                            <thead className="bg-[var(--bg-canvas)]/50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === data.length && data.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-slate-300 text-[#FF4700] focus:ring-[#FF4700]"
                                            />
                                        </div>
                                    </th>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="px-3 lg:px-6 py-3 lg:py-4 text-left text-[9px] lg:text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                                            {col.header}
                                        </th>
                                    ))}
                                    <th className="px-3 lg:px-6 py-3 lg:py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {data.map((row, rowIdx) => (
                                    <tr key={row.id || rowIdx} className={`group hover:bg-[var(--bg-canvas)]/50 transition-colors ${selectedItems.includes(row.id) ? 'bg-orange-50/30' : ''}`}>
                                        <td className="px-3 lg:px-6 py-3 lg:py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(row.id)}
                                                onChange={() => toggleSelectItem(row.id)}
                                                className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-slate-300 text-[#FF4700] focus:ring-[#FF4700]"
                                            />
                                        </td>
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <div className="scale-90 lg:scale-100 origin-left">
                                                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-right">
                                            <button className="text-slate-300 hover:text-slate-600">
                                                <MoreHorizontal className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                        {data.map((row, idx) => (
                            <div
                                key={row.id || idx}
                                className={`relative bg-[var(--bg-panel)] rounded-xl lg:rounded-2xl border p-2.5 lg:p-4 hover:shadow-lg transition-all group ${selectedItems.includes(row.id) ? 'border-[#FF4700] ring-1 ring-[#FF4700]' : 'border-[var(--border-subtle)] hover:border-[#FF4700]/30'}`}
                                onClick={() => toggleSelectItem(row.id)}
                            >
                                <div className="absolute top-2.5 lg:top-4 left-2.5 lg:left-4 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(row.id)}
                                        onChange={(e) => { e.stopPropagation(); toggleSelectItem(row.id); }}
                                        className="w-4 h-4 lg:w-5 lg:h-5 rounded-md lg:rounded-lg border-slate-300 text-[#FF4700] focus:ring-[#FF4700]"
                                    />
                                </div>

                                {/* Render Grid Card Content */}
                                <div className="space-y-2 lg:space-y-4 pt-6 lg:pt-8">
                                    <div className="scale-90 lg:scale-100 origin-top">
                                        {columns.find(c => c.accessor === 'image_url')?.render
                                            ? columns.find(c => c.accessor === 'image_url')?.render!(row['image_url'], row)
                                            : (row.image_url && <img src={row.image_url} className="w-full h-24 lg:h-32 object-cover rounded-lg" />)
                                        }
                                    </div>

                                    <div className="space-y-1 lg:space-y-2">
                                        <div className="scale-90 lg:scale-100 origin-left">
                                            {columns.find(c => c.accessor === 'name')?.render
                                                ? columns.find(c => c.accessor === 'name')?.render!(row['name'], row)
                                                : <h3 className="font-bold text-[var(--text-main)] text-xs lg:text-base">{row.name}</h3>
                                            }
                                        </div>

                                        <div className="flex justify-between items-end mt-2 lg:mt-4 scale-90 lg:scale-100 origin-bottom">
                                            {columns.find(c => c.accessor === 'price')?.render
                                                ? columns.find(c => c.accessor === 'price')?.render!(row['price'], row)
                                                : <p className="font-bold text-[#FF4700] text-xs lg:text-base">{row.price}</p>
                                            }

                                            {columns.find(c => c.accessor === 'stock')?.render
                                                ? columns.find(c => c.accessor === 'stock')?.render!(row['stock'], row)
                                                : <p className="text-[10px] lg:text-xs text-[var(--text-muted)]">Stock: {row.stock}</p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Pagination Placeholder */}
            <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] bg-[var(--bg-canvas)]/50">
                <span>Mostrando {data.length} resultados</span>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-50" disabled><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-50" disabled><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}
