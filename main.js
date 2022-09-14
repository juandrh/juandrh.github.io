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
const fftSize = 2048;
var dataArray = new Uint8Array(fftSize);

const stats = Stats();

const file = './assets/alex-productions-cinematic-epic-music-story.mp3';
//const audioCtx = new (window.AudioContext || window.webkitAudioContext)();	  
let mediaElement = new Audio( file );  
let listener = new THREE.AudioListener();
let audio = new THREE.Audio( listener );

const loader = new GLTFLoader();
const boxWidth = 0.05;
let cube = new THREE.Mesh(); 
let cube2 = new THREE.Mesh(); 
const cubes = []; 
const cubes2 = [];  
var yArray = new Float32Array(fftSize);
var yArray2 = new Float32Array(fftSize);  
const materials = [];  
const colorLights = 0x497296  // 0xf87205;

init();
animate();


function init() {

  document.body.appendChild(stats.dom);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = cameraY;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121a23);  // 0x050d4c
  scene.fog = new THREE.Fog(0x121a23, 0.1, 300);

  // LIGHTS

  const light3 = new THREE.PointLight( colorLights, 15, 70,2 );
  light3.position.set(30, 29, -100);
  scene.add(light3);
  const light4 = new THREE.PointLight( colorLights, 5, 70,2 );
  light4.position.set(0, 9, 100);
  scene.add(light4);
  const light5 = new THREE.PointLight( colorLights, 5, 70,2 );
  light5.position.set(30, 29, 0);
  scene.add(light5);
  const light6 = new THREE.PointLight( colorLights, 10, 70,2 );
  light6.position.set(-30, 59, -100);
  scene.add(light6);
  const light7 = new THREE.PointLight( colorLights, 10, 70,2 );
  light7.position.set(0, 29, -70);
  scene.add(light7);
  const light8 = new THREE.PointLight(colorLights, 5, 70,2 );
  light8.position.set(-30, 9, 150);
  scene.add(light8);
  const light9 = new THREE.PointLight( colorLights, 4, 70,2 );
  light9.position.set(0, 9, 250);
  scene.add(light9);
  const light10 = new THREE.PointLight( colorLights, 4, 70,2 );
  light10.position.set(30, 9, 100);
  scene.add(light10);
  const light11 = new THREE.PointLight( 0xffffff, 10, 70,2 );
  light11.position.set(-300, 9, 300);
  scene.add(light11);
  const light12 = new THREE.PointLight( colorLights, 2, 70,2 );
  light12.position.set(-20, 10, 25);
  scene.add(light12);
  const light13 = new THREE.PointLight( colorLights, 6, 70,2 );
  light13.position.set(-230, 12, -105);
  scene.add(light13);
  const light14 = new THREE.PointLight( colorLights, 4, 70,2 );
  light14.position.set(-230, 9, -175);
  scene.add(light14);


  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {
    const overlay = document.getElementById( 'blocker' );
    controls.lock();
    if (!musicOn){ 
      initMusic();
      musicOn= true;  
   } 
  

  });

  controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';


      audio.play();
    mediaElement.play();  
   
  });

  controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    
     audio.pause();
    mediaElement.pause(); 
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
      color.setRGB(rand * 0.02 + 0.25, rand *  0.02 + 0.115, rand *  0.015 + 0.05); 
      for (let j = 0 ; j < 6; j++) {
      colorsFloor.push(color.r, color.g, color.b);
      }
    }
  
    floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
  
    const floorMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });
  
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

  // town
  loader.load( './assets/town.glb', function ( gltf ) {  
    gltf.scene.position.z=168 //-200; 
    gltf.scene.position.x=-50 //-120; 
    gltf.scene.scale.x = 150;
    gltf.scene.scale.y = 150;
    gltf.scene.scale.z = 150;
    gltf.scene.rotation.y = 3*Math.PI/2-0.20;

    scene.add( gltf.scene );    
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {console.log(error) }
  ); 
  
  
  
  // snow
  const geometry = new THREE.SphereGeometry( boxWidth, 16, 16 );
  //const geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
  var step=35;
  for (var i=0;i<fftSize/2 ; i++){
      const material = new THREE.MeshPhysicalMaterial(); 
      material.color.setRGB(10, 10, 10);  
      material.flatShading = false;
      material.shininess = 1; 
      material.roughness = 0.9;
      material.metalness = 0.0;      
      materials.push(material); 
      cube = new THREE.Mesh(geometry, material);  
      cube2 = new THREE.Mesh(geometry, material);  
      scene.add(cube);
      scene.add(cube2);
     
      cube.position.x = Math.random()*200-100;        
      yArray[i]= Math.random()*150; 
      cube.position.y = yArray[i];
      cube.position.z = Math.random()*600-250;
      cubes.push(cube); 

      cube2.position.x = Math.random()*200-100;
      yArray2[i]= Math.random()*150; 
      cube2.position.y = yArray2[i];
      cube2.position.y = Math.random()*100;
      cube2.position.z =Math.random()*600-250;
      cubes2.push(cube2); 

   /*    cube.position.x = step-step*Math.cos(+1.2+i*Math.PI*2/fftSize)-22;
      cube.position.y = 50;
      cube.position.z = -step*Math.sin(1.2+i*Math.PI*2/fftSize)-70;
      cubes.push(cube); 
      cube2.position.x = -step+step*Math.cos(1.2+i*Math.PI*2/fftSize)+22;
      cube2.position.y = 50;
      cube2.position.z = -step*Math.sin(1.2+i*Math.PI*2/fftSize)-70;
      cubes2.push(cube2); */        


        
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
 
  if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
    const mloader = new THREE.AudioLoader();
    mloader.load( file, function ( buffer ) {
      audio.setBuffer( buffer );
      audio.setLoop( true );      
	    audio.setVolume( 1.0 );
      audio.play();
      
    } );
  } else {
    mediaElement = new Audio( file );    
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
    //const speed = .2 + i * .1;
    //const rot = time * speed;
    //cube.rotation.x = rot;
     //cube.rotation.y = rot;
    /*  cube.position.x = step*Math.cos(i*Math.PI*4/fftSize);
    cube.position.z = step*Math.sin(i*Math.PI*4/fftSize); */
    const snowScale = 2**(dataArray[i]/50);

     if(musicOn){
      if(yArray[i]<0){
        yArray[i]=150;
      }  else {yArray[i]=yArray[i]-0.2;}
      if(yArray2[i]<0){
        yArray2[i]=150;
      }  else {yArray2[i]=yArray2[i]-0.3;}
      dataArray = analyser.getFrequencyData();  
      cube.scale.x = snowScale; 
      cube.scale.y = snowScale; 
      cube.scale.z = snowScale; 
      cube.position.y = yArray[i];   

      cube2.scale.x = snowScale;    
      cube2.scale.y = snowScale; 
      cube2.scale.z = snowScale; 
      cube2.position.y = yArray2[i];   
      let snowInt = dataArray[i]/1200+0.79;
      cube.material.color.setRGB( snowInt,snowInt,snowInt);
      
      }
      
  }; 
 // -----------------------------

  prevTime = time;

  renderer.render(scene, camera);

}

//