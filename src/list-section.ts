import type { createElement, HTMLAttributes, ReactElement, ReactNode } from 'react'

export interface ListSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  heading?: ReactNode
  headingClassName?: string
  before?: ReactNode
  after?: ReactNode
  children?: ReactNode
}

/** A host can inject its own React runtime (including classic script loaders). */
export function createListSection(h: typeof createElement) {
  return function ListSection({ heading, headingClassName, before, after, children, ...props }: ListSectionProps): ReactElement {
    return h('section', props,
      heading == null ? null : h('div', { className: headingClassName }, heading),
      before, children, after)
  }
}
