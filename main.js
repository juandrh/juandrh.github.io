// Three.js - Textured Cube - Wait for Texture
// from https://threejs.org/manual/examples/textured-cube-wait-for-texture.html


import * as THREE from 'three';
import { PointerLockControls } from 'Controls';
import Stats from 'stats'; 
import { GLTFLoader } from 'GLTFLoader';



let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let cameraY= 15;
//let floorSize = 10;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();


const clock = new THREE.Clock();

let musicOn = false;  
let  analyser, uniforms; 
const fftSize = 512;
var dataArray = new Uint8Array(fftSize);
const stats = Stats();

const loader = new GLTFLoader();
const boxWidth = 0.5;
let cube = new THREE.Mesh(); 
let cube2 = new THREE.Mesh(); 
const cubes = []; 
const cubes2 = [];    
const materials = [];  

init();
animate();


function init() {

  document.body.appendChild(stats.dom);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = cameraY;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0000ff);
  scene.fog = new THREE.Fog(0x0000ff, 0, 200);

  // LIGHTS
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  //scene.add(light);

  
  const light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
  light2.position.set(50, 100, 0);
  light2.target.position.set(-50, 0, 0);
  scene.add(light2);


  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {
    controls.lock();
    if (!musicOn){ 
      initMusic();
      musicOn= true;  
    }

    const overlay = document.getElementById( 'blocker' );
    overlay.hide();

  });

  controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  });

  controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
  });

  scene.add(controls.getObject());

  const onKeyDown = function (event) {

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }

  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }

  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

  // floor
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 400, 400);
  floorGeometry.rotateX(- Math.PI / 2);
    
    let position = floorGeometry.attributes.position;

    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);
      vertex.x += 10;     
      vertex.z += 10; 
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
  
    floorGeometry = floorGeometry.toNonIndexed(); 
    position = floorGeometry.attributes.position;
    const colorsFloor = [];
  
    // Floor color
    for (let i = 0, l = position.count/6; i < l; i++) {    
      let rand = Math.random();
      color.setRGB(rand * 0.02 + 0.05, rand *  0.01 + 0.005,rand *  0.005 + 0.0); 
      for (let j = 0 ; j < 6; j++) {
      colorsFloor.push(color.r, color.g, color.b);
      }
    }
  
    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
  
    const floorMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });
  
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

  // house 1
  loader.load( './assets/house.glb', function ( gltf ) {  
    gltf.scene.position.z=-200; 
    gltf.scene.position.x=-120; 
    scene.add( gltf.scene );    
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {console.log(error) }
  ); 

   // house 2
   loader.load( './assets/house.glb', function ( gltf ) {  
    gltf.scene.position.z=-200; 
    gltf.scene.position.x=120; 
    scene.add( gltf.scene );    
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {console.log(error) }
  ); 

   // house 3
   loader.load( './assets/house.glb', function ( gltf ) {  
    gltf.scene.position.z=-50; 
    gltf.scene.position.x=120; 
    scene.add( gltf.scene );    
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {console.log(error) }
  ); 

  // house 4
  loader.load( './assets/house.glb', function ( gltf ) {  
    gltf.scene.position.z=-50; 
    gltf.scene.position.x=-120; 
    scene.add( gltf.scene );    
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {console.log(error) }
  ); 

  //  BOXES

 
  const geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);



  var step=25;
  for (var i=0;i<fftSize/2 ; i++){
      const material = new THREE.MeshPhysicalMaterial(); 
      material.color.setRGB(0,155,0);  
      material.flatShading = false;
      material.shininess = 0.1; 
      material.roughness = 0.9;
      material.metalness = 0.0;
      //material.fog = true;
      cube = new THREE.Mesh(geometry, material);  
      cube2 = new THREE.Mesh(geometry, material);  
      scene.add(cube);
      scene.add(cube2);
      //cube.position.x = i*boxWidth*2 - (boxWidth*fftSize/2);

      cube.position.x = step-step*Math.cos(i*Math.PI*2/fftSize);
      cube.position.y = -1;
      cube.position.z = -step*Math.sin(i*Math.PI*2/fftSize)-120;
      cubes.push(cube); 
      cube2.position.x = -step+step*Math.cos(i*Math.PI*2/fftSize);
      cube2.position.y = -1;
      cube2.position.z = -step*Math.sin(i*Math.PI*2/fftSize)-120;
      cubes2.push(cube2);        
      materials.push(material);   
  }


  // --------------------------------

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function initMusic() {

  const listener = new THREE.AudioListener();

  const audio = new THREE.Audio( listener );
  const file = './assets/alex-productions-cinematic-epic-music-story.mp3';
  if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
    const mloader = new THREE.AudioLoader();
    mloader.load( file, function ( buffer ) {
      audio.setBuffer( buffer );
      audio.setLoop( true );      
	    audio.setVolume( 1.0 );
      audio.play();
      
    } );
  } else {
    const mediaElement = new Audio( file );
    
    mediaElement.play();
    audio.setMediaElementSource( mediaElement );
    audio.setLoop( true );         
    audio.setVolume( 1.0 );
  }
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();	
  analyser = new THREE.AudioAnalyser( audio, fftSize );			
  const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
  uniforms = {
    tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize /2 , 1, format ) }
  };        
   
}

function animate() {

  requestAnimationFrame(animate);
  stats.update();

  const time = performance.now();

  if (controls.isLocked === true) {

    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= cameraY;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {

      velocity.y = Math.max(0, velocity.y);
      canJump = true;

    }

    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);

    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < cameraY) {

      velocity.y = 0;
      controls.getObject().position.y = cameraY;

      canJump = true;

    }

  }
  // -----------------------------------------------------------
  for (var i=0;i<fftSize/2 ; i++){ 
    cube = cubes[i];
    cube2 = cubes2[i];
    const speed = .2 + i * .1;
    const rot = time * speed;
  //  cube.rotation.x = rot;
     //cube.rotation.y = rot;
    /*  cube.position.x = step*Math.cos(i*Math.PI*4/fftSize);
    cube.position.z = step*Math.sin(i*Math.PI*4/fftSize); */
   
     if(musicOn){
      dataArray = analyser.getFrequencyData();  
     
      //cube = new THREE.Mesh(geometry, material);
      cube.scale.y = dataArray[i]/2;       
      cube.position.y = dataArray[i]/64;
      cube.material.color.setRGB( 50,dataArray[i]/256,1-dataArray[i]/256);
      cube2.scale.y = dataArray[i]/2;       
      cube2.position.y = dataArray[i]/64;
      cube2.material.color.setRGB( 50,dataArray[i]/256,1-dataArray[i]/256);
      
      
      }
      
  }; 
 // -----------------------------

  prevTime = time;

  renderer.render(scene, camera);

}

//