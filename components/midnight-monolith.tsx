"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  drift: number
  phase: number
  layer: number // Added layer for parallax
}

export default function MidnightMonolith() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)
  const [loadingText, setLoadingText] = useState("Establishing secure connection…")
  const [showLoader, setShowLoader] = useState(true)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { damping: 30, stiffness: 100, mass: 1 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoadingText("Secure connection established.")
    }, 2000)

    const timer2 = setTimeout(() => {
      setShowLoader(false)
    }, 3200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // Initialize particles - reduced count, added parallax layers
  useEffect(() => {
    setMounted(true)
    const newParticles: Particle[] = []
    for (let i = 0; i < 35; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.2 + 0.03,
        speed: Math.random() * 0.008 + 0.002, // slower drift
        drift: Math.random() * 0.2 - 0.1,
        phase: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3), // 0 = far, 1 = mid, 2 = near
      })
    }
    setParticles(newParticles)
  }, [])

  // Animate particles - slower, no falling motion
  useEffect(() => {
    if (!mounted) return
    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.005
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + Math.sin(time * 0.5 + p.phase) * p.speed + 100) % 100,
          x: (p.x + Math.sin(time + p.phase) * p.drift * 0.03 + 100) % 100,
        })),
      )
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [mounted])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <motion.p
              key={loadingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{
                opacity: { duration: 0.15, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" },
              }}
              className="font-mono text-xs tracking-[0.15em] sm:text-sm"
              style={{ color: "rgba(255, 250, 240, 0.5)" }}
            >
              {loadingText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-screen w-full overflow-hidden bg-black"
      >
        {/* Radial vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-50 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Reactor rings */}
        <ReactorCore smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />

        {/* Dust particles with parallax */}
        <div className="pointer-events-none absolute inset-0">
          {particles.map((particle) => {
            const parallaxMultiplier = [0.02, 0.05, 0.1][particle.layer]
            const mx = (smoothMouseX.get() - 0.5) * parallaxMultiplier * 100
            const my = (smoothMouseY.get() - 0.5) * parallaxMultiplier * 100

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `calc(${particle.x}% + ${mx}px)`,
                  top: `calc(${particle.y}% + ${my}px)`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: `rgba(255, 250, 240, ${particle.opacity})`,
                  boxShadow: `0 0 ${particle.size * 2}px rgba(255, 250, 240, ${particle.opacity * 0.3})`,
                }}
              />
            )
          })}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          {/* Title with refraction effect */}
          <RefractionTitle smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2 }}
            className="mt-8 font-sans text-xs tracking-[0.4em] text-stone-500/50"
          >
            Software & Systems
          </motion.p>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 2 }}
          className="absolute bottom-6 left-0 right-0 z-10 text-center"
        >
          <p className="font-sans text-[10px] tracking-[0.3em] text-stone-700/40">camadkins.com ©</p>
        </motion.footer>
      </div>
    </>
  )
}

interface ReactorProps {
  smoothMouseX: ReturnType<typeof useSpring>
  smoothMouseY: ReturnType<typeof useSpring>
}

