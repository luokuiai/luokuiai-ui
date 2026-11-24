'use client'

import { createElement as h, forwardRef } from 'react'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'

export interface DashboardShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Host toolbar, or a title and actions composed with DashboardToolbar. */
  toolbar?: ReactNode
}

export function DashboardShell({ toolbar, children, className = 'lk-dashboard', ...props }: DashboardShellProps): ReactElement {
  return h('div', { ...props, className }, toolbar, children)
}

export interface DashboardToolbarProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode
  actions?: ReactNode
}

export function DashboardToolbar({ heading, actions, className = 'lk-dashboard-toolbar', ...props }: DashboardToolbarProps): ReactElement {
  return h('div', { ...props, className }, heading, actions)
}

/** Owns the scroll/viewport element, not the grid engine or filter state. */
export const DashboardCanvas = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DashboardCanvas(
  { className = 'lk-dashboard-canvas', ...props }, ref,
) {
  return h('div', { ...props, ref, className })
})

export function DashboardGrid({ className = 'lk-dashboard-grid', ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return h('div', { ...props, className })
}

export interface DashboardMetricProps extends HTMLAttributes<HTMLElement> {
  label: ReactNode
  value: ReactNode
  detail?: ReactNode
}

export function DashboardMetric({ label, value, detail, children, className = 'lk-dashboard-metric', ...props }: DashboardMetricProps): ReactElement {
  return h('article', { ...props, className },
    h('div', { className: 'lk-dashboard-metric__label' }, label),
    h('div', { className: 'lk-dashboard-metric__value' }, value),
    detail == null ? null : h('div', { className: 'lk-dashboard-metric__detail' }, detail),
    children)
}
