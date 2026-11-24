"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value)
      }, delay * 1000)
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
    }
  }, [motionValue, isInView, delay, value, direction, startValue])

  useEffect(
    () =>
      springValue.on("change", (latest: number) => {
        if (ref.current) {
          const formatted = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
          ref.current.textContent = `${prefix}${formatted}${suffix}`
        }
      }),
    [springValue, decimalPlaces, prefix, suffix]
  )

  const initialFormatted = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(startValue.toFixed(decimalPlaces)))

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider text-inherit",
        className
      )}
      {...props}
    >
      {prefix}{initialFormatted}{suffix}
    </span>
  )
}

export interface SmartNumberTickerProps extends Omit<NumberTickerProps, "value"> {
  value: string | number
}

export function SmartNumberTicker({
  value,
  className,
  delay = 0,
  decimalPlaces,
  direction = "up",
  startValue = 0,
  prefix = "",
  suffix = "",
  ...props
}: SmartNumberTickerProps) {
  if (typeof value === "number") {
    const decimals = decimalPlaces !== undefined ? decimalPlaces : (Number.isInteger(value) ? 0 : 1)
    return (
      <NumberTicker
        value={value}
        startValue={startValue}
        direction={direction}
        delay={delay}
        decimalPlaces={decimals}
        prefix={prefix}
        suffix={suffix}
        className={className}
        {...props}
      />
    )
  }

  const str = String(value ?? "").trim()
  if (!str) {
    return null
  }

  // Regex to extract leading prefix, number (with optional commas & decimals), and trailing suffix
  const match = str.match(/^([^\d.]*?)([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)(.*)$/)
  if (!match) {
    return <span className={className}>{str}</span>
  }

  const extractedPrefix = prefix || match[1]
  const rawNumStr = match[2].replace(/,/g, "")
  const extractedSuffix = (match[3] || "") + (suffix || "")
  const parsedNum = parseFloat(rawNumStr)

  if (isNaN(parsedNum)) {
    return <span className={className}>{str}</span>
  }

  const detectedDecimals = rawNumStr.includes(".") ? rawNumStr.split(".")[1].length : 0
  const finalDecimals = decimalPlaces !== undefined ? decimalPlaces : detectedDecimals

  return (
    <NumberTicker
      value={parsedNum}
      startValue={startValue}
      direction={direction}
      delay={delay}
      decimalPlaces={finalDecimals}
      prefix={extractedPrefix}
      suffix={extractedSuffix}
      className={className}
      {...props}
    />
  )
}
