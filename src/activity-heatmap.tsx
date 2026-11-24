import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'

interface HeatmapCell {
  row: number
  column: number
}

interface ActivityHeatmapProps<Cell extends HeatmapCell> extends ComponentPropsWithoutRef<'div'> {
  rows: number
  columns: number
  cells: readonly Cell[]
  columnLabels: readonly { column: number; label: string; title?: string }[]
  rowLabels?: readonly { row: number; label: string }[]
  scrollRef?: Ref<HTMLDivElement>
  getCellKey: (cell: Cell) => string
  gridProps?: ComponentPropsWithoutRef<'ol'>
  renderCell: (cell: Cell) => ReactNode
}

export function ActivityHeatmap<Cell extends HeatmapCell>({
  rows, columns, cells, columnLabels, rowLabels = [], scrollRef, gridProps, getCellKey, renderCell, ...props
}: ActivityHeatmapProps<Cell>) {
  const { className, ...scrollProps } = props
  const columnTracks = `repeat(${columns}, minmax(var(--lk-heatmap-cell-min), 1fr))`
  const rowTracks = `repeat(${rows}, 1fr)`

  return (
    <div {...scrollProps} ref={scrollRef} className={['lk-heatmap', className].filter(Boolean).join(' ')}>
      <div
        className="lk-heatmap__layout"
        data-row-labels={rowLabels.length > 0 || undefined}
        style={{ maxInlineSize: `calc(${columns} * (var(--lk-heatmap-cell-max) + var(--lk-heatmap-gap))${rowLabels.length ? ' + 64px' : ''})` }}
      >
        <div className="lk-heatmap__column-labels" style={{ gridTemplateColumns: columnTracks }}>
          {columnLabels.map(({ column, label, title }) => (
            <span key={column} title={title} style={{ gridRow: 1, gridColumn: `${column + 1} / span ${Math.min(4, columns - column)}` }}>
              {label}
            </span>
          ))}
        </div>
        {rowLabels.length > 0 && (
          <div className="lk-heatmap__row-labels" style={{ gridTemplateRows: rowTracks }}>
            {rowLabels.map(({ row, label }) => <span key={row} style={{ gridRow: row + 1 }}>{label}</span>)}
          </div>
        )}
        <ol {...gridProps} data-rows={rows} data-columns={columns} className="lk-heatmap__grid" style={{ gridTemplateColumns: columnTracks, gridTemplateRows: rowTracks }}>
          {cells.map((cell) => (
            <li key={getCellKey(cell)} style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }}>
              {renderCell(cell)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
