import { useKeyboardControls } from "@react-three/drei"
import useGame from "./stores/useGame"
import { useRef, useEffect } from "react"
import { addEffect } from "@react-three/fiber" //useFrame outside the canvas

export default function Interface(){

    const forward = useKeyboardControls((state) => {return state.forward})
    const backward = useKeyboardControls((state) => {return state.backward})
    const leftward = useKeyboardControls((state) => {return state.leftward})
    const rightward = useKeyboardControls((state) => {return state.rightward})
    const jump = useKeyboardControls((state) => {return state.jump})

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)

    const timeRef = useRef()

    useEffect(() => {
         const unsubscribeEffect = addEffect(() => {

            const state = useGame.getState()
            
            let elapsedTime = 0

            if(state.phase === "playing") {
                elapsedTime = Date.now() - state.startTime
            } 
            else if(state.phase === "ended") {
                elapsedTime = state.endTime - state.startTime
            }

            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if(timeRef.current) {
                timeRef.current.textContent = elapsedTime
            }

        })

        return () => {
            unsubscribeEffect()
        }

    }, [])

    return (
        <div className="interface">

            <div ref={ timeRef } className="time">0.00</div>

            { phase === "ended" ? <div className="restart" onClick={ restart }> Restart </div> : null}

            <div className="controls">
                <div className="raw">
                    <div className= { `key ${ forward ? "active" : "" }` } ></div>
                </div>
                <div className="raw">
                    <div className={ `key ${ leftward ? "active" : "" }` }></div>
                    <div className={ `key ${ backward ? "active" : "" }` }></div>
                    <div className={ `key ${ rightward ? "active" : "" }` }></div>
                </div>
                <div className="raw">
                    <div className={ `key large ${ jump ? "active" : "" }` }></div>
                </div>
            </div>

        </div>
    )
}