'use client'
import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/** Score count-up (useSpring). */
export function AnimatedNumber({
  value,
  format = v => Math.round(v).toString(),
  className,
}: {
  value: number
  format?: (v: number) => string
  className?: string
}) {
  const spring = useSpring(value, { stiffness: 90, damping: 20 })
  const display = useTransform(spring, format)
  useEffect(() => { spring.set(value) }, [spring, value])
  return <motion.span className={className}>{display}</motion.span>
}
