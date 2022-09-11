

// Three.js - Textured Cube - Wait for Texture
// from https://threejs.org/manual/examples/textured-cube-wait-for-texture.html


import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { FirstPersonControls} from 'Controls';




function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.001;
  const far = 50000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  let FPcontrols;
  const clock = new THREE.Clock();

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const cubes = [];  // just an array we can use to rotate the cubes
  const loader = new THREE.TextureLoader();
  loader.load('./assets/juan.jpg', (texture) => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubes.push(cube);  // add to our list of cubes to rotate
  });


  /* const loader2 = new GLTFLoader();
    loader2.load( './assets/scene.gltf', function ( gltf ) {    
      scene.add( gltf.scene );    
    }, undefined, function ( error ) {    
      console.error( error );    
    } ); */


   const loader2 = new GLTFLoader();

    loader2.load( './assets/scene.gltf', function ( gltf ) {    
      scene.add( gltf.scene );    
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
    ); 

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

  FPcontrols = new FirstPersonControls(camera, canvas);
  FPcontrols.movementSpeed = 1.50;
  FPcontrols.lookSpeed = 0.1;

  const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
 
  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

     cubes.forEach((cube, ndx) => {
      const speed = .2 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    }); 


    
    FPcontrols.update( clock.getDelta() );
    
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
