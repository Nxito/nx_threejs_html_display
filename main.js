	import * as THREE from "three";
	import {
		CSS3DRenderer,
		CSS3DObject,
	} from "three/examples/jsm/renderers/CSS3DRenderer.js";
	import { TrackballControls } from "three/addons/controls/TrackballControls.js";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";
	import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

	import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
	import { GUI } from "three/addons/libs/lil-gui.module.min.js";


	class displayer3D {
		constructor(fileName,meshName,options) {
			this.camera = null;
			this.scene = null;
			this.renderer = null;
			this.scene2 = null;
			this.renderer2 = null;
			this.controls = null;
			this.filename = fileName || ""
			this.meshname = meshName || ""
			this.options = options || {}
			this.options.loadScale = options.loadScale || {x:40,y:40,z:40}
			this.options.loadRotation = options.loadRotation //|| new THREE.Euler( -0.45, 0, 0, 'XYZ' )
			this.options.displayElement = options.displayElement
			this.options.displayElementRotation = options.displayElementRotation


		}
	
		async loadModel() {
			let loadScale = this.options.loadScale
			let loadRotation = this.options.loadRotation
			return new Promise((resolve, reject) => {
				var loader = new GLTFLoader();
	
				loader.load(
					this.filename,
					function (glb) {
						let item = glb.scene;
	
						item.scale.set(
							loadScale.x, 
							loadScale.y,
							loadScale.z 
							);

						if(loadRotation){
							item.rotation.set(
								loadRotation.x, 
								loadRotation.y,
								loadRotation.z 
								);	
						} 
	
						resolve(item); 
					},
					undefined,
					(error) => {
						console.error(error);
						reject(error);  
					}
				);
			});
		}
	
		prepareScenario() {
			const domElement = this.options.domElement ? this.options.domElement :  window;
	 
			const dimensions = domElement.getBoundingClientRect()
			this.camera = new THREE.PerspectiveCamera(
				45,
				dimensions.width / dimensions.height,
				1,
				1000
			);
			this.camera.position.set(250, 250, 250);
	
			// var gridGround = new THREE.GridHelper(1000, 30, 0x3f3f3f, 0x3f3f3f);
			// this.scene.add(gridGround);
			// var axesHelper = new THREE.AxesHelper(50);
			// // The X axis is red. The Y axis is green. The Z axis is blue.
			// this.scene.add(axesHelper);
	
			let light = new THREE.AmbientLight(0xffffff);
			this.scene.add(light);
		}
	
		async prepareItems() { 
			var loadedModel = await this.loadModel();
			var element;
			this.scene.add(loadedModel);
			console.log({ loadedModel }); 
		
			if(!this.options.displayElement){
				element = document.createElement("div");
				element.id = "web3dItem";
				element.innerHTML = "<button id='mybutton'>Test</button>";
				element.style.width = "113px";
				element.style.height = "77px";
				element.style.opacity = 1;
				// element.style["marginLeft"] = "3px";
				element.style["marginTop"] = "5px";
		
				element.style.background = new THREE.Color(
					Math.random() * 0xffffff
				).getStyle();
				element.querySelector("button").addEventListener("pointerdown", () => {
					console.log(1);
				});
				
			}else if(typeof this.options.displayElement == "function"){
				element = this.options.displayElement()
			}else{
				element = this.options.displayElement
			}
	
			var object = new CSS3DObject(element);
	 
			var target = new THREE.Vector3(); 
			var target2 =new THREE.Quaternion();
			loadedModel.getObjectByName(this.meshname).getWorldPosition( target );
			object.position.copy(target)
			
			if ( this.options.displayElementRotation){
				object.rotation.set(this.options.displayElementRotation.x,
					this.options.displayElementRotation.y,
					this.options.displayElementRotation.z);

			}
			// object.rotation.copy(new THREE.Euler( -0.45, 0, 0, 'XYZ' ));
			// object.rotation.set(this.options.displayElementRotation);
			this.scene2.add(object);
		}
	
		prepareRender() {
			const domElement = this.options.domElement ? this.options.domElement :  document.body;
	 
			const dimensions = domElement.getBoundingClientRect()
			this.renderer = new THREE.WebGLRenderer();
			// this.renderer.setClearColor(0xfefefe);
			this.renderer.setClearColor( 0xffffff, 0 );
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(dimensions.width, dimensions.height);
			domElement.appendChild(this.renderer.domElement);

			this.renderer2 = new CSS3DRenderer();
			this.renderer2.setSize(dimensions.width, dimensions.height);
			this.renderer2.domElement.style.position = "absolute";
			this.renderer2.domElement.style.top = 0;
			domElement.appendChild(this.renderer2.domElement);

			this.controls = new OrbitControls(this.camera, this.renderer2.domElement);
			this.controls.minPolarAngle = Math.PI/2;
			this.controls.maxPolarAngle = Math.PI/2;	
		}
	
		async init() {
			this.scene = new THREE.Scene();
			this.scene2 = new THREE.Scene();
			this.prepareScenario();
			await this.prepareItems();
			this.prepareRender();
			this.animate()
		}
	
		animate() {
			const controls = this.controls
			const renderer = this.renderer
			const renderer2 = this.renderer2
			const scene = this.scene
			const scene2 = this.scene2
			const camera = this.camera
			var  rotateCondition = this.options.rotateCondition  

			function rotateZCondition(cond) {
				if(typeof cond === 'function'){
					return cond(camera)
				}
				else{
					return (
						camera.rotation.z >= 1 || camera.rotation.z <= -1
						)
				} 
			}
			anim()
			function anim() {
				requestAnimationFrame(anim);
				controls.update();
		
				renderer.render(scene, camera);
				renderer2.render(scene2, camera);
				// fix limitation of css3dobject: css alwais is in front of the canvas.
				// on  rotate, hide the element "tricks" the functionality

				let element = document.querySelector("#web3dItem");
				 
				if (rotateZCondition(rotateCondition)) {
					element.style.display = "none";
				} else {
					element.style.display = "block";
				}
			}
			
		}
	}
	
 	const app = new displayer3D("/gameboy_advance_sp.glb", "Screen001_1",{
		domElement:document.getElementById("app"),
		rotateCondition: function(camera){
			return (camera.rotation.z >= 1 ||  camera.rotation.z <= -1)
			 
		},
		loadScale: {x:40,y:40,z:40},
		loadRotation:{x:0,y:0,z:0},
		displayElement:function (element) {
			element = document.createElement("div");
			element.id = "web3dItem";
			element.innerHTML = "<button id='mybutton'>Test</button>";
			element.style.width = "113px";
			element.style.height = "77px";
			element.style.opacity = 1;
			// element.style["marginLeft"] = "3px";
			element.style["marginTop"] = "5px";
	
			element.style.background = new THREE.Color(
				 0xffffff
			).getStyle();
			element.querySelector("button").addEventListener("pointerdown", () => {
				console.log("display element works");
			});

			return element
			
		},
		displayElementRotation:{x:-0.45,y:0,z:0},
	});
	app.init();  // Start the animation loop
	console.log({app});
	