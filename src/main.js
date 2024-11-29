import SceneGravityCubes from "./js/scenarios/GravityCubes/SceneGravityCubes"
import SceneBouncingBubbles from "./js/scenarios/SceneBouncingBubbles"
import GlobalContext from "./js/template/GlobalContext"
import { askMotionAccess } from "./js/Utils/DeviceAccess"

const btnAccess = document.getElementById("btn-access")
btnAccess.addEventListener("click", function () {
    askMotionAccess()
}, false)

const scene1 = new SceneBouncingBubbles("canvas-scene-1")
const scene2 = new SceneGravityCubes("canvas-scene-2")
const scene3 = new SceneBouncingBubbles("canvas-scene-3")

const globalContext = new GlobalContext()
const time = globalContext.time

const updateScenes = () => {
    const scale_ = 1 + (Math.cos(5 * time.elapsed / 1000) / 2 + 0.5) / 20
    btnAccess.style.transform = `scale(${scale_}, 1)`

    const bubblesOutTop = scene1.bubbles.filter(b => b.y < 0)
    const bubblesOutBottom = scene1.bubbles.filter(b => b.y > scene1.height)

    bubblesOutTop.forEach(bubble => { scene1.removeBubble(bubble) })
    bubblesOutBottom.forEach(bubble => { scene1.removeBubble(bubble) })

    bubblesOutTop.forEach(bubble => {
        const newBubble = scene3.addBubble(bubble.x, scene3.height)
        newBubble.vx = bubble.vx
        newBubble.vy = bubble.vy
    })

    bubblesOutBottom.forEach(bubble => {
        scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2)
    })

    const cubesOutTop = scene2.cubes.filter(c => c.position.y > scene2.height / 2)
    const cubesOutBottom = scene2.cubes.filter(c => c.position.y < -scene2.height / 2)

    cubesOutTop.forEach(cube => { scene2.removeCube(cube) })
    cubesOutBottom.forEach(cube => { scene2.removeCube(cube) })

    cubesOutTop.forEach(cube => {
        const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, scene1.height)
        newBubble.vy = -Math.abs(newBubble.vy)
    })

    cubesOutBottom.forEach(cube => {
        const newBubble = scene3.addBubble(cube.position.x + scene3.width / 2, 0)
        newBubble.vy = Math.abs(newBubble.vy)
    })

    const bubblesOutTop3 = scene3.bubbles.filter(b => b.y < 0)
    const bubblesOutBottom3 = scene3.bubbles.filter(b => b.y > scene3.height)

    bubblesOutTop3.forEach(bubble => { scene3.removeBubble(bubble) })
    bubblesOutBottom3.forEach(bubble => { scene3.removeBubble(bubble) })

    bubblesOutTop3.forEach(bubble => {
        scene2.addCube(bubble.x - scene2.width / 2, -scene2.height / 2)
    })

    bubblesOutBottom3.forEach(bubble => {
        const newBubble = scene1.addBubble(bubble.x, 0)
        newBubble.vy = bubble.vy
        newBubble.vx = bubble.vx
    })
}

time.on("update", updateScenes)
