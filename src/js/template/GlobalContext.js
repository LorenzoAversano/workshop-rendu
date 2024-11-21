import Debug from "../Utils/Debug";
import DeviceOrientation from "../Utils/DeviceOrientation";
import Time from "../Utils/Time";

let instanceGlobalContext = null;

export default class GlobalContext {
    constructor() {
        if (!!instanceGlobalContext) return instanceGlobalContext;
        instanceGlobalContext = this;

        this.sceneCollection = [];
        this.bubbles = []; // Collection des bulles

        window.addEventListener("resize", () => { this.resize(); });
        window.addEventListener("scroll", () => { this.scroll(); });

        this.time = new Time();
        this.time.on("update", () => { this.update(); });

        /** debug */
        this.debug = new Debug();
    }

    set useDeviceOrientation(isOrientation) {
        if (isOrientation && !!!this.orientation) {
            this.orientation = new DeviceOrientation();
            this.orientation.on("reading", () => { this.onDeviceOrientation(); });
        }
        if (!isOrientation && !!this.orientation) { this.orientation.off("reading"); }
    }

    onDeviceOrientation() {
        this.sceneCollection.forEach(s => { s.onDeviceOrientation(); });
    }

    get window() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
        };
    }

    addScene(scene) {
        this.sceneCollection.push(scene);
    }

    // Nouvelle méthode pour gérer la conversion de bulle en cube
    convertBubbleToCube(bubble) {
        // Suppression de la bulle de la scène
        this.removeBubble(bubble);

        // Création du cube à la même position
        const cube = new Cube({
            x: bubble.position.x,
            y: bubble.position.y,
            size: 50,  // Taille de base du cube
        });

        // Ajouter le cube dans la scène
        this.addCubeToScene(cube);
    }

    // Supprimer une bulle de la scène
    removeBubble(bubble) {
        this.sceneCollection.forEach(scene => {
            if (scene.removeObject) {
                scene.removeObject(bubble);
            }
        });
        const index = this.bubbles.indexOf(bubble);
        if (index !== -1) this.bubbles.splice(index, 1);
    }

    // Ajouter le cube dans la scène 3D ou 2D (selon la scène)
    addCubeToScene(cube) {
        this.sceneCollection.forEach(scene => {
            if (scene.addObject) {
                scene.addObject(cube);
            }
        });
        // Ajouter le cube dans la collection des bulles si nécessaire (pour gestion ultérieure)
        this.bubbles.push(cube);
    }

    resize() {
        this.sceneCollection.forEach(s => { s.resize(); });
    }

    update() {
        this.sceneCollection.forEach(s => {
            if (s.domElement.isVisible) {
                s.update();
            }
        });
    }

    scroll() {
        this.sceneCollection.forEach(s => { s.scroll(); });
    }

    destroy() {
        this.sceneCollection.forEach(s => { s.destroy(); });
        window.removeEventListener("resize");
        window.removeEventListener("scroll");
        this.time.off("update");
        this.useDeviceOrientation = false;
        if (!!this.debug.ui) this.debug.ui.destroy();
    }
}
