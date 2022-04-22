import React, { ReactNode, RefObject, useImperativeHandle, useRef } from 'react'

import { twMerge } from 'tailwind-merge'

import { isArray } from '@/functions/judgers/dateType'
import { shrinkToValue } from '@/functions/shrinkToValue'
import { useClick } from '@/hooks/useClick'
import { AnyFn, BooleanLike, MayFunction } from '@/types/constants'
import { MayArray } from '@/types/generics'

export interface ButtonHandle {
  click?: () => void
  focus?: () => void
}
export interface ButtonProps {
  size?: 'md' | 'sm' | 'lg' | 'default'
  // used in "connect wallet" button, it's order is over props: disabled
  forceActive?: boolean
  /** a short cut for validator */
  disabled?: boolean
  /** default is solid */
  type?: 'solid' | 'outline' | 'text'
  /** unused tailwind style class string will be tree-shaked  */
  className?: string
  isLoading?: boolean // TODO: imply it
  /** must all condition passed */
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFunction<BooleanLike>
    // used in "connect wallet" button, it's order is over props: disabled
    forceActive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<ButtonProps, 'validators' | 'disabled'>
  }>
  children?: ReactNode
  onClick?: AnyFn
  componentRef?: RefObject<any>
}

/** has loaded **twMerge** */
export default function Button({ validators, ...restProps }: ButtonProps) {
  const failedValidator = (isArray(validators) ? validators.length > 0 : validators)
    ? [validators!].flat().find(({ should }) => !shrinkToValue(should))
    : undefined
  const mergedProps = {
    ...restProps,
    ...failedValidator?.fallbackProps
  }
  const { type = 'solid', className = '', size, children, onClick, componentRef } = mergedProps

  const isActive = failedValidator?.forceActive || (!failedValidator && !mergedProps.disabled)
  const disable = !isActive

  const ref = useRef<HTMLButtonElement>(null)
  useImperativeHandle(componentRef, () => ({
    click: () => {
      ref.current?.click()
    },
    focus: () => {
      ref.current?.focus()
    }
  }))
  return (
    <button
      ref={ref}
      onClick={() => {
        if (!disable) onClick?.()
      }}
      className={twMerge(
        'Button',
        type === 'text'
          ? textButtonTailwind({ size, disable })
          : type === 'outline'
          ? outlineButtonTailwind({ size, disable })
          : solidButtonTailwind({ size, disable }),
        className
      )}
    >
      {children}
    </button>
  )
}

/** base inner <Button> style  */
function solidButtonTailwind({
  size = 'default',
  disable
}: { size?: 'md' | 'sm' | 'lg' | 'default'; disable?: boolean } = {}) {
  return `${
    size === 'default'
      ? 'px-4 py-2.5  rounded-xl mobile:rounded-lg'
      : size === 'sm'
      ? 'px-2.5 py-1.5 text-sm rounded-lg mobile:rounded-md'
      : 'py-4 px-4 rounded-xl mobile:rounded-lg'
  } whitespace-nowrap appearance-none inline-block font-medium ${
    disable
      ? 'bg-formkit-thumb-disable text-formkit-thumb-text-disabled opacity-50 cursor-not-allowed'
      : 'bg-formkit-thumb text-formkit-thumb-text-normal clickable clickable-filter-effect'
  }`
}

/** extra inner <Button> style */
function outlineButtonTailwind({
  size = 'default',
  disable
}: { size?: 'md' | 'sm' | 'lg' | 'default'; disable?: boolean } = {}) {
  return `${
    size === 'default'
      ? 'px-4 py-2.5  rounded-xl mobile:rounded-lg'
      : size === 'sm'
      ? 'px-2.5 py-1.5 text-sm rounded-lg mobile:rounded-md'
      : 'py-4 px-4 rounded-xl mobile:rounded-lg'
  } whitespace-nowrap appearance-none inline-block ring-formkit-thumb ring-1 text-primary ${
    disable ? 'opacity-30 cursor-not-allowed' : 'clickable clickable-filter-effect'
  }`
}

/** extra inner <Button> style */
function textButtonTailwind({
  size = 'default',
  disable
}: { size?: 'md' | 'sm' | 'lg' | 'default'; disable?: boolean } = {}) {
  return `${
    size === 'default'
      ? 'px-4 py-2.5  rounded-xl mobile:rounded-lg'
      : size === 'sm'
      ? 'px-2.5 py-1.5 text-sm rounded-lg mobile:rounded-md'
      : 'py-4 px-4 rounded-xl mobile:rounded-lg'
  } whitespace-nowrap appearance-none inline-block text-white ${
    disable ? 'opacity-30 cursor-not-allowed' : 'clickable clickable-filter-effect'
  }`
}
