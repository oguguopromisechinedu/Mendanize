"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import * as THREE from "three"
import { BarChart2, Bot, Sparkles, TrendingUp } from "lucide-react"

type ChipPos = {
  yPct: number
  xSide: "left" | "right"
  xVal: string
  ySide: "top" | "bottom"
}

function chipStyle({ yPct, xSide, xVal, ySide }: ChipPos): CSSProperties {
  return {
    position: "absolute",
    [ySide]: `${yPct}%`,
    [xSide]: xVal,
  }
}

/** Three.js neural brain — MES-005 Premium Hero default visual. */
export function HeroBrainCanvas({ height = 380 }: { height?: number }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (failed) return
    const el = mountRef.current
    if (!el) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const W = el.clientWidth || 400
    const H = height

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000)
    camera.position.set(0, 0.3, 5.2)

    // Some browsers/GPUs cannot create a WebGL context. Fall back gracefully
    // to a CSS visual instead of throwing and crashing the whole page.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      queueMicrotask(() => setFailed(true))
      return
    }
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const bGeo = new THREE.SphereGeometry(1.35, 128, 128)
    const bp = bGeo.attributes.position
    for (let i = 0; i < bp.count; i++) {
      const x = bp.getX(i)
      const y = bp.getY(i)
      const z = bp.getZ(i)
      const r = Math.sqrt(x * x + y * y + z * z)
      const nx = x / r
      const ny = y / r
      const nz = z / r
      const fold =
        0.14 * Math.sin(nx * 7 + ny * 5) * Math.cos(nz * 6) +
        0.09 * Math.sin(ny * 11 - nz * 7) * Math.sin(nx * 6) +
        0.07 * Math.cos(nz * 9 + nx * 8) * Math.sin(ny * 10) +
        0.05 * Math.sin(nx * 15 - ny * 9 + nz * 8) +
        -0.07 * Math.exp(-ny * ny * 10) * Math.abs(nx)
      const nr = r + fold
      bp.setXYZ(i, nx * nr, ny * nr, nz * nr)
    }
    bGeo.computeVertexNormals()

    const bMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0.17, 0.05, 0.42),
      emissive: new THREE.Color(0.22, 0.07, 0.52),
      specular: new THREE.Color(0.45, 0.2, 0.95),
      shininess: 90,
      transparent: true,
      opacity: 0.93,
    })
    const brain = new THREE.Mesh(bGeo, bMat)

    const coreGeo = new THREE.SphereGeometry(0.85, 32, 32)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.18,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)

    const makeGlowShell = (r: number, color: number, opacity: number) => {
      const g = new THREE.SphereGeometry(r, 32, 32)
      const m = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.BackSide,
      })
      return new THREE.Mesh(g, m)
    }
    const glow1 = makeGlowShell(1.6, 0x7c3aed, 0.1)
    const glow2 = makeGlowShell(1.85, 0x4338ca, 0.06)
    const glow3 = makeGlowShell(2.15, 0x312e81, 0.03)

    const N = 220
    const pts: THREE.Vector3[] = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const ny = 1 - (i / (N - 1)) * 2
      const rr = Math.sqrt(1 - ny * ny)
      const theta = goldenAngle * i
      const nx = rr * Math.cos(theta)
      const nz = rr * Math.sin(theta)
      const fold =
        0.14 * Math.sin(nx * 7 + ny * 5) * Math.cos(nz * 6) +
        0.09 * Math.sin(ny * 11 - nz * 7) * Math.sin(nx * 6) +
        0.05 * Math.sin(nx * 15 - ny * 9 + nz * 8)
      const nr = 1.35 + fold
      pts.push(new THREE.Vector3(nx * nr, ny * nr, nz * nr))
    }

    const lineVerts: number[] = []
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (pts[i].distanceTo(pts[j]) < 0.68) {
          lineVerts.push(
            pts[i].x,
            pts[i].y,
            pts[i].z,
            pts[j].x,
            pts[j].y,
            pts[j].z,
          )
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(lineVerts, 3),
    )
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.5,
    })
    const neuralLines = new THREE.LineSegments(lineGeo, lineMat)

    const dotVerts = pts.flatMap((p) => [p.x, p.y, p.z])
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dotVerts, 3),
    )
    const dotMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.045,
      transparent: true,
      opacity: 0.95,
    })
    const neuralDots = new THREE.Points(dotGeo, dotMat)

    const makeRing = (
      inner: number,
      outer: number,
      color: number,
      opacity: number,
    ) => {
      const g = new THREE.RingGeometry(inner, outer, 128)
      const m = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(g, m)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.y = -1.85
      return { mesh, m }
    }
    const { mesh: ring1, m: ring1Mat } = makeRing(1.5, 2.1, 0x7c3aed, 0.65)
    const { mesh: ring2 } = makeRing(2.1, 2.35, 0x6d28d9, 0.3)
    const { mesh: ring3 } = makeRing(0.0, 1.5, 0x4c1d95, 0.22)

    const centGeo = new THREE.CircleGeometry(0.25, 32)
    const centMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    })
    const centMesh = new THREE.Mesh(centGeo, centMat)
    centMesh.rotation.x = -Math.PI / 2
    centMesh.position.y = -1.84

    const beamGeo = new THREE.CylinderGeometry(0.02, 1.5, 3.7, 32, 1, true)
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x5b21b6,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    beam.position.y = 0

    const L1 = new THREE.PointLight(0x8b5cf6, 7, 14)
    L1.position.set(2, 2.5, 3)
    const L2 = new THREE.PointLight(0x3b82f6, 4, 10)
    L2.position.set(-3, -1, -2)
    const L3 = new THREE.PointLight(0xffffff, 2, 6)
    L3.position.set(0, 3, 1.5)
    const L4 = new THREE.PointLight(0x7c3aed, 4, 10)
    L4.position.set(0, -2.5, 0)
    const ambient = new THREE.AmbientLight(0x1e1b4b, 0.6)
    ;[L1, L2, L3, L4, ambient].forEach((l) => scene.add(l))

    const brainGroup = new THREE.Group()
    ;[core, brain, glow1, glow2, glow3, neuralLines, neuralDots].forEach((o) =>
      brainGroup.add(o),
    )
    scene.add(brainGroup)
    ;[ring1, ring2, ring3, centMesh, beam].forEach((o) => scene.add(o))

    let animId = 0
    const clock = new THREE.Clock()

    const tick = () => {
      animId = requestAnimationFrame(tick)
      if (!reduceMotion) {
        const t = clock.getElapsedTime()
        brainGroup.rotation.y = t * 0.38
        brainGroup.rotation.x = Math.sin(t * 0.28) * 0.07
        brainGroup.position.y = Math.sin(t * 0.5) * 0.06
        ;(glow1.material as THREE.MeshBasicMaterial).opacity =
          0.08 + Math.sin(t * 2.0) * 0.035
        L1.intensity = 6 + Math.sin(t * 1.4) * 2
        ring1Mat.opacity = 0.5 + Math.sin(t * 1.1) * 0.2
        centMat.opacity = 0.7 + Math.sin(t * 2.2) * 0.25
      }
      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      if (!el) return
      const nw = el.clientWidth
      camera.aspect = nw / H
      camera.updateProjectionMatrix()
      renderer.setSize(nw, H)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      renderer.dispose()
      ;[bGeo, coreGeo, lineGeo, dotGeo, beamGeo, centGeo].forEach((g) =>
        g.dispose(),
      )
      ;[bMat, coreMat, lineMat, dotMat, beamMat, centMat].forEach((m) =>
        m.dispose(),
      )
      glow1.geometry.dispose()
      glow1.material.dispose()
      glow2.geometry.dispose()
      glow2.material.dispose()
      glow3.geometry.dispose()
      glow3.material.dispose()
      ring1.geometry.dispose()
      ring1Mat.dispose()
      ring2.geometry.dispose()
      ;(ring2.material as THREE.Material).dispose()
      ring3.geometry.dispose()
      ;(ring3.material as THREE.Material).dispose()
    }
  }, [height, failed])

  if (failed) {
    return (
      <div
        className="brain-wrap relative flex w-full items-center justify-center"
        style={{ height }}
        aria-hidden
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute size-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35)_0%,rgba(99,102,241,0.15)_45%,transparent_70%)] blur-2xl" />
          <div className="absolute size-52 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25)_0%,transparent_65%)] blur-xl" />
          <div className="relative size-40 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(196,181,253,0.9)_0%,rgba(124,58,237,0.85)_45%,rgba(49,46,129,0.9)_100%)] shadow-[0_0_60px_rgba(139,92,246,0.5)]" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="brain-wrap relative w-full"
      style={{ height }}
      aria-hidden
    >
      <div
        ref={mountRef}
        className="size-full"
        style={{
          filter:
            "drop-shadow(0 0 48px rgba(109,40,217,0.95)) drop-shadow(0 0 18px rgba(139,92,246,0.8))",
        }}
      />
      <div
        className="pointer-events-none absolute hidden items-center gap-1.5 rounded-lg border border-[rgba(124,58,237,0.35)] bg-[rgba(13,13,34,0.85)] px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-sm min-[400px]:flex"
        style={chipStyle({
          yPct: 12,
          xSide: "right",
          xVal: "8%",
          ySide: "top",
        })}
      >
        <BarChart2 className="size-3 text-blue-400" aria-hidden />
        <span>Analytics</span>
      </div>
      <div
        className="pointer-events-none absolute hidden items-center gap-1.5 rounded-lg border border-[rgba(124,58,237,0.35)] bg-[rgba(13,13,34,0.85)] px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-sm min-[400px]:flex"
        style={chipStyle({
          yPct: 32,
          xSide: "right",
          xVal: "2%",
          ySide: "top",
        })}
      >
        <TrendingUp className="size-3 text-emerald-400" aria-hidden />
        <span>+94% accuracy</span>
      </div>
      <div
        className="pointer-events-none absolute hidden items-center gap-1.5 rounded-lg border border-[rgba(124,58,237,0.35)] bg-[rgba(13,13,34,0.85)] px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-sm min-[400px]:flex"
        style={chipStyle({
          yPct: 14,
          xSide: "left",
          xVal: "2%",
          ySide: "bottom",
        })}
      >
        <Sparkles className="size-3 text-violet-400" aria-hidden />
        <span>Generative AI</span>
      </div>
      <div
        className="pointer-events-none absolute hidden items-center gap-1.5 rounded-lg border border-[rgba(124,58,237,0.35)] bg-[rgba(13,13,34,0.85)] px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-sm min-[400px]:flex"
        style={chipStyle({
          yPct: 40,
          xSide: "right",
          xVal: "6%",
          ySide: "bottom",
        })}
      >
        <Bot className="size-3 text-cyan-400" aria-hidden />
        <span>AI Agents</span>
      </div>
    </div>
  )
}
