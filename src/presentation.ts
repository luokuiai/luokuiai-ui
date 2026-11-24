import type { createElement, forwardRef, HTMLAttributes, ReactElement, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

type Classes = (...values: (string | undefined)[]) => string
const join: Classes = (...values) => values.filter(Boolean).join(' ')

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string
}

export type TablePart = 'wrapper' | 'table' | 'header' | 'body' | 'footer' | 'row' | 'head' | 'cell' | 'caption'
export interface TableOptions {
  classes?: Partial<Record<TablePart, string>>
  mergeClasses?: Classes
}

export function createTablePrimitives(react: { createElement: typeof createElement; forwardRef: typeof forwardRef }, options: TableOptions = {}) {
  const { createElement: h, forwardRef: withRef } = react
  const { classes = {}, mergeClasses = join } = options
  const css = (part: TablePart, custom?: string) => mergeClasses(classes[part], custom) || undefined
  const Table = withRef<HTMLTableElement, TableProps>(function Table({ wrapperClassName, className, ...props }, ref) {
    return h('div', { className: css('wrapper', wrapperClassName) }, h('table', { ...props, ref, className: css('table', className) }))
  })
  const TableHeader = withRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader({ className, ...props }, ref) {
    return h('thead', { ...props, ref, className: css('header', className) })
  })
  const TableBody = withRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody({ className, ...props }, ref) {
    return h('tbody', { ...props, ref, className: css('body', className) })
  })
  const TableFooter = withRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableFooter({ className, ...props }, ref) {
    return h('tfoot', { ...props, ref, className: css('footer', className) })
  })
  const TableRow = withRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow({ className, ...props }, ref) {
    return h('tr', { ...props, ref, className: css('row', className) })
  })
  const TableHead = withRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(function TableHead({ className, ...props }, ref) {
    return h('th', { ...props, ref, className: css('head', className) })
  })
  const TableCell = withRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(function TableCell({ className, ...props }, ref) {
    return h('td', { ...props, ref, className: css('cell', className) })
  })
  const TableCaption = withRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption({ className, ...props }, ref) {
    return h('caption', { ...props, ref, className: css('caption', className) })
  })
  return { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption }
}

export interface ChartFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Present a caller-owned loading/empty/error view instead of the chart. */
  placeholder?: ReactNode
}

export function createChartFrame(h: typeof createElement) {
  return function ChartFrame({ placeholder, children, ...props }: ChartFrameProps): ReactElement {
    return h('div', props, placeholder ?? children)
  }
}
