// Three.js - Textured Cube - Wait for Texture
// from https://threejs.org/manual/examples/textured-cube-wait-for-texture.html


import * as THREE from 'three';
import { PointerLockControls } from 'Controls';
import Stats from 'stats'; //"/jsm/libs/stats.module.js";



let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

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


const boxWidth = 4;
let cube = new THREE.Mesh(); 
const cubes = [];    
const materials = [];  

init();
animate();


function init() {

  document.body.appendChild(stats.dom);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  // LIGHTS
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {
    controls.lock();
    if (!musicOn){ 
      initMusic();
      musicOn= true;  
    }
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
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(- Math.PI / 2);

  // vertex displacement
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
    color.setRGB(rand * 0.3 + 0.5, rand *  0.3 + 0.5,rand *  0.1 + 0.0); 
    for (let j = 0 ; j < 6; j++) {
    colorsFloor.push(color.r, color.g, color.b);
    }
  }

  floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

  const floorMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);

  // objects

  /* const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();

  position = boxGeometry.attributes.position;
  const colorsBox = [];

  for (let i = 0, l = position.count; i < l; i++) {

    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colorsBox.push(color.r, color.g, color.b);

  }

  boxGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3));

  for (let i = 0; i < 500; i++) {

    const boxMaterial = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true });
    boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
    box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
    box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

    scene.add(box);
    objects.push(box);

  }
 */
  //  BOXES

 
  const geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);



  var step=100;
  for (var i=0;i<fftSize/2 ; i++){
      const material = new THREE.MeshPhysicalMaterial(); 
      material.color.setRGB(0,155,0);  
      material.flatShading = false;
      material.shininess = 0.1; 
      material.roughness = 0.9;
      material.metalness = 0.0;
      material.fog = true;
      cube = new THREE.Mesh(geometry, material);  
      scene.add(cube);
      //cube.position.x = i*boxWidth*2 - (boxWidth*fftSize/2);

      cube.position.x = step*Math.cos(i*Math.PI*4/fftSize);
      cube.position.y = -1;
      cube.position.z = step*Math.sin(i*Math.PI*4/fftSize);
      cubes.push(cube); 
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
      audio.play();
      
    } );
  } else {
    const mediaElement = new Audio( file );
    
    mediaElement.play();
    audio.setMediaElementSource( mediaElement );
    audio.setLoop( true );
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
    raycaster.ray.origin.y -= 10;

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

    if (controls.getObject().position.y < 10) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

  }
  // -----------------------------------------------------------
  for (var i=0;i<fftSize/2 ; i++){ 
    cube = cubes[i];
    const speed = .2 + i * .1;
    const rot = time * speed;
  //  cube.rotation.x = rot;
     //cube.rotation.y = rot;
    /*  cube.position.x = step*Math.cos(i*Math.PI*4/fftSize);
    cube.position.z = step*Math.sin(i*Math.PI*4/fftSize); */
   
     if(musicOn){
      dataArray = analyser.getFrequencyData();  
     
      //cube = new THREE.Mesh(geometry, material);
      cube.scale.y = dataArray[i]/16; 
      console.log(dataArray[i]/128);
      cube.position.y = dataArray[i]/256+1;
      cube.material.color.setRGB( 50,dataArray[i]/256,1-dataArray[i]/256);
      //color = new THREE.Color(0xffffff ); //0.25,dataArray[i]/256,dataArray[i]/256);
      //cube.material.set(material);
      
      
      }
      
  }; 
 // -----------------------------

  prevTime = time;

  renderer.render(scene, camera);

}

//