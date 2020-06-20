function ShapeMaker(_THREE, _CANNON){
    const THREE = _THREE;
    const CANNON = _CANNON;
    const SHAPE_TYPES = {
        Sphere: 0,
        Cube: 1,
        UnTrackedCube: 2
    };
    let scene;
    // let camera;
    let world;
    // let renderer;
    let shapes = [];
    this.setScene = function (val) {
        scene = val;
    }
    // this.setCamera = function (val) {
    //     camera = val;
    // }
    this.setWorld = function (val) {
        world = val;
    }
    // this.setRenderer = function (val) {
    //     renderer = val;
    // }
    this.getShapes = function () {
        return shapes;
    }
    this.getShapeTypes = function () {
        return SHAPE_TYPES;
    }
    this.createShape = function (type, position, size, mass, material) {
        let shape;
        let sizes = [];
        sizes[0] = size[0] != undefined ? size[0] : 1;
        sizes[1] = size[1] != undefined ? size[1] : size[0];
        sizes[2] = size[2] != undefined ? size[2] : size[1];
        switch(type){
            case SHAPE_TYPES.Sphere:
                {
                    shape = createSphere(position.x, position.y, position.z, sizes[0], mass, material);
                    break;
                }
            case SHAPE_TYPES.Cube:
            case SHAPE_TYPES.UnTrackedCube:
                {
                    shape = createCube(position.x, position.y, position.z, sizes[0], sizes[1], sizes[2], mass, material);
                    break;
                }
        }
        const shapeData = {
            mesh: shape.mesh,
            body: shape.body,
            shape: shape.shape,
            update: function () {
                shape.mesh.position.copy(shape.body.position);
                shape.mesh.quaternion.copy(shape.body.quaternion);
                // if(type == SHAPE_TYPES.Cube){
                    
                //     shape.mesh.rotation.set(new THREE.Vector3(shape.body.quaternion.toAxisAngle('x')[1], shape.body.quaternion.toAxisAngle('y')[1], shape.body.quaternion.toAxisAngle('z')[1]));
                //     // shape.mesh.rotation.y = shape.body.rotation.y;
                //     // shape.mesh.rotation.z = shape.body.rotation.z;
                // }
            }
        };
        if (type != SHAPE_TYPES.UnTrackedCube){
            shapes.push(shapeData);
        }
        return shapeData;
    }

    function createSphere(x, y, z, radius, mass, material) {
        let rad = radius != undefined ? radius : 1;
        let geometry2	= new THREE.SphereGeometry(rad,32,32);
        let material2 = material != undefined ? material : new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        let mesh2 = new THREE.Mesh( geometry2, material2 );
        mesh2.position.x = x != undefined ? x : 0;
        mesh2.position.y = y != undefined ? y : 0;
        mesh2.position.z = z != undefined ? z : 0;
        scene.add( mesh2 );
        let sphereShape = new CANNON.Sphere(rad);
        let sphereBody = new CANNON.Body({ mass: mass != undefined ? mass : 0 });
        sphereBody.addShape(sphereShape);
        sphereBody.position.set(mesh2.position.x,mesh2.position.y,mesh2.position.z);
        sphereBody.linearDamping = 0.9;
        world.addBody(sphereBody);
        return {
            mesh: mesh2,
            body: sphereBody,
            shape: sphereShape
        };
    }
    function createCube(x, y, z, width, height, depth, mass, material) {
        // let rad = radius != undefined ? radius : 1;
        let size = {
            wide: width != undefined ? width : 1,
            high: height != undefined ? height : 1,
            deep: depth != undefined ? depth : 1
        };
        let geometry2	= new THREE.BoxGeometry(size.wide,size.high,size.deep);
        let material2 = material != undefined ? material : new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        let mesh2 = new THREE.Mesh( geometry2, material2 );
        mesh2.position.x = x != undefined ? x : 0;
        mesh2.position.y = y != undefined ? y : 0;
        mesh2.position.z = z != undefined ? z : 0;
        scene.add( mesh2 );
        let shape = new CANNON.Box(new CANNON.Vec3(size.wide/2, size.high/2,size.deep/2));
        let body = new CANNON.Body({ mass: mass != undefined ? mass : 0 });
        body.addShape(shape);
        body.position.set(mesh2.position.x,mesh2.position.y,mesh2.position.z);
        body.linearDamping = 0.9;
        world.addBody(body);
        return {
            mesh: mesh2,
            body: body,
            shape: shape
        };
    }
}
export default ShapeMaker;