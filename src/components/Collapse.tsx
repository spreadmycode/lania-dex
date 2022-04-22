import React, { CSSProperties, ReactNode, RefObject, useMemo, useRef } from 'react'

import { Transition } from '@headlessui/react'

import { twMerge } from 'tailwind-merge'

import { pickReactChildProps } from '@/functions/react/pickChild'
import { shrinkToValue } from '@/functions/shrinkToValue'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect '
import useToggle from '@/hooks/useToggle'

type CollapseController = {
  open: () => void
  close: () => void
  toggle: () => void
}
/**
 * default **uncontrolled** Kit
 */
export default function Collapse({
  children = null as ReactNode,
  className = '',
  style,
  defaultOpen = false,
  open,
  openDirection = 'downwards',
  onOpen,
  onClose,
  onToggle,
  closeByOutsideClick
}: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** only first render */
  defaultOpen?: boolean
  /** it's change will cause ui change */
  open?: boolean
  /** (maybe not have to this, cause writing of collapseFace and collapseBody can express this ) */
  openDirection?: 'downwards' | 'upwards'
  onOpen?(): void
  onClose?(): void
  onToggle?(): void
  closeByOutsideClick?: boolean
}) {
  const [innerOpen, { toggle, off, on, set }] = useToggle(defaultOpen, {
    onOff: onClose,
    onOn: onOpen,
    onToggle: onToggle
  })

  useIsomorphicLayoutEffect(() => {
    set(Boolean(open))
  }, [open])

  const collapseFaceProps = pickReactChildProps(children, CollapseFace)
  const collapseBodyProps = pickReactChildProps(children, CollapseBody)
  const collapseBodyRef = useRef<HTMLDivElement>(null)
  const bodyHeight = useRef<number>()
  const collapseRef = useRef<HTMLDivElement>(null)

  useClickOutside(collapseRef, { disable: !closeByOutsideClick, onClickOutSide: off })

  const controller = useMemo<CollapseController>(
    () => ({
      open: on,
      close: off,
      toggle: toggle
    }),
    [on, off]
  )

  return (
    <div ref={collapseRef} className={`Collapse flex flex-col ${className}`} style={style}>
      <CollapseFace
        {...collapseFaceProps}
        onClick={toggle}
        className={twMerge(
          `filter hover:brightness-90 cursor-pointer ${openDirection === 'downwards' ? '' : 'order-2'}`,
          collapseFaceProps?.className
        )}
        $open={innerOpen}
        $controller={controller}
      />
      <Transition
        show={innerOpen}
        enter="transition-all duration-300 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        beforeEnter={() => {
          // <CollapseBody> must have init height to let <Transition> work
          // But don't know why
          collapseBodyRef.current?.style.removeProperty('height')
          // record true <CollapseBody> height
          if (!bodyHeight.current) {
            bodyHeight.current = collapseBodyRef.current?.clientHeight
          }

          // force <CollapseBody> to have height. which is the base of transition
          collapseBodyRef.current?.style.setProperty('height', '0')

          // get a layout property to manually to force the browser to layout the above code.
          // So trick. But have to.🤯🤯🤯🤯
          collapseBodyRef.current?.clientHeight

          // force <CollapseBody> to have content height. which is the aim of transition
          collapseBodyRef.current?.style.setProperty('height', bodyHeight.current + 'px')
          collapseBodyRef.current?.style.setProperty('user-select', 'none')
        }}
        afterEnter={() => {
          collapseBodyRef.current?.style.removeProperty('height')
          collapseBodyRef.current?.style.setProperty('user-select', 'auto')
        }}
        beforeLeave={() => {
          // force <CollapseBody> to have height. which is the base of transition
          collapseBodyRef.current?.style.setProperty('height', bodyHeight.current + 'px')

          // get a layout property to manually to force the browser to layout the above code.
          // So trick. But have to.🤯🤯🤯🤯
          collapseBodyRef.current?.clientHeight

          // force <CollapseBody> to have content height. which is the aim of transition
          collapseBodyRef.current?.style.setProperty('height', '0px')
          collapseBodyRef.current?.style.setProperty('user-select', 'none')
        }}
      >
        <CollapseBody
          domRef={collapseBodyRef}
          {...collapseBodyProps}
          className={twMerge(
            `transition-all duration-300 ease-in-out select-none overflow-hidden ${
              openDirection === 'downwards' ? '' : 'order-1'
            }`,
            collapseBodyProps?.className
          )}
          style={{ height: '0' }}
          $open={innerOpen}
          $controller={controller}
        />
      </Transition>
    </div>
  )
}

function CollapseFace(props: {
  onClick?: () => void
  className?: string
  children?: ReactNode | ((open: boolean, controller: CollapseController) => ReactNode)
  $open?: boolean
  $controller?: CollapseController
}) {
  return (
    <div onClick={props.onClick} className={`CollapseFace ${props.className ?? ''}`}>
      {shrinkToValue(props.children, [Boolean(props.$open), props.$controller])}
    </div>
  )
}
function CollapseBody(props: {
  style?: CSSProperties
  children?: ReactNode | ((open: boolean, controller: CollapseController) => ReactNode)
  className?: string
  domRef?: RefObject<HTMLDivElement>
  $open?: boolean
  $controller?: CollapseController
}) {
  return (
    <div ref={props.domRef} style={props.style} className={`CollapseBody ${props.className ?? ''}`}>
      {shrinkToValue(props.children, [Boolean(props.$open), props.$controller])}
    </div>
  )
}

Collapse.Face = CollapseFace
Collapse.Body = CollapseBody
