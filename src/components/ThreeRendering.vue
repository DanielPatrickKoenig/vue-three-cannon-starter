<template>
    <div>
        <div class='three-container' :id="containerID"></div>
        <div class="tracker" v-on:mousemove="move" v-on:click="clicked"></div>
    </div>
</template>
<script>
import ShapeMaker from '../objects/ShapeMaker.js'
export default {
    data () {
        return {
            containerID: 'id-' + Math.random().toString().split('.').join('') + Math.random().toString().split('.').join('') + Math.random().toString().split('.').join(''),
            THREE: {},
            CANNON: {},
            deltaTime: 0,
            totalTime: 0,
            shapeMaker: {},
            mouseMirrors:[],
            hasFloor: false
        }
    },
    methods: {
        clicked: function () {
            this.$data.shapeMaker.getShapes()[0].body.velocity.set(0,0,-2);
        },
        move: function (e) {
            let mousePos = {x: e.pageX, y: e.pageY};
            let pos = {x: mousePos.x - 250, y: mousePos.y - 100};
            for(var i = 0; i < this.$data.mouseMirrors.length;i++){
                this.$data.mouseMirrors[i].body.quaternion.setFromAxisAngle(new this.CANNON.Vec3(0,0,pos.x * .002),pos.x > 0 ? pos.x * -.002 : pos.x * .002);
                this.$data.mouseMirrors[i].update();
            }
        },
        createSphere: function(world, x, y, z, mass, material){
            let self = this;
            let geometry2	= new self.$data.THREE.SphereGeometry(.2,32,32);
            let material2 = material != undefined ? material : new self.$data.THREE.MeshNormalMaterial({
                transparent: true,
                opacity: 0.5,
                side: self.$data.THREE.DoubleSide
            });
            let mesh2 = new self.$data.THREE.Mesh( geometry2, material2 );
            mesh2.position.x = x;
            mesh2.position.y = y;
            mesh2.position.z = z;
            self.$data.scene.add( mesh2 );
            let sphereShape = new self.$data.CANNON.Sphere(.2);
            let sphereBody = new self.$data.CANNON.Body({ mass: mass });
            sphereBody.addShape(sphereShape);
            sphereBody.position.set(mesh2.position.x,mesh2.position.y,mesh2.position.z);
            sphereBody.linearDamping = 0.9;
            world.addBody(sphereBody);
            return {
                mesh: mesh2,
                body: sphereBody,
                shape: sphereShape,
                update: function () {
                    mesh2.position.x = sphereBody.position.x;
                    mesh2.position.y = sphereBody.position.y;
                    mesh2.position.z = sphereBody.position.z;
                }
            };
        }
    },
    mounted: function () {
        let self = this;
        this.$data.THREE = require('three');
        this.$data.CANNON = require('cannon');

        self.$data.shapeMaker = new ShapeMaker(this.$data.THREE, this.$data.CANNON);
        
        var _width = document.getElementById(self.$data.containerID).getBoundingClientRect().width;
        var _height = document.getElementById(self.$data.containerID).getBoundingClientRect().height;
        var containerElement = document.getElementById(self.$data.containerID);
        self.$data.renderer = new self.$data.THREE.WebGLRenderer({alpha: true});
        // self.$data.renderer = new self.$data.THREE.WebGLRenderer()
        self.$data.renderer.setSize(_width, _height);
        containerElement.appendChild(self.$data.renderer.domElement);
        self.$data.scene = new self.$data.THREE.Scene();
        self.$data.camera = new self.$data.THREE.PerspectiveCamera(75, _width / _height, 1, 1000);
        self.$data.camera.position.x = 0;
        self.$data.camera.position.y = 0;
        self.$data.camera.position.z = 0;

        self.$data.shapeMaker.setWorld();
        

        var clock = new self.$data.THREE.Clock();


        var world = new self.$data.CANNON.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;

        var solver = new self.$data.CANNON.GSSolver();

        world.defaultContactMaterial.contactEquationStiffness = 1e9;
        world.defaultContactMaterial.contactEquationRelaxation = 4;

        solver.iterations = 7;
        solver.tolerance = 0.1;
        var split = true;
        if(split)
            world.solver = new self.$data.CANNON.SplitSolver(solver);
        else
            world.solver = solver;

        world.gravity.set(0,-20,0);
        world.broadphase = new self.$data.CANNON.NaiveBroadphase();

        // Create a slippery material (friction coefficient = 0.0)
        var physicsMaterial = new self.$data.CANNON.Material("slipperyMaterial");
        var physicsContactMaterial = new self.$data.CANNON.ContactMaterial(physicsMaterial,
                                                                physicsMaterial,
                                                                0.0, // friction coefficient
                                                                0.3  // restitution
                                                                );
        // We must add the contact materials to the world
        world.addContactMaterial(physicsContactMaterial);

        // createSphere(0,1.5,0, mass);
        // createSphere(.25,2.2,0, mass);

        if(self.$data.hasFloor){
            var groundShape = new self.$data.CANNON.Plane();
            var groundBody = new self.$data.CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.quaternion.setFromAxisAngle(new self.$data.CANNON.Vec3(1,0,0),-Math.PI/2);
            world.addBody(groundBody);
        }
        self.$data.shapeMaker.setScene(self.$data.scene);
        self.$data.shapeMaker.setWorld(world);

        self.$data.shapeMaker.createShape(self.$data.shapeMaker.getShapeTypes().Sphere, {x:0,y:1,z:-2},[.2],5);
        // shapeMaker.createShape(shapeMaker.getShapeTypes().Sphere, {x:.2,y:2,z:-2},[.2],5);
        self.$data.shapeMaker.createShape(self.$data.shapeMaker.getShapeTypes().Cube, {x:.2,y:2,z:-1.7},[.4,.4,.4],5);

        // self.$data.mouseMirrors.mover = self.$data.shapeMaker.createShape(self.$data.shapeMaker.getShapeTypes().Sphere, {x:0,y:-.5,z:-2},[.2],0);
        self.$data.mouseMirrors.push(self.$data.shapeMaker.createShape(self.$data.shapeMaker.getShapeTypes().UnTrackedCube, {x:0,y:-1,z:-2},[10,.2,10],0));
        // self.$data.shapes.push(self.createSphere(world,0,1,-2,5));
        // self.$data.shapes.push(self.createSphere(world,.2,2,-2,5));

        // self.$data.spheres.push({m: mesh2, b: sphereBody, s: sphereShape});

        setInterval(() => {
            self.$data.deltaTime = clock.getDelta();
            self.$data.totalTime += self.$data.deltaTime;
            world.step(1.0 / 60.0, self.$data.deltaTime, 3);
            for(var i = 0; i<self.$data.shapeMaker.getShapes().length;i++){
                self.$data.shapeMaker.getShapes()[i].update();
            }
            
            self.$data.renderer.render(self.$data.scene, self.$data.camera);

            
            
        }, 33);


    }
}
</script>
<style>
    div.three-container{
        width:500px;
        height:500px;
    }
    div.tracker{
        width:500px;
        height: 200px;
        background-color: #cc0000;;
    }
</style>