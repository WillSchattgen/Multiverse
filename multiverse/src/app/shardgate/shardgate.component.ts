import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router } from '@angular/router';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {BackSide, DoubleSide, MathUtils} from 'three';

@Component({
  selector: 'app-shardgate',
  templateUrl: './shardgate.component.html',
  styleUrls: ['./shardgate.component.css']
})
export class ShardgateComponent implements OnInit {

  vertexShader = 'uniform vec2 uvScale;' +
  'varying vec2 vUv;' +
  'void main()' +
  '{' +
    'vUv = uvScale * uv;' +
    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );' +
    'gl_Position = projectionMatrix * mvPosition;' +
  '}';

  fragmentShader = 'uniform float time;' +
  'uniform float fogDensity;' +
  'uniform vec3 fogColor;' +
  'uniform sampler2D texture1;' +
  'uniform sampler2D texture2;' +
  'varying vec2 vUv;' +
  'void main( void ) {' +
    'vec2 position = - 1.0 + 2.0 * vUv;' +
    'vec4 noise = texture2D( texture1, vUv );' +
    'vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;' +
    'vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;' +
    'T1.x += noise.x * 2.0;' +
    'T1.y += noise.y * 2.0;' +
    'T2.x -= noise.y * 0.2;' +
    'T2.y += noise.z * 0.2;' +
    'float p = texture2D( texture1, T1 * 2.0 ).a;' +
    'vec4 color = texture2D( texture2, T2 * 2.0 );' +
    'vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );' +
    'if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }' +
    'if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }' +
    'if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }' +
    'gl_FragColor = temp;' +
    'float depth = gl_FragCoord.z / gl_FragCoord.w;' +
    'const float LOG2 = 1.442695;' +
    'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );' +
    'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );' +
    'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );' +
  '}';

  //shaders
  textureLoader = new THREE.TextureLoader();

	uniforms = {
  	"fogDensity": { value: 0.00 },
		"fogColor": { value: new THREE.Vector3( 0, 0, 0 ) },
		"time": { value: 1.0 },
		"uvScale": { value: new THREE.Vector2( .1, .1 ) },
		"texture1": { value: this.textureLoader.load( '../../assets/cloud.png' ) }//,
		//"texture2": { value: this.textureLoader.load( '../../assets/purple_smoke.jpg' ) }
	};

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.1, 1000);

  //renderer = new THREE.WebGLRenderer({alpha: true});
  renderer = new THREE.WebGLRenderer();
  geometry = new THREE.TorusGeometry(8,1,16,100);
  material = new THREE.MeshStandardMaterial( {color: 0xFF6347} );
  torus = new THREE.Mesh(this.geometry, this.material);
  pointLight = new THREE.PointLight(0xffffff);
  pointLight2 = new THREE.SpotLight(0xffffff);
  //lightHelper = new THREE.PointLightHelper(this.pointLight)
 
  //ambientLight = new THREE.AmbientLight(0xffffff);

  gridHelper = new THREE.GridHelper(200, 50);

  controls = new OrbitControls(this.camera, this.renderer.domElement);
  //controls = new TrackballControls(this.camera, this.renderer.domElement);

  nextBrightness = 1;

  outerLights: THREE.PointLight[] = [];

  innerLights: THREE.PointLight[] = [];

  innerCrystals: THREE.Mesh[] = [];

  selections: THREE.Mesh[] = [];

  outerCrystals: THREE.Mesh[] = [];

  activate: boolean = false;

  crystal1 = this.createOuterCrystals(1);
  crystal2 = this.createOuterCrystals(2);
  crystal3 = this.createOuterCrystals(3);
  crystal4 = this.createOuterCrystals(4);
  crystal5 = this.createOuterCrystals(5);
  crystal6 = this.createOuterCrystals(6);
  crystal7 = this.createOuterCrystals(7);
  crystal8 = this.createOuterCrystals(8);
  crystal9 = this.createOuterCrystals(9);
  crystal10 = this.createOuterCrystals(10);
  crystal11 = this.createOuterCrystals(11);
  crystal12 = this.createOuterCrystals(12);
  crystal13 = this.createOuterCrystals(13);
  crystal14 = this.createOuterCrystals(14);
  crystal15 = this.createOuterCrystals(15);
  crystal16 = this.createOuterCrystals(16);

  portal = null;

  positionStart = Math.PI * 2 * ((-4)/16);

  currentPosition = this.positionStart;

  spinCount = 0;

  positionIncriment = (Math.PI * 2 * ((-4)/16)) - this.spinCount;

  speed = 16;

  outerRadius = 16;

  flickerValue = .1;

  flickerCount = 0;

  gateFlicker: boolean = false;

  composer = new EffectComposer(this.renderer);

  horizon = new THREE.Mesh();

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    var element = document.getElementById("mapFrame");
    if (element != null) {
      element.appendChild(this.renderer.domElement);
    }
    this.controls.zoomSpeed = 3;
    this.controls.autoRotateSpeed = .25;
    this.controls.minZoom = 50;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
	  this.uniforms[ "texture1" ].value.wrapS = this.uniforms[ "texture1" ].value.wrapT = THREE.RepeatWrapping;
	  //this.uniforms[ "texture2" ].value.wrapS = this.uniforms[ "texture2" ].value.wrapT = THREE.RepeatWrapping;
  
    this.camera.position.setZ(20);
    this.camera.position.setY(40);
    this.pointLight.position.set(50, 50, 30);
    //this.pointLight.penumbra = 1;
    this.pointLight.intensity = 1;
    this.pointLight.distance = 300;
    this.pointLight.decay = 2;
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = 512;
    this.pointLight.shadow.mapSize.height = 512;
    this.pointLight.shadow.camera.near = 10;
    this.pointLight.shadow.camera.far = 200;
    //this.pointLight.shadow.focus = 1;
    this.scene.add(this.pointLight);

    this.pointLight2.position.set(-50, 50, 30);
    this.pointLight2.penumbra = 1;
    this.pointLight2.decay = 2;
    this.pointLight2.castShadow = true;
    this.pointLight2.shadow.mapSize.width = 512;
    this.pointLight2.shadow.mapSize.height = 512;
    this.pointLight2.shadow.camera.near = 10;
    this.pointLight2.shadow.camera.far = 200;
    this.pointLight2.shadow.focus = 1;
    //this.scene.add(this.pointLight2);
    //this.scene.add(this.lightHelper);
    //this.scene.add(this.ambientLight);
    //this.scene.add(this.gridHelper);
    //this.scene.background = new THREE.Color(0xFF00FF);
    //this.scene.add(this.torus);

    var roomGeometry = new THREE.BoxGeometry(200, 150, 200);
    var roomMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
    roomMaterial.side = BackSide;
    var roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
    roomMesh.position.y = 50;

    this.scene.add(roomMesh);
    this.createTable();
    this.createInnerCrystals();
    this.animate();
  }

  createTable(){
    var geometry = new THREE.BoxGeometry(72, 50, 72);
    var material = new THREE.MeshStandardMaterial({color: 0x696969});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -28, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
  }


  createOuterCrystals(i: number): THREE.Mesh{
    var total = 16

    var texture = new THREE.TextureLoader().load( "../../assets/shardgate/" + (i).toString() + ".png" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 4, 2);

    var theta = Math.PI * 2;
    var r = 16;
    var x = (r * Math.cos(theta * ((i-5)/total)));
    var y = 0;
    var z = (r * Math.sin(theta * ((i-5)/total)));

    var cubeLight = new THREE.PointLight(0x0000ff);
    cubeLight.intensity = 0;
    cubeLight.decay = 15;
    cubeLight.distance = 130;

    cubeLight.position.x = x;
    cubeLight.position.y = y+2;
    cubeLight.position.z = z;
    this.scene.add(cubeLight);

    var shardGeometry = new THREE.OctahedronGeometry(1.5, 0);
    var shardMaterial = new THREE.MeshStandardMaterial({map: texture, alphaTest: 0.5});
    shardMaterial.side = DoubleSide;
    var shard = new THREE.Mesh(shardGeometry, shardMaterial);
    shard.position.x = x;
    shard.position.y = y;
    shard.position.z = z;
    shard.castShadow = true;

    shard.children.push(cubeLight);
    shard.name = (i).toString();
    this.scene.add(shard);
    this.outerLights.push(cubeLight);
    this.outerCrystals.push(shard);
    return shard;
  }

  selectCrystal(crystal: THREE.Mesh, light: THREE.PointLight){
    this.lightCrystal(light, 1);
    this.selections.push(crystal);
    var combonation: number[] = [];
    var combonationString = '/';
    if(this.selections.length == 5){
      for(var i = 0; i < this.selections.length; i++){
        combonation.push(Number.parseInt(this.selections[i].name));
        combonationString = combonationString + this.selections[i].name + "/";
      }
      var destination = this.checkSolution(combonationString)
      if(destination != null){
        this.outerLights.forEach(element => {
          this.lightCrystal(element, 1);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, 1);
        });
        this.activate = true;
      } else {
        console.log(Number.parseInt(this.selections[4].name) > 99);
        if (Number.parseInt(this.selections[4].name) > 99) {
          this.selections = [];
          this.gateFlicker = true;
          this.flickerCount = 0;
          this.outerLights.forEach(element => {
            this.lightCrystal(element, 0);
          });
          this.innerLights.forEach(element => {
            this.lightCrystal(element, 0);
          });
        } else {
          this.selections = [];
          this.outerLights.forEach(element => {
            this.lightCrystal(element, 0);
          });
          this.innerLights.forEach(element => {
            this.lightCrystal(element, 0);
          });
        }
      }
    }
  }

  flickerGate() {
    if (this.flickerCount < 4) {
      if (this.innerLights[0].intensity >= 1) {
        this.flickerValue = -.1;
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
      } else if (this.innerLights[0].intensity <= 0) {
        this.flickerValue = .2;
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.flickerCount++;
      } else {
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
      }
    } else if (this.flickerCount < 5) {
      if (this.innerLights[0].intensity >= 1) {
        this.flickerValue = -.02;
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
      } else if (this.innerLights[0].intensity <= 0) {
        this.flickerValue = .02;
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.flickerCount++;
      } else {
        this.outerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
        this.innerLights.forEach(element => {
          this.lightCrystal(element, element.intensity + this.flickerValue);
        });
      }
    } else {
      this.flickerCount = 0;
      this.flickerValue = .01;
      this.gateFlicker = false;
      this.outerLights.forEach(element => {
        this.lightCrystal(element, 0);
      });
      this.innerLights.forEach(element => {
        this.lightCrystal(element, 0);
      });
    }
  }

  activateGate() {
    var r = this.outerRadius;
    var position = this.positionStart;
    var innerPosition = this.positionStart;
    
    this.spinCount ++;
    this.positionIncriment = Math.PI / 8;

    this.crystal1.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal1.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[0].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[0].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal2.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal2.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[1].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[1].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal3.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal3.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[2].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[2].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal4.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal4.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[3].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[3].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal5.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal5.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[4].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[4].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal6.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal6.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[5].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[5].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal7.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal7.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[6].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[6].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal8.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal8.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[7].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[7].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal9.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal9.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[8].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[8].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal10.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal10.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[9].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[9].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal11.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal11.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[10].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[10].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal12.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal12.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[11].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[11].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal13.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal13.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[12].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[12].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal14.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal14.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[13].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[13].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal15.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal15.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[14].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[14].position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    position += this.positionIncriment;

    this.crystal16.position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.crystal16.position.z = r * Math.sin((position + (this.spinCount/this.speed)));
    this.outerLights[15].position.x = r * Math.cos((position + (this.spinCount/this.speed)));
    this.outerLights[15].position.z = r * Math.sin((position + (this.spinCount/this.speed)));

    this.innerCrystals.forEach(element => {
      element.position.x = .5 * r * Math.cos((innerPosition - (this.spinCount/this.speed)));
      element.position.z = .5 * r * Math.sin((innerPosition - (this.spinCount/this.speed)));
      element.children[0].position.x = element.position.x;
      element.children[0].position.z = element.position.z;
      innerPosition += this.positionIncriment * 2; 
    });

    if(this.outerRadius < 40){
      this.outerRadius += .05;
      if (this.outerRadius >= 20) {
        this.pointLight.intensity = 0;
      }
      if (this.outerRadius >= 40) {
        this.createHorizon();
      }
    }
  }

  checkSolution(combonationString: string): THREE.Mesh | null{
    console.log(combonationString);
    var check1_1 = new RegExp('\/16\/6\/|\/6\/16\/');
    var check1_2 = new RegExp('\/2\/12\/|\/12\/2\/');
    var check1_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check2_1 = new RegExp('\/14\/4\/|\/4\/14\/');
    var check2_2 = new RegExp('\/2/8\/|\/8/2\/');
    var check2_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check3_1 = new RegExp('\/10\/4\/|\/4\/10\/');
    var check3_2 = new RegExp('\/16\/6\/|\/6\/16\/');
    var check3_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check4_1 = new RegExp('\/12\/6\/|\/6\/12\/');
    var check4_2 = new RegExp('\/2\/8\/|\/8\/2\/');
    var check4_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check5_1 = new RegExp('\/14\/8\/|\/8\/14\/');
    var check5_2 = new RegExp('\/4\/10\/|\/10\/4\/');
    var check5_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check6_1 = new RegExp('\/16\/10\/|\/10\/16\/');
    var check6_2 = new RegExp('\/8\/12\/|\/12/8\/');
    var check6_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check7_1 = new RegExp('\/12\/2\/|\/2\/12\/');
    var check7_2 = new RegExp('\/8\/14\/|\/14\/8\/');
    var check7_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    var check8_1 = new RegExp('\/14\/4\/|\/4\/14\/');
    var check8_2 = new RegExp('\/10\/16\/|\/16\/10\/');
    var check8_3 = new RegExp('(\/[0-9]+){4}\/400\/');
    if(check1_1.test(combonationString) 
      && check1_2.test(combonationString) 
      && check1_3.test(combonationString)){
      console.log("Success1");
      this.innerLights[0].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      this.lightCrystal(this.innerLights[0], 1);
      return this.innerCrystals[0];
    } else if(check2_1.test(combonationString)
      && check2_2.test(combonationString)
      && check2_3.test(combonationString)){
      console.log("Success2");
      this.innerLights[1].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[1];
    } else if(check3_1.test(combonationString)
      && check3_2.test(combonationString)
      && check3_3.test(combonationString)){
      console.log("Success3");
      this.innerLights[2].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[2];
    } else if(check4_1.test(combonationString)
      && check4_2.test(combonationString)
      && check4_3.test(combonationString)){
      console.log("Success4");
      this.innerLights[3].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[3];
    } else if(check5_1.test(combonationString)
      && check5_2.test(combonationString)
      && check5_3.test(combonationString)){
      console.log("Success5");
      this.innerLights[4].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[4];
    } else if(check6_1.test(combonationString)
      && check6_2.test(combonationString)
      && check6_3.test(combonationString)){
      console.log("Success6");
      this.innerLights[5].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[5];
    } else if(check7_1.test(combonationString)
      && check7_2.test(combonationString)
      && check7_3.test(combonationString)){
      console.log("Success7");
      this.innerLights[6].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[6];
    } else if(check8_1.test(combonationString)
      && check8_2.test(combonationString)
      && check8_3.test(combonationString)){
      console.log("Success8");
      this.innerLights[7].color = new THREE.Color(0xFF0000);
      this.innerLights[3].color = new THREE.Color(0x00FF00);
      return this.innerCrystals[7];
    }
    return null;
  }

  lightCrystal(light: THREE.PointLight, intensity: number){
    light.intensity = intensity;
  }

  createInnerCrystals(){
    var total = 8
    var center = new THREE.Vector3(0,0,0);

    for(var i = 0; i < total; i++){

    var texture = new THREE.TextureLoader().load( "../../assets/shardgate/" + (i + 1).toString() + "00.png" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );

      if (total > 1){
        var theta = Math.PI * 2;
        var r = 8.5;
        var x = (r * Math.cos(theta * ((i-2)/total))) + center.x;
        var y = center.y;
        var z = (r * Math.sin(theta * ((i-2)/total))) + center.z;
      } else {
        var x = center.x;
        var y = center.y;
        var z = center.z;
      }

      var geometry = new THREE.OctahedronGeometry(1.5, 0);
      var material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
      var crystal = new THREE.Mesh(geometry, material);
      //var star = new THREE.PointLight(colors[MathUtils.randInt(0, colors.length)]);
      crystal.position.x = x;
      crystal.position.y = y;
      crystal.position.z = z;
      crystal.castShadow = true;
      crystal.name = (i+1) + '00';

      var cubeLight = new THREE.PointLight(0x0000ff);
      cubeLight.intensity = 0;
      cubeLight.decay = 15;
      cubeLight.distance = 130;

      cubeLight.position.x = x;
      cubeLight.position.y = y + 2;
      cubeLight.position.z = z;
      crystal.children.push(cubeLight);
      this.scene.add(cubeLight);
      this.innerLights.push(cubeLight);
      this.innerCrystals.push(crystal);
      this.scene.add(crystal);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    //animate shaders
    this.uniforms[ 'time' ].value += 0.2 * .25;
    this.renderer.clear();

    this.candle();

    //this.wildCrystal.position.x = Math.sin(0.7 * this.spinCount) * 30;
    //console.log(this.wildCrystal.position.x);
    //this.wildCrystal.position.z = Math.cos(0.3 * this.spinCount ) * 30;
    //this.spinCount++;

    // this.pointLight.position.x += MathUtils.randFloat(-.1, .1) *2;
    // this.pointLight.position.y += MathUtils.randFloat(-.1, .1) *4;
    // this.pointLight.position.z += MathUtils.randFloat(-.1, .1) *2;
    if (this.activate) {
      this.activateGate();
    }

    if (this.gateFlicker) {
      console.log("test");
      this.flickerGate();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  onClickCanvas(event:any):any{
    console.log(event);
    console.log(this.camera);
    var xAndY = this.getRelativeMouseXY(event);
    var mouseX = xAndY[0];
    var mouseY = xAndY[1];
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    //var boundObjs	= this._boundObjs[eventName];
    //if( boundObjs === undefined || boundObjs.length === 0 )	return;
    // compute the intersection
    var vector = new THREE.Vector2();

    // update the picking ray with the camera and mouse position
    vector.set( mouseX, mouseY );
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(vector, this.camera);	

    var intersects = raycaster.intersectObjects(this.scene.children);
    // if there are no intersections, return now
    console.log(intersects);
    if( intersects.length === 0 )	return;
    // init some variables
    // var intersect	= intersects[0];
    // var object3d	= intersect.object;
    // var objectParent = object3d.parent;
    var meshes: any[] = [];

    intersects.forEach(element => {
      if(element.object.name.match('[0-9]+')){
        meshes.push(element.object);
      }
    });

    if( meshes.length === 0 )	return;
    var object3d = meshes[0];
    if(object3d.children[0] != null){
      this.selectCrystal(object3d, object3d.children[0]);
    }
  }

  getRelativeMouseXY(event:any): any[]{
    var element = event.target || event.srcElement;
    if (element.nodeType === 3) {
      element = element.parentNode; // Safari fix -- see http://www.quirksmode.org/js/events_properties.html
    }
    
    //get the real position of an element relative to the page starting point (0, 0)
    //credits go to brainjam on answering http://stackoverflow.com/questions/5755312/getting-mouse-position-relative-to-content-area-of-an-element
    var elPosition	= { x : 0 , y : 0};
    var tmpElement	= element;
    //store padding
    var style	= getComputedStyle(tmpElement, null);
    elPosition.y += parseInt(style.getPropertyValue("padding-top"), 10);
    elPosition.x += parseInt(style.getPropertyValue("padding-left"), 10);
    //add positions
    do {
      elPosition.x	+= tmpElement.offsetLeft;
      elPosition.y	+= tmpElement.offsetTop;
      style		= getComputedStyle(tmpElement, null);
  
      elPosition.x	+= parseInt(style.getPropertyValue("border-left-width"), 10);
      elPosition.y	+= parseInt(style.getPropertyValue("border-top-width"), 10);
    } while(tmpElement = tmpElement.offsetParent);
    
    var elDimension	= {
      width	: (element === window) ? window.innerWidth	: element.offsetWidth,
      height	: (element === window) ? window.innerHeight	: element.offsetHeight
    };
    console.log('x :' + (+((event.pageX - elPosition.x) / elDimension.width ) * 2 - 1));
    console.log("y :" + (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1));
    return [(+((event.pageX - elPosition.x) / elDimension.width ) * 2 - 1), (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1)];
  }

  resize(any:any) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.renderer.render(this.scene, this.camera);
  }

  createHorizon() {
    var geometry = new THREE.CircleGeometry(39, 72);

    const material = new THREE.ShaderMaterial( {

      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true
    } );

    //var material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
    this.horizon = new THREE.Mesh(geometry, material);
    this.horizon.position.y = 0;
    this.horizon.rotation.x = Math.PI * -.5;
    this.scene.add(this.horizon);
  }

  candle(){
    if(this.activate == false){
      if(Math.abs(this.pointLight.intensity - this.nextBrightness) < .2){
        this.nextBrightness = MathUtils.randFloat(.6, 1.2);
      } else if (this.pointLight.intensity > this.nextBrightness) {
        this.pointLight.intensity -= .005;
      } else {
        this.pointLight.intensity += .005;
      }
    
      var xFlicker = MathUtils.randFloat(-.1, .1) * 4;
      var yFlicker = MathUtils.randFloat(-.1, .1) * 8;
      var zFlicker = MathUtils.randFloat(-.1, .1) * 4;
    
      if(!(this.pointLight.position.x < 48 && xFlicker < 0)
          && !(this.pointLight.position.x > 52 && xFlicker > 0)){
        this.pointLight.position.x += xFlicker;
      }
    
      if (!(this.pointLight.position.y < 48 && yFlicker < 0)
          && !(this.pointLight.position.y > 52 && yFlicker > 0)) {
        this.pointLight.position.y += yFlicker;
      }
    
      if (!(this.pointLight.position.z < 28 && zFlicker < 0)
          && !(this.pointLight.position.z > 32 && zFlicker > 0)) {
        this.pointLight.position.z += zFlicker;
      }
    }
  }
}