function ReactorCore({ smoothMouseX, smoothMouseY }: ReactorProps) {
  const [distortion, setDistortion] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)

  // Slow rotation animation
  useEffect(() => {
    let animationId: number
    const startTime = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      setRotation((elapsed / 25) * 360) // Full rotation every 25 seconds
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  useEffect(() => {
    const unsubX = smoothMouseX.on("change", updateDistortion)
    const unsubY = smoothMouseY.on("change", updateDistortion)

    function updateDistortion() {
      const mx = smoothMouseX.get() - 0.5
      const my = smoothMouseY.get() - 0.5
      setDistortion({ x: mx * 40, y: my * 40 })
    }

    return () => {
      unsubX()
      unsubY()
    }
  }, [smoothMouseX, smoothMouseY])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Inner core - warm white glow with breathing pulse */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute rounded-full"
        style={{
          width: "180px",
          height: "180px",
          background:
            "radial-gradient(circle, rgba(255, 248, 235, 0.5) 0%, rgba(255, 248, 235, 0.15) 40%, transparent 70%)",
          filter: "blur(30px)",
          transform: `translate(${distortion.x * 0.15}px, ${distortion.y * 0.15}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Secondary inner glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.22, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute rounded-full"
        style={{
          width: "280px",
          height: "280px",
          background: "radial-gradient(circle, rgba(255, 250, 240, 0.25) 0%, transparent 60%)",
          filter: "blur(50px)",
          transform: `translate(${distortion.x * 0.12}px, ${distortion.y * 0.12}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Outer rotating ring with ripple distortion */}
      <motion.div
        animate={{
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute rounded-full border"
        style={{
          width: "420px",
          height: "420px",
          borderColor: "rgba(255, 250, 240, 0.15)",
          borderWidth: "1px",
          transform: `rotate(${rotation}deg) translate(${distortion.x * 0.08}px, ${distortion.y * 0.08}px) scaleX(${1 + distortion.x * 0.001}) scaleY(${1 + distortion.y * 0.001})`,
          transition: "transform 0.5s ease-out",
        }}
      />

      {/* Second outer ring - counter rotation */}
      <motion.div
        animate={{
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute rounded-full border"
        style={{
          width: "520px",
          height: "520px",
          borderColor: "rgba(255, 250, 240, 0.08)",
          borderWidth: "1px",
          transform: `rotate(${-rotation * 0.7}deg) translate(${distortion.x * 0.06}px, ${distortion.y * 0.06}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />

      {/* Expanding ripple pulses */}
      <motion.div
        className="absolute rounded-full border"
        animate={{
          scale: [0.3, 1.8],
          opacity: [0.2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeOut",
        }}
        style={{
          width: "300px",
          height: "300px",
          borderColor: "rgba(255, 250, 240, 0.1)",
          transform: `translate(${distortion.x * 0.1}px, ${distortion.y * 0.1}px)`,
        }}
      />
      <motion.div
        className="absolute rounded-full border"
        animate={{
          scale: [0.3, 1.8],
          opacity: [0.2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeOut",
          delay: 3,
        }}
        style={{
          width: "300px",
          height: "300px",
          borderColor: "rgba(255, 250, 240, 0.1)",
          transform: `translate(${distortion.x * 0.1}px, ${distortion.y * 0.1}px)`,
        }}
      />

      {/* Crimson aura - left side */}
      <motion.div
        animate={{
          opacity: [0.06, 0.1, 0.06],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute rounded-full"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(100, 35, 40, 0.6) 0%, transparent 55%)",
          filter: "blur(80px)",
          transform: `translate(${-120 + distortion.x * 0.25}px, ${distortion.y * 0.25}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Forest green aura - right side */}
      <motion.div
        animate={{
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute rounded-full"
        style={{
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(35, 70, 50, 0.6) 0%, transparent 55%)",
          filter: "blur(70px)",
          transform: `translate(${120 + distortion.x * 0.25}px, ${distortion.y * 0.25}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />
    </div>
  )
}

function RefractionTitle({ smoothMouseX, smoothMouseY }: ReactorProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0, skew: 0, scale: 1 })

  useEffect(() => {
    const unsubX = smoothMouseX.on("change", updateOffset)
    const unsubY = smoothMouseY.on("change", updateOffset)

    function updateOffset() {
      if (!titleRef.current) return

      const rect = titleRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseXPx = smoothMouseX.get() * window.innerWidth
      const mouseYPx = smoothMouseY.get() * window.innerHeight

      const dx = mouseXPx - centerX
      const dy = mouseYPx - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      const maxDist = 400
      const influence = Math.max(0, 1 - distance / maxDist)
      const eased = influence * influence

      setOffset({
        x: (dx / maxDist) * 12 * eased,
        y: (dy / maxDist) * 6 * eased,
        skew: (dx / maxDist) * 3 * eased,
        scale: 1 + eased * 0.02, // subtle scale for lens effect
      })
    }

    return () => {
      unsubX()
      unsubY()
    }
  }, [smoothMouseX, smoothMouseY])

  return (
    <motion.div
      ref={titleRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative select-none"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) skewX(${offset.skew}deg) scale(${offset.scale})`,
        transition: "transform 0.15s ease-out",
      }}
    >
      <h1
        className="font-sans text-4xl font-extralight tracking-[0.35em] sm:text-5xl md:text-6xl lg:text-7xl"
        style={{
          color: "rgba(255, 250, 240, 0.92)",
          textShadow: "0 0 80px rgba(255, 250, 240, 0.2), 0 0 160px rgba(255, 250, 240, 0.08)",
        }}
      >
        CAM ADKINS
      </h1>
    </motion.div>
  )
}
