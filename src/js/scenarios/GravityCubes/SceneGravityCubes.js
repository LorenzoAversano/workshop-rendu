import * as THREE from 'three'
import Scene3D from "../../template/Scene3D"
import { Composite, Engine, Runner } from 'matter-js'
import { randomRange } from '../../Utils/MathUtils'
import GravityCube from './GravityCubes'
import Wall from './Wall'
import { clamp } from 'three/src/math/MathUtils.js'

const THICKNESS = 20

export default class SceneGravityCubes extends Scene3D {
    constructor(id) {
        super(id)

        this.params = { gScale: 1 }
        if(!!this.debugFolder) {
            this.debugFolder.add(this.params, "gScale", 0.5, 10, 0.1).onChange(() => {
                if(!!this.engine) this.engine.gravity.scale *= this.params.gScale
            })
        }

        this.camera = new THREE.OrthographicCamera(
            -this.width / 2, this.width / 2, 
            this.height / 2, -this.height / 2, 
            0.1, 2000
        )
        this.camera.position.z = 1000

        this.wallRight = new Wall('blue')
        this.wallLeft = new Wall('green')
        this.wallBottom = new Wall('red')
        
        this.wallDiagonalLeft = new Wall('purple')
        this.wallDiagonalRight = new Wall('orange')

        this.add(this.wallRight)
        this.add(this.wallLeft)
        this.add(this.wallDiagonalLeft)
        this.add(this.wallDiagonalRight)

        this.cubes = []
        const colors = ['red', 'yellow', 'blue']
        for(let i=0; i < 10; i++) {
            const cube_ = new GravityCube(50, colors[i % colors.length])
            const x_ = randomRange(-this.width / 2, this.width / 2)
            const y_ = randomRange(-this.height / 2, this.height / 2)
            cube_.setPosition(x_, y_)
            this.add(cube_)
            this.cubes.push(cube_)
        }

        this.engine = Engine.create({ render: { visible: false } })
        this.engine.gravity.scale *= this.params.gScale
        this.bodies = [
            this.wallRight.body,
            this.wallLeft.body,
            this.wallDiagonalLeft.body,
            this.wallDiagonalRight.body,
            ...this.cubes.map(c => c.body)
        ]
        Composite.add(this.engine.world, this.bodies)
        this.runner = Runner.create()
        Runner.run(this.runner, this.engine)

        this.globalContext.useDeviceOrientation = true
        this.orientation = this.globalContext.orientation

        this.resize()
    }

    addCube(x, y, color = 'red') {
        const cube = new GravityCube(50, color)
        cube.setPosition(x, y)
        this.add(cube)
        this.cubes.push(cube)
        Composite.add(this.engine.world, cube.body)
        return cube
    }

    removeCube(cube) {
        cube.geometry.dispose()
        cube.material.dispose()
        cube.removeFromParent()
        Composite.remove(this.engine.world, cube.body)
        this.cubes = this.cubes.filter(c => c !== cube)
    }

    update() {
        this.cubes.forEach(c => c.update())
        super.update()
    }

    scroll() {
        super.scroll()
    }

    resize() {
        super.resize()
        this.camera.left = -this.width / 2
        this.camera.right = this.width / 2
        this.camera.top = this.height / 2
        this.camera.bottom = -this.height / 2

        if (!!this.wallRight) {
            this.wallRight.setPosition(this.width / 2, 0)
            this.wallRight.setSize(THICKNESS, this.height)

            this.wallLeft.setPosition(-this.width / 2, 0)
            this.wallLeft.setSize(THICKNESS, this.height)

            this.wallDiagonalLeft.setPosition(
                -this.width / 2 + this.width * 0.35, 
                this.height / 2 * 0.4  
            )
            this.wallDiagonalLeft.setSize(this.width * 0.7, THICKNESS)

            this.wallDiagonalRight.setPosition(
                this.width / 2 - this.width * 0.35, 
                -this.height / 2 * 0.4 
            )
            this.wallDiagonalRight.setSize(this.width * 0.7, THICKNESS)
        }
    }

    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90
        let gy_ = this.orientation.beta / 90
        gx_ = clamp(gx_, -1, 1)
        gy_ = clamp(gy_, -1, 1)

        /** debug */
        let coordinates_ = `${gx_.toFixed(2)}, ${gy_.toFixed(2)}`
        this.debug.domDebug = coordinates_

        this.engine.gravity.x = gx_
        this.engine.gravity.y = gy_
    }
}