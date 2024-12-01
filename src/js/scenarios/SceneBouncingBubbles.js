import GlobalContext from "../template/GlobalContext"
import Scene2D from "../template/Scene2D"
import { clamp, degToRad, distance2D, randomRange } from "../Utils/MathUtils"

class Bubble {
    constructor(context, x, y, radius) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius
        this.time = new GlobalContext().time
        this.vx = randomRange(-200, 200)
        this.vy = randomRange(-200, 200)
        this.gx = 0
        this.gy = 0
    }
    draw() {
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, degToRad(360))
        this.context.fill()
        this.context.stroke()
        this.context.closePath()
    }
    update(width, height, speed = 1) {
        this.gx = (this.x > this.radius && this.x < width - this.radius) ? this.gx : 0
        this.x += (this.vx + this.gx) * this.time.delta / 1000 * speed
        this.y += (this.vy + this.gy) * this.time.delta / 1000 * speed

        this.vx = this.x < this.radius ? Math.abs(this.vx) : this.vx
        this.vx = this.x > width - this.radius ? -Math.abs(this.vx) : this.vx
    }
}

export default class SceneBouncingBubbles extends Scene2D {
    constructor(id) {
        super(id)

        this.params = {
            speed: 1,
            threshold: 50,
            radius: 5,
            nBubbles: 10,
            gStrength: 300
        }
        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "speed", -1, 1, 0.1)
            this.debugFolder.add(this.params, "threshold", 0, 200)
            this.debugFolder.add(this.params, "radius", 0, 30, 0.1).name("Rayon").onChange(() => {
                if (!!this.bubbles) {
                    this.bubbles.forEach(b => {
                        b.radius = this.params.radius
                    })
                }
            })
            this.debugFolder.add(this.params, "nBubbles", 0, 50).onFinishChange(() => {
                this.generateBubbles()
            })
            this.debugFolder.add(this.params, "gStrength", 0, 400)
        }

        this.globalContext = new GlobalContext()
        this.globalContext.useDeviceOrientation = true
        this.orientation = this.globalContext.orientation

        this.generateBubbles()
    }
    generateBubbles() {
        this.bubbles = []
        for (let i = 0; i < this.params.nBubbles; i++) {
            const x_ = this.width * Math.random()
            const y_ = this.height * Math.random()
            const bubble_ = new Bubble(this.context, x_, y_, this.params.radius)
            this.bubbles.push(bubble_)
        }
    }
    addBubble(x, y, vx = randomRange(-200, 200), vy = randomRange(-200, 200)) {
        const bubble_ = new Bubble(this.context, x, y, this.params.radius)
        bubble_.vx = vx
        bubble_.vy = vy
        this.bubbles.push(bubble_)
        return bubble_
    }
    removeBubble(bubble) {
        const index = this.bubbles.indexOf(bubble)
        if (index !== -1) {
            this.bubbles.splice(index, 1)
        }
    }
    draw() {
        this.context.strokeStyle = "white"
        this.context.fillStyle = "black"
        this.context.lineWidth = 2
        this.context.lineCap = "round"
        if (!!this.bubbles) {
            for (let i = 0; i < this.bubbles.length; i++) {
                const current_ = this.bubbles[i]
                for (let j = i; j < this.bubbles.length; j++) {
                    const next_ = this.bubbles[j]
                    if (distance2D(current_.x, current_.y, next_.x, next_.y) < this.params.threshold) {
                        this.context.beginPath()
                        this.context.moveTo(current_.x, current_.y)
                        this.context.lineTo(next_.x, next_.y)
                        this.context.stroke()
                        this.context.closePath()
                    }
                }
            }

            this.bubbles.forEach(b => b.draw())
        }
    }
    update() {
        if (!!this.bubbles) {
            this.bubbles.forEach((b, index) => {
                b.update(this.width, this.height, this.params.speed)
                if (this.id === "canvas-scene-1" && b.y > this.height) {
                    this.globalContext.emit('bubble-transition', {
                        fromScene: this.id,
                        toScene: "canvas-scene-2",
                        bubble: {
                            x: b.x,
                            y: b.y,
                            vx: b.vx,
                            vy: b.vy,
                            radius: b.radius
                        }
                    })
                    this.removeBubble(b)  
                }
            })
        }
        this.clear()
        this.draw()
    }
    resize() {
        super.resize()
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.x = Math.max(0, Math.min(b.x, this.width))
                b.y = Math.max(0, Math.min(b.y, this.height))
            })
        }
        this.draw()
    }
    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90
        let gy_ = this.orientation.beta / 90
        gx_ = clamp(gx_, -1, 1)
        gy_ = clamp(gy_, -1, 1)
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.gx = gx_ * this.params.gStrength
                b.gy = gy_ * this.params.gStrength
            })
        }
    }
}
