import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function BubbleCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200)
    camera.position.z = 40

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const dir = new THREE.DirectionalLight(0x41C6F1, 1.5)
    dir.position.set(5, 10, 10)
    scene.add(dir)

    // Shared geometry
    const geo = new THREE.SphereGeometry(1, 24, 24)

    interface Bubble {
      mesh: THREE.Mesh
      baseScale: number
      speedY: number
      driftX: number
      wobbleFreq: number
      phase: number
    }

    const bubbles: Bubble[] = []

    for (let i = 0; i < 36; i++) {
      const size    = 0.4 + Math.random() * 1.8
      const isCyan  = Math.random() > 0.5
      const opacity = 0.06 + Math.random() * 0.12

      const mat = new THREE.MeshStandardMaterial({
        color:       isCyan ? 0x41C6F1 : 0xffffff,
        transparent: true,
        opacity,
        roughness:   0.1,
        metalness:   0.05,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.scale.setScalar(size)
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        -28 - Math.random() * 30,
        (Math.random() - 0.5) * 15,
      )
      scene.add(mesh)

      bubbles.push({
        mesh,
        baseScale:   size,
        speedY:      0.05 + Math.random() * 0.08,
        driftX:      (Math.random() - 0.5) * 0.015,
        wobbleFreq:  0.5 + Math.random() * 1.0,
        phase:       Math.random() * Math.PI * 2,
      })
    }

    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    let frameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      bubbles.forEach((b) => {
        b.mesh.position.y += b.speedY
        b.mesh.position.x += b.driftX + Math.sin(t * b.wobbleFreq + b.phase) * 0.01

        // Gentle pulse — always relative to baseScale, never accumulates
        const pulse = b.baseScale * (1 + Math.sin(t * b.wobbleFreq + b.phase) * 0.03)
        b.mesh.scale.setScalar(pulse)

        if (b.mesh.position.y > 36) {
          b.mesh.position.y = -28 - Math.random() * 10
          b.mesh.position.x = (Math.random() - 0.5) * 80
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
    />
  )
}
