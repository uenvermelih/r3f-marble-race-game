import { RigidBody, useRapier } from "@react-three/rapier"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import useGame from "./stores/useGame"

export default function Player() {

    const player = useRef()
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()

    //for smoothing the camera with lerp function
    const [ smoothCameraPosition ] = useState(() => new THREE.Vector3(0, 0, 0))
    const [ smoothCameraTarget ] = useState(() => new THREE.Vector3())

    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const blocksCount = useGame((state) => state.blocksCount)
       

    const jump = () => {
        const origin = player.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true) //true makes floor solid in the inside for ray to cast on
        
        if(hit.toi < 0.1) {
            player.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }

    }

    const reset = () => {
        player.current.setTranslation( { x: 0, y: 1, z: 0 } )
        player.current.setLinvel( { x: 0, y: 0, z: 0 } )
        player.current.setAngvel( { x: 0, y: 0, z: 0 } )
    }

    useEffect(() => {

        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if(value === "ready") {
                    reset()
                }
            }
        )

        const unsubscribeJump = subscribeKeys(
            (state) => {
                return state.jump
            },
            (value) => {
                if(value){
                    jump()
                }
            }
        )

        const unsubscribeAny = subscribeKeys(
            () => {
                start()
            }
        )

        return () => {
            unsubscribeJump()
            unsubscribeAny()
            unsubscribeReset()
        }

    }, [])

    useFrame((state, delta) => {

        /**
         * Controls
         */
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x:0, y:0, z:0 }
        const torque = { x:0, y:0, z:0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if(forward){
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }
        if(backward){
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }
        if(leftward){
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }
        if(rightward){
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }

        player.current.applyImpulse(impulse)
        player.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */
        const playerPosition = player.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(playerPosition)
        cameraPosition.z += 2.6
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(playerPosition)
        cameraTarget.y += 0.2

        smoothCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothCameraTarget.lerp(cameraPosition, 5 * delta)
        
        state.camera.position.copy(smoothCameraPosition)
        state.camera.lookAt(smoothCameraTarget)

        /**
         * Phases
         */
        if(playerPosition.z < - (blocksCount * 4 + 2)) {
            end()
        }
        if(playerPosition.y < - 3) {
            restart()
        }

    })

    return (
        <>
            <RigidBody 
                ref={ player } 
                canSleep={ false } 
                colliders="ball" 
                restitution={ 0.2 } 
                friction={ 1 } 
                linearDamping={ 0.6 }
                angularDamping={ 0.6 }
                position={[ 0, 1, 0 ]}>
                
                <mesh castShadow >
                    <icosahedronGeometry args={[ 0.3, 1 ]} />
                    <meshStandardMaterial flatShading color="purple" />
                </mesh>        
            </RigidBody>
        </>
    )
}