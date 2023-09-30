import * as THREE from "three"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Float, Text } from "@react-three/drei"


const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: "limegreen" })
const floor2Material = new THREE.MeshStandardMaterial({ color: "greenyellow" })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" })
const wallMaterial = new THREE.MeshStandardMaterial({ color: "slategrey" })

// Starting Block 

export function BlockStart({ position= [0, 0, 0] }) {
    return (
        <group position={ position } >

            <Float>
                <Text scale={ 0.5 } position={ [ 0, 2, -2 ] } maxWidth={ 0.25 } textAlign="center">
                     Marble Race 
                     <meshBasicMaterial toneMapped={ false }/>
                </Text>
            </Float>

            <mesh geometry={ boxGeometry } material={ floor1Material } receiveShadow position={ [0, -0.1, 0] } scale={ [4, 0.2, 4] }/>
                
        </group>
    )
}

// Twister Obstacle Block

export function BlockSpinner({ position= [0, 0, 0] }) {

    const obstacle = useRef()
    const [ speed ] = useState( () => (Math.random() + 0.3) * (Math.random() < 0.5 ? -1 : 1))

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        const rotation = new THREE.Quaternion()
        rotation.setFromEuler( new THREE.Euler(0, time * speed, 0) )
        obstacle.current.setNextKinematicRotation(rotation)
    })

    return (
        <group position={ position } >

            <mesh geometry={ boxGeometry } material={ floor2Material } receiveShadow position={ [0, -0.1, 0] } scale={ [4, 0.2, 4] }/>

            <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 } >
                <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow  />    
            </RigidBody>

        </group>
    )
}

//Limbo Obstacle

export function BlockLimbo({ position= [0, 0, 0] }) {

    const obstacle = useRef()
    const [ timeOffset ] = useState( () => Math.random())

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const upDown = Math.sin(time + timeOffset) + 1.15

        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + upDown, z: position[2] })
    })

    return (
        <group position={ position } >

            <mesh geometry={ boxGeometry } material={ floor2Material } receiveShadow position={ [0, -0.1, 0] } scale={ [4, 0.2, 4] }/>

            <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 } >
                <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow  />    
            </RigidBody>

        </group>
    )
}

// Axe Block

export function BlockAxe({ position= [0, 0, 0] }) {

    const obstacle = useRef()
    const [ timeOffset ] = useState( () => Math.random())

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const leftRight = Math.sin(time + timeOffset) * 1.2

        obstacle.current.setNextKinematicTranslation({ x: position[0] + leftRight, y: position[1] + 0.75, z: position[2] })
    })

    return (
        <group position={ position } >

            <mesh geometry={ boxGeometry } material={ floor2Material } receiveShadow position={ [0, -0.1, 0] } scale={ [4, 0.2, 4] }/>

            <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 } >
                <mesh geometry={ boxGeometry } material={ obstacleMaterial } scale={ [ 1.5, 1.5, 0.3 ] } castShadow receiveShadow  />    
            </RigidBody>

        </group>
    )
}

//End Block

export function BlockEnd({ position= [0, 0, 0] }) {

    const hamburger = useGLTF("./hamburger.glb")

    hamburger.scene.children.forEach((mesh) => { mesh.castShadow = true })

    return (
        <group position={ position } >

            <Text scale={ 1 } position={ [ 0, 2.25, 2 ] }>
                FINISH
                <meshBasicMaterial toneMapped={ false }/>
            </Text>

            <mesh geometry={ boxGeometry } material={ floor1Material } receiveShadow position={ [0, 0, 0] } scale={ [4, 0.2, 4] }/>
            <RigidBody type="fixed" colliders="hull" position={ [0, 0.25, 0] } restitution={ 0.2 } friction={ 0 }>
                <primitive object={ hamburger.scene } scale={ 0.2 }/>
            </RigidBody>
                
        </group>
    )
}

// Bounds
function Bounds({ length = 1 }) {

    return(
    <>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 0 }>            
            <mesh 
            geometry={ boxGeometry } 
            material={ wallMaterial } 
            scale={ [ 0.3, 2, 5 * 10 ] } 
            position={ [ 2.15, 0.75, - (length * 2) + 2 ] }
            castShadow 
            />

            <mesh 
            geometry={ boxGeometry } 
            material={ wallMaterial } 
            scale={ [ 0.3, 2, 5 * 10 ] } 
            position={ [ -2.15, 0.75, - (length * 2) + 2 ] }
            receiveShadow 
            />

            <mesh 
            geometry={ boxGeometry } 
            material={ wallMaterial } 
            scale={ [ 4, 2, 0.3 ] } 
            position={ [ 0, 0.75, - (length * 4) + 2 ] }
            receiveShadow 
            />
            <CuboidCollider 
                args={ [ 2, 0.1, 2 * length ] } 
                position={ [ 0, -0.1, -(length * 2) + 2 ] } 
                restitution={ 0.2 }
                friction={ 1 }
            />
        </RigidBody>
            
    </>
    )
}


export function Level( {count = 10, types = [ BlockSpinner, BlockAxe, BlockLimbo ], seed = 0 } ) {
    
    const blocks = useMemo(() => {

        const blocks = []

        for(let i = 0; i < count; i++) {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    }, [ count, types, seed ])
    
    return(

        <>
            <BlockStart position={ [0, 0, 0] }/>

            { blocks.map((Block, index) => { return <Block key={index} position={ [ 0, 0, - (index + 1) * 4 ] } /> }) }

            <BlockEnd position={ [0, 0, - (count + 1) * 4] }/>

            <Bounds length={ count + 2 }/>
        </>
    )
}