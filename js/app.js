var container, stats;
var camera, scene, renderer;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    initCamera();

    scene = new THREE.Scene();

    initLights();

    initTrackballControls();

    loadModel();

    initRenderer();

    initEventsListeners();
}


function initCamera() {
    var windowDimensionsRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, windowDimensionsRatio, 1, 2000);
    camera.position.z = 7;
    camera.position.y = 2;
}

function initLights() {
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add( ambientLight );
    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
}

function initTrackballControls() {
  controls = new THREE.TrackballControls( camera );
  controls.target.set( 0, 0, 0 );

  controls.rotateSpeed = 1.2;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = false;
  controls.dynamicDampingFactor = 0.15;

  controls.keys = [ 65, 83, 68 ];
}

function loadModel() {
    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function() {
      console.log("Error on model loading");
    };

    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
    new THREE.MTLLoader()
        .setPath('model/star-wars-vader-tie-fighter-obj/')
        .load('star-wars-vader-tie-fighter.mtl', function(materials) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials(materials)
                .setPath('model/star-wars-vader-tie-fighter-obj/')
                .load('star-wars-vader-tie-fighter.obj', function(object) {
                    object.position.y = 0;
                    scene.add(object);
                }, onProgress, onError);
        });
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function initEventsListeners() {
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update();
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
