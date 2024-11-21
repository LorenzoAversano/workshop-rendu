import GlobalContext from "./GlobalContext";
import DomElement from "../Utils/DomElement";

export default class Scene2D {
    constructor(id) {
        /** context (window) */
        this.globalContext = new GlobalContext();
        this.globalContext.addScene(this);

        /** debug */
        this.params = {};
        this.debug = this.globalContext.debug;
        if (!!this.debug.ui) {
            this.debugFolder = this.debug.ui.addFolder(id);
        }

        /** dom element */
        this.domElement = new DomElement(id);
        this.canvas = this.domElement.element;
        this.context = this.canvas.getContext("2d");

        /** init */
        this.resize();
    }

    get width() { return this.domElement.width; }
    get height() { return this.domElement.height; }
    get position() { return this.domElement.position; }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    resize() {
        this.domElement.setSize();
        const pixelRatio_ = this.globalContext.window.pixelRatio;
        this.canvas.width = this.domElement.width * pixelRatio_;
        this.canvas.height = this.domElement.height * pixelRatio_;
        this.context.scale(pixelRatio_, pixelRatio_);
    }

    onDeviceOrientation() {}

    update() {
        // Vérifier la transformation des bulles en cubes
        this.globalContext.bubbles.forEach(bubble => {
            if (bubble.position.y >= this.height - 50) {  // Condition de transformation
                this.globalContext.convertBubbleToCube(bubble);
            }
        });
    }

    scroll() {
        this.domElement.setSize();
    }

    destroy() {}
}
