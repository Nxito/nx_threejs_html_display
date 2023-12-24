import * as THREE from "three";
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const w = window.innerWidth
const h = window.innerHeight

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75,w/h,0.1,1000);
camera.position.y = 2;
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

const renderScene = new RenderPass ( scene, camera)

const bloomPass = new UnrealBloomPass ( new THREE.Vector2(w,h),1.5,0.4,100)
// strength,  kernel size,  sigma, blur render target resolution
bloomPass.threshold = 0;
bloomPass.strength = 2.0;
bloomPass.radius = 0;

const composer = new EffectComposer( renderer )
composer.addPass(renderScene);
composer.addPass( bloomPass );



scene.fog = new THREE.FogExp2(0x000000,0.04)
const basicSquare = new THREE.PlaneGeometry();
const colorPallete = [0xfe3508, 0x882121, 0x92505c, 0x300e22, 0x4f0505 ];
const limit = 81;
const speed = 0.05;

function getSquare() {
    const x = Math.round(Math.random() * 30) - 15.5;
    const y = Math.round(Math.random()) * 4;
    const z = Math.round(Math.random() * -80) - 0.5;
  
    const basicMat = new THREE.MeshBasicMaterial({
      color: colorPallete[Math.floor(Math.random()* colorPallete.length)],
      side: THREE.DoubleSide
    });
    const geo = new THREE.Mesh(basicSquare, basicMat);
    geo.position.set(x, y, z);
    geo.rotation.x = -90 * Math.PI / 180;
 
    return {
      geo,
      update() {
        geo.position.z += speed;
        if (geo.position.z > 4) {
          geo.position.z = -limit;
        }
      },
    };
  }
  
  const boxes = Array(800).fill().map(getSquare);
  boxes.forEach((b) => scene.add(b.geo));
  
  camera.position.y = 2;
  camera.position.z = 5;
  
  let paused = false;
  function animate() {
    requestAnimationFrame(animate);
    if (!paused) {
      boxes.forEach((b) => b.update());
      camera.rotation.z += 0.0006;
      composer.render(scene, camera);
    }
  }
  animate();
  
  function handleKeyDown(evt) {
    const { key } = evt;
    if (key === "Escape") {
      paused = !paused;
    }
  }
  
  document.body.addEventListener("keydown", handleKeyDown);