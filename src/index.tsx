'use client'

import { createElement, forwardRef } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { createListSection } from './list-section.js'
import { createChartFrame, createTablePrimitives } from './presentation.js'

export type { ListSectionProps } from './list-section.js'
export type { ChartFrameProps, TableOptions, TableProps } from './presentation.js'

export const ListSection = createListSection(createElement)
export const ChartFrame = createChartFrame(createElement)
export const { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } = createTablePrimitives(
  { createElement, forwardRef }, { classes: { wrapper: 'lk-table-scroll', table: 'lk-table' } }
)

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  values: readonly (number | null)[]
}

/** Small, non-interactive trend. Hover, zoom and large series belong to a chart engine. */
export function Sparkline({ label, values, className, ...props }: SparklineProps) {
  const isPoint = (value: number | null): value is number => value !== null && Number.isFinite(value)
  let low = Infinity, high = -Infinity
  for (const point of values) if (isPoint(point)) { low = Math.min(low, point); high = Math.max(high, point) }
  const scale = Math.max(1, Math.abs(low), Math.abs(high))
  const span = high / scale - low / scale
  const points: { x: number; y: number; move: boolean }[] = []
  values.forEach((value, index) => {
    if (!isPoint(value)) return
    const x = values.length < 2 ? 50 : 2 + 96 * index / (values.length - 1)
    const y = span ? 30 - 28 * ((value / scale - low / scale) / span) : 16
    points.push({ x, y, move: index === 0 || !isPoint(values[index - 1]) })
  })
  return <div {...props} role="img" aria-label={label} className={classes('lk-sparkline', className)}>
    <svg viewBox="0 0 100 32" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <path d={points.map(({ x, y, move }) => `${move ? 'M' : 'L'}${x} ${y}`).join(' ')} fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      {points.map(({ x, y, move }, index) => move && (!points[index + 1] || points[index + 1].move) ? <circle key={index} cx={x} cy={y} r={1.5} fill="currentColor" /> : null)}
    </svg>
  </div>
}

function classes(base: string, custom?: string) {
  return custom ? `${base} ${custom}` : base
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark' | 'system'
}

export function ThemeScope({ theme = 'system', className, ...props }: ThemeScopeProps) {
  return <div {...props} className={classes('lk-theme', className)} data-lk-theme={theme} />
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  sidebar?: ReactNode
  sidebarLabel?: string
  header?: ReactNode
}

export function AppShell({ sidebar, sidebarLabel, header, children, className, ...props }: AppShellProps) {
  return <div {...props} className={classes('lk-shell', className)} data-lk-sidebar={sidebar != null && sidebar !== false ? '' : undefined}>
    {sidebar != null && sidebar !== false && <aside aria-label={sidebarLabel} className="lk-shell__sidebar">{sidebar}</aside>}
    <div className="lk-shell__body">
      {header != null && header !== false && <div className="lk-shell__header">{header}</div>}
      <div className="lk-shell__content">{children}</div>
    </div>
  </div>
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export function Card({ title, description, actions, footer, headingLevel = 2, children, className, ...props }: CardProps) {
  const Heading = `h${headingLevel}` as const
  return <article {...props} className={classes('lk-card', className)}>
    {(title != null || description != null || actions != null) && <header className="lk-card__header">
      <div className="lk-card__intro">
        {title != null && <Heading className="lk-card__title">{title}</Heading>}
        {description != null && <div className="lk-card__description">{description}</div>}
      </div>
      {actions != null && <div className="lk-card__actions">{actions}</div>}
    </header>}
    <div className="lk-card__body">{children}</div>
    {footer != null && <footer className="lk-card__footer">{footer}</footer>}
  </article>
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', type = 'button', className, ...props }, ref
) {
  return <button {...props} ref={ref} type={type} className={classes('lk-button', className)} data-lk-variant={variant} data-lk-size={size} />
})

export interface IconButtonProps extends Omit<ButtonProps, 'aria-label' | 'children'> {
  'aria-label': string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, className, ...props }, ref
) {
  return <Button {...props} ref={ref} className={classes('lk-button--icon', className)}>
    <span className="lk-button__glyph" aria-hidden="true">{children}</span>
  </Button>
})
