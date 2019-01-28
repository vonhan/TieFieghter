var container, stats;
var camera, scene, renderer, sky, sunSphere;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    initCamera();

    scene = new THREE.Scene();

    initSunLight();

    initTrackballControls();

    loadModel();

    initRenderer();

    initSky();

    initEventsListeners();
}


function initCamera() {
    var windowDimensionsRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, windowDimensionsRatio, 1, 2000);
    camera.position.z = 7;
    camera.position.y = 2;
}

function initArtificialLights() {
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add( ambientLight );
    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
}

function initSunLight() {
  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );

  hemiLight.color.b = 0.6;
  hemiLight.color.g = 0.75;
  hemiLight.color.r = 0.5;

  hemiLight.groundColor.b = 0.095;
  hemiLight.groundColor.g = 0.5;
  hemiLight.groundColor.r = 0.5;

  hemiLight.position.x = 0;
  hemiLight.position.y = 500;
  hemiLight.position.z = 0;

  scene.add( hemiLight );

  var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.x = -1;
  dirLight.position.y = 0.75;
  dirLight.position.z = 1;

  dirLight.position.set( -1, 0.75, 1 );
  dirLight.name = "dirlight";

  scene.add( dirLight );

  dirLight.castShadow = true;
  dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024*2;

  var d = 300;

  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCameraTop = d;
  dirLight.shadowCameraBottom = -d;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.35;
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

function initSky() {
  // Add Sky
  sky = new THREE.Sky();
  sky.scale.setScalar( 450000 );
  scene.add( sky );

  // Add Sun Helper
  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 20000, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } )
  );
  sunSphere.position.y = - 700000;
  sunSphere.visible = false;
  scene.add( sunSphere );

  /// GUI

  var effectController  = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 1,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: ! true
  };

  var distance = 400000;
  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = effectController.turbidity;
  uniforms.rayleigh.value = effectController.rayleigh;
  uniforms.luminance.value = effectController.luminance;
  uniforms.mieCoefficient.value = effectController.mieCoefficient;
  uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

  var theta = Math.PI * ( effectController.inclination - 0.5 );
  var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

  sunSphere.position.x = distance * Math.cos( phi );
  sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
  sunSphere.visible = effectController.sun;

  uniforms.sunPosition.value.copy( sunSphere.position );

  renderer.render( scene, camera );
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
