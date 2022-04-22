import React, { Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import { Transition } from '@headlessui/react'

import { twMerge } from 'tailwind-merge'

import { shrinkToValue } from '@/functions/shrinkToValue'
import { MayFunction } from '@/types/constants'

const DRAWER_STACK_ID = 'drawer-stack'
const placementClasses = {
  'from-left': {
    absolutePostion: 'left-0 top-0 bottom-0',
    translateFadeOut: '-translate-x-full'
  },
  'from-bottom': {
    absolutePostion: 'bottom-0 left-0 right-0',
    translateFadeOut: 'translate-y-full'
  },
  'from-right': {
    absolutePostion: 'right-0 top-0 bottom-0',
    translateFadeOut: 'translate-x-full'
  },
  'from-top': {
    absolutePostion: 'top-0 left-0 right-0',
    translateFadeOut: '-translate-y-full'
  }
}

export interface DrawerProps {
  className?: string
  style?: React.CSSProperties
  children?: MayFunction<
    ReactNode,
    [
      {
        close(): void
      }
    ]
  >
  open: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
  transitionSpeed?: 'fast' | 'normal'
  // if content is scrollable, PLEASE open it!!!, for blur will make scroll super fuzzy
  maskNoBlur?: boolean
  onOpen?: () => void
  onOpenTransitionEnd?: () => void
  onClose?: () => void
  /** fired when close transform effect is end */
  onCloseTransitionEnd?(): void
}

export default function Drawer({
  className,
  style,
  children,
  open,
  placement = 'from-left',
  transitionSpeed = 'normal',
  maskNoBlur,
  onOpen,
  onOpenTransitionEnd,
  onClose,
  onCloseTransitionEnd
}: DrawerProps) {
  const drawerContentRef = useRef<HTMLDivElement>(null)

  /** get Draw Stack Element from screen*/
  let drawerStackElement = document?.getElementById?.(DRAWER_STACK_ID)
  if (!drawerStackElement) {
    const stack = document?.createElement('div')
    stack.id = DRAWER_STACK_ID
    stack.classList.add('fixed', 'z-drawer', 'inset-0', 'self-pointer-events-none')
    document?.body?.appendChild(stack)
    drawerStackElement = stack
  }
  if (!drawerStackElement) return null

  // for onCloseTransitionEnd
  // during leave transition, open is still true, but innerOpen is false, so transaction will happen without props:open has change (if open is false, React may destory this component immediately)
  const [innerOpen, setInnerOpen] = useState(open)
  useEffect(() => {
    setInnerOpen(open)
  }, [open])

  const openDrawer = () => setInnerOpen(true)
  const closeDrawer = () => setInnerOpen(false)
  const toggleDrawer = () => setInnerOpen((b) => !b)

  if (!open) return null
  return ReactDOM.createPortal(
    <Transition
      className="absolute inset-0"
      appear
      show={innerOpen}
      beforeEnter={onOpen}
      afterEnter={onOpenTransitionEnd}
      beforeLeave={onClose}
      afterLeave={onCloseTransitionEnd}
    >
      <Transition.Child
        as={Fragment}
        enter={`ease-out ${transitionSpeed === 'fast' ? 'duration-150' : 'duration-300'} transition`}
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave={`ease-in ${transitionSpeed === 'fast' ? 'duration-100' : 'duration-200'} transition`}
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={`absolute inset-0 ${maskNoBlur ? '' : 'backdrop-filter backdrop-blur'} bg-[rgba(25,19,88,0.5)]`}
          onClick={closeDrawer}
        ></div>
      </Transition.Child>
      <Transition.Child
        as={Fragment}
        enter={`ease-out ${transitionSpeed === 'fast' ? 'duration-150' : 'duration-300'} transform transition`}
        enterFrom={`${placementClasses[placement].translateFadeOut}`}
        enterTo=""
        leave={`ease-out ${transitionSpeed === 'fast' ? 'duration-150' : 'duration-300'} transform transition`}
        leaveFrom=""
        leaveTo={`${placementClasses[placement].translateFadeOut}`}
      >
        <div
          className={twMerge(`absolute ${placementClasses[placement].absolutePostion}`, className)}
          style={style}
          ref={drawerContentRef}
        >
          {shrinkToValue(children, [{ open: openDrawer, close: closeDrawer, toggle: toggleDrawer }])}
        </div>
      </Transition.Child>
    </Transition>,
    drawerStackElement
  )
}
