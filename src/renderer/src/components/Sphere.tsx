import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { irisService } from '@renderer/services/Iris-voice-ai'

interface CustomParticleSphereProps {
  isSystemActive: boolean
  isAiSpeaking: boolean
}

const CustomParticleSphere = ({ isSystemActive, isAiSpeaking, count = 3000 }: CustomParticleSphereProps & { count?: number }) => {
  const mesh = useRef<THREE.Points>(null)

  const dataArray = useMemo(() => new Uint8Array(128), [])

  const colorActive = useMemo(() => new THREE.Color('#10b981'), []) // Emerald green
  const colorInactive = useMemo(() => new THREE.Color('#d4d4d8'), []) // Zinc gray/white
  const colorResponse = useMemo(() => new THREE.Color('#06b6d4'), []) // Response blue

  const { positions, originalPositions, spreadFactors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const orig = new Float32Array(count * 3)
    const spread = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      const z = Math.random() * 2 - 1

      const vector = new THREE.Vector3(x, y, z)
      vector.normalize().multiplyScalar(2)

      pos[i * 3] = vector.x
      pos[i * 3 + 1] = vector.y
      pos[i * 3 + 2] = vector.z

      orig[i * 3] = vector.x
      orig[i * 3 + 1] = vector.y
      orig[i * 3 + 2] = vector.z

      spread[i] = Math.random()
    }
    return { positions: pos, originalPositions: orig, spreadFactors: spread }
  }, [count])

  useFrame((state, delta) => {
    if (!mesh.current) return

    // Calm rotation when system is active, very slow when off
    const rotSpeed = isSystemActive ? 0.08 : 0.02
    mesh.current.rotation.y += delta * rotSpeed
    mesh.current.rotation.z += delta * rotSpeed

    let volume = 0
    if (isSystemActive) {
      if (irisService.analyser) {
        irisService.analyser.getByteFrequencyData(dataArray)

        let sum = 0
        const len = dataArray.length
        for (let i = 0; i < len; i++) {
          sum += dataArray[i]
        }
        volume = sum / len / 128

        // If it's silent, fall back to a small organic heartbeat breathing wave
        if (volume < 0.005) {
          volume = Math.sin(state.clock.getElapsedTime() * 3) * 0.015 + 0.015
        }
      } else {
        volume = Math.sin(state.clock.getElapsedTime() * 3) * 0.015 + 0.015
      }
    }

    // Set particle color based on neural state and response speaking state
    const targetColor = !isSystemActive 
      ? colorInactive 
      : irisService.isAiSpeaking 
        ? colorResponse 
        : colorActive
    ;(mesh.current.material as THREE.PointsMaterial).color.copy(targetColor)

    const currentPos = mesh.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      // Perturb positions based on volume
      const expansion = 1 + volume * spreadFactors[i] * 0.5

      currentPos[ix] = originalPositions[ix] * expansion
      currentPos[iy] = originalPositions[iy] * expansion
      currentPos[iz] = originalPositions[iz] * expansion
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#3f3f46"
        size={0.012}
        transparent={true}
        opacity={0.9}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

const Sphere = ({ isSystemActive = false, isAiSpeaking = false }: CustomParticleSphereProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5] }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <CustomParticleSphere isSystemActive={isSystemActive} isAiSpeaking={isAiSpeaking} />
    </Canvas>
  )
}

export default Sphere
