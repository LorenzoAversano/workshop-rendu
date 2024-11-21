import SceneGravityCubes from "./js/scenarios/GravityCubes/SceneGravityCubes";
import SceneBouncingBubbles from "./js/scenarios/SceneBouncingBubbles";
import GlobalContext from "./js/template/GlobalContext";
import { askMotionAccess } from "./js/Utils/DeviceAccess";

/** motion sensors authorization */
const btn = document.getElementById("btn-access");
btn.addEventListener("click", function () {
    askMotionAccess();
}, false);

/** scenes */
const scene1 = new SceneBouncingBubbles("canvas-scene-1");
const scene2 = new SceneGravityCubes("canvas-scene-2");
const scene3 = new SceneBouncingBubbles("canvas-scene-3");

/** main */
const globalContext = new GlobalContext();

globalContext.on('bubble-to-scene-3', (event) => {
    const bubble = event.bubble;
    const newBubble = scene3.addBubble(bubble.x + scene3.width / 2, 0);
    newBubble.vx = bubble.vx;
    newBubble.vy = Math.abs(bubble.vy);
});

globalContext.on('bubble-to-scene-2', (event) => {
    const bubble = event.bubble;
    scene2.addCubeFromBubble(bubble);
});

globalContext.on('cube-to-scene-1', (event) => {
    const cube = event.cube;
    const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, 0);
    newBubble.vx = cube.vx;
    newBubble.vy = cube.vy;
});
