import { Physics } from '@react-three/rapier'
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'
import useGame from "./stores/useGame"

export default function Experience()
{
    const blocksCount = useGame((state) => { return state.blocksCount })
    const blocksSeed = useGame((state) => { return state.blocksSeed })

    return <>

    <color args={ [ "#bdedfc" ] } attach="background"/>

        <Physics debug={ false }>
            <Lights />
            <Level count={ blocksCount } seed={ blocksSeed }/>
            <Player />
        </Physics>

    </>
}