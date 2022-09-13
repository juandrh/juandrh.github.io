

// Three.js - Textured Cube - Wait for Texture
// from https://threejs.org/manual/examples/textured-cube-wait-for-texture.html


import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { FirstPersonControls} from 'Controls';
import Stats from 'stats'; //"/jsm/libs/stats.module.js";


// Start 
const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', main );


function main() {
  const canvas = document.querySelector('#c');
  const xElem = document.querySelector('#x');
  const yElem = document.querySelector('#y');
  const zElem = document.querySelector('#z');
  const renderer = new THREE.WebGLRenderer({canvas});
  const scene = new THREE.Scene();
  const fov = 75;
  const aspect = 2;  
  const near = 0.01;
  const far = 500;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.y = 1;
  // Camera Movement 
  let FPcontrols;
  FPcontrols = new FirstPersonControls(camera, canvas);
  FPcontrols.movementSpeed = 0.350;
  FPcontrols.lookSpeed = 0.03;
  const clock = new THREE.Clock();
  let audioOn;  
  let  analyser, uniforms; 
  const fftSize = 512;
  var dataArray = new Uint8Array(fftSize);
  const stats = Stats();
  document.body.appendChild(stats.dom);

  // FOG
  const colorFog = 'rgb(50, 50,  50)';  // white
  const nearFog = 0.01 ;
  const farFog = 1;
  scene.colorFog = new THREE.Fog(colorFog, nearFog, farFog);
  const density = 2;
  //scene.fog = new THREE.FogExp2(colorFog, density);
 
  // Background
  scene.background = new THREE.Color( 'rgb(50, 50,  50)' );

  // Meshes
  const boxWidth = 0.02;
  let color = new THREE.Color(0,0,0);
  let cube = new THREE.Mesh();   
  const geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
  const cubes = [];    
  const materials = []; 

  const floorGeometry = new THREE.PlaneGeometry(2, 2);
  const floorMaterial = new THREE.MeshPhysicalMaterial();  
  floorMaterial.color.setRGB(255,255,255); 
  floorMaterial.fog = true;  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial); 
  floor.position.y = -0.1;
  floor.rotation.x = -Math.PI / 2;
 
  scene.add(floor);

  // Create meshes

  var step=1;
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
      cube.position.z = step*Math.sin(i*Math.PI*4/fftSize);
      cubes.push(cube); 
      materials.push(material);   
  }
 
  // Screen resize
  function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
  }
   

  // lights
  color = 0xFFFFFF;
  const intensity = 0.80;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(5, 10, 0);
  light.target.position.set(-5, 0, 0);
 /*  scene.add(light);
  scene.add(light.target); */
  const light2 = new THREE.PointLight(color, intensity);
  light2.position.set(-1, 5, 5);
  scene.add(light2);


  // Init audio
  const overlay = document.getElementById( 'overlay' );
  overlay.remove();
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
        audioOn= true;      
      
 

  // LOOP     
  function render(time) {
    time *= 0.001;   
    stats.update();
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    
    for (var i=0;i<fftSize/2 ; i++){ 
      cube = cubes[i];
      const speed = .2 + i * .1;
      const rot = time * speed;
    //  cube.rotation.x = rot;
       //cube.rotation.y = rot;
      /*  cube.position.x = step*Math.cos(i*Math.PI*4/fftSize);
      cube.position.z = step*Math.sin(i*Math.PI*4/fftSize); */
     
      if(audioOn){
        dataArray = analyser.getFrequencyData();  
        
        //xElem.textContent = "a: " + dataArray[i]; 
      
        
        //cube = new THREE.Mesh(geometry, material);
        cube.scale.y = dataArray[i]/16; 
        console.log(dataArray[i]/128);
        cube.position.y = dataArray[i]/1024;
        cube.material.color.setRGB( 50,dataArray[i]/256,1-dataArray[i]/256);
        //color = new THREE.Color(0xffffff ); //0.25,dataArray[i]/256,dataArray[i]/256);
        //cube.material.set(material);
        
        
        }
        
    }; 

    FPcontrols.update( clock.getDelta() );    
    renderer.render(scene, camera);
    requestAnimationFrame(render);  
    if (step <4){step += 0.01;  
    }else {step = 0.1;}
  }
  
  requestAnimationFrame(render);
}
//
