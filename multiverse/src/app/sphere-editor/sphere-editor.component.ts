import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router } from '@angular/router';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {BackSide, MathUtils, MeshStandardMaterial, PositionalAudio, Vector3} from 'three';
import { CrystalSphere } from '../crystal-sphere';
import { Orbit } from '../orbit';
import { OrbitalBody } from '../orbital-body';
import { OrbitalBodyType } from '../orbital-body-type';

const defaultStarSize = 10;

@Component({
  selector: 'app-sphere-editor',
  templateUrl: './sphere-editor.component.html',
  styleUrls: ['./sphere-editor.component.css']
})
export class SphereEditorComponent implements OnInit {

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

  //lightHelper = new THREE.PointLightHelper(this.pointLight)
 
  ambientLight = new THREE.AmbientLight(0xffffff);

  gridHelper = new THREE.GridHelper(800, 10);

  controls = new OrbitControls(this.camera, this.renderer.domElement);

  crystalSphere = new CrystalSphere();

  gravityWellCollapse: boolean = false;

  bodyTypes: OrbitalBodyType[] = [OrbitalBodyType.aqueous, 
  OrbitalBodyType.belt, OrbitalBodyType.gaseous, 
  OrbitalBodyType.ring, OrbitalBodyType.stellar, 
  OrbitalBodyType.terresterial, OrbitalBodyType.other];

  constructor(private router: Router) { }

  ngOnInit(): void {
    var element = document.getElementById("mapFrame");
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    if (element != null) {
      element.appendChild(this.renderer.domElement);
    }
    this.controls.zoomSpeed = 3;
    this.controls.autoRotateSpeed = .25;
    this.controls.minZoom = 50;
    
    this.camera.position.setZ(200);
    this.camera.position.setY(200);

    this.scene.add(this.ambientLight);
    this.scene.add(this.gridHelper);
    //this.addBody();
    this.animate();
    console.log(this.crystalSphere);
  }

  addOrbit(){
    var orbit = new Orbit();
    orbit.orbitNumber = this.crystalSphere.orbits.length;
    orbit.radiusOffset = ((this.crystalSphere.orbits.length + 1) * 30) + 30;
    orbit.radiusOffsetMin = 30 + ((this.crystalSphere.orbits.length + 1) * 30);
    orbit.radiusOffsetMax = orbit.radiusOffsetMin + 400;
    //TODO commented out for better view
    orbit.anglePercentage = this.crystalSphere.orbits.length * 4;
    this.crystalSphere.orbits.push(orbit);
    console.log(this.crystalSphere);
  }

  addBody(i: number){
    var geometry = new THREE.SphereGeometry(2, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0x00FF00});
    var mesh = new THREE.Mesh(geometry, material);
    var body = new OrbitalBody();
    body.name = this.crystalSphere.name + "-" + (i + 1) + "-" + (this.crystalSphere.orbits[i].orbitalBodies.length + 1);
    body.mesh = mesh;
    body.meshRadius = 2;
    //this.scene.add(mesh);
    this.crystalSphere.orbits[i].orbitalBodies.push(body);
    this.updateMap();
  }

  addStar(){
    var star = new OrbitalBody();
    star.meshRadius = defaultStarSize;
    star.color = "#fec200";
    var geometry = new THREE.SphereGeometry(star.meshRadius, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xfec200});
    var mesh = new THREE.Mesh(geometry, material);
    star.name = this.crystalSphere.name + " - " + this.crystalSphere.stars.length + 1;
    
    star.mesh = mesh;
    this.crystalSphere.stars.push(star);
    this.updateMap();
  }

  updateMap(){
    var i = 0;
    var j = 0;
    var k = 0;
    var offset = 0;
    var bodiesInOrbit;
    console.log("updating");
    this.crystalSphere.stars.forEach(star => {
      //star.mesh.position.x = i * 20;
      if (this.crystalSphere.stars.length > 1){
        var theta = Math.PI * 2;
        var r = 20 + star.spacialRadius;
        star.mesh.position.x = (r * Math.cos(theta * ((1+i)/this.crystalSphere.stars.length)));
        star.mesh.position.y = 0;
        star.mesh.position.z = (r * Math.sin(theta * ((1+i)/this.crystalSphere.stars.length)));
        if((50/this.crystalSphere.stars.length) < star.meshRadius){
          star.meshRadius = Math.floor(50/this.crystalSphere.stars.length);
        }
        star.mesh.geometry = new THREE.SphereGeometry(star.meshRadius);
        star.mesh.material = new MeshStandardMaterial({color: star.color});
      } else {
        star.mesh.position.x = 0;
        star.mesh.position.y = 0;
        star.mesh.position.z = 0;

        star.mesh.geometry = new THREE.SphereGeometry(star.meshRadius);
        star.mesh.material = new MeshStandardMaterial({color: star.color});
      }
      i++;
      this.scene.add(star.mesh);
    });
    this.crystalSphere.orbits.forEach(orbit => {
      orbit.orbitalBodies.forEach(body => {
        console.log(body.type);
        console.log(OrbitalBodyType.belt);
        if(!(body.type.toString() == 'belt')) {
          var theta = Math.PI * 2;
          var r = orbit.radiusOffset + body.spacialRadius;
          body.mesh.position.x = (r * Math.cos(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
          body.mesh.position.y = 0;
          body.mesh.position.z = (r * Math.sin(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
          body.mesh.geometry = new THREE.SphereGeometry(body.meshRadius, 24, 24);
          body.mesh.material = new THREE.MeshStandardMaterial({color: body.color});
          console.log(body.type);
          this.scene.add(body.mesh);
        } else {
          this.scene.remove(body.mesh);
          body.belt.forEach(mesh => {
            this.scene.remove(mesh);
          });
          for (var i = 0; i<1000; i++){

            var theta = MathUtils.randFloat(1, 100);
            var r = orbit.radiusOffset + body.spacialRadius;
            
            var x = ((r + MathUtils.randFloatSpread(8)) * Math.cos(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
            var y = MathUtils.randFloatSpread(8);
            var z = ((r + MathUtils.randFloatSpread(8))  * Math.sin(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
            var geometry = new THREE.SphereGeometry(MathUtils.randFloat(.1, .25), 24, 24);
            var material = new THREE.MeshStandardMaterial({color: body.color});
            var belt = new THREE.Mesh(geometry, material);
            belt.position.x = x;
            belt.position.y = y;
            belt.position.z = z;
            console.log(theta);
            body.belt.push(belt);
            this.scene.add(belt);
          }
        }

        k++;
      });
      j++;
      k=0;
    });
  }

  updateMapObject(i: number, j: number, k: number){
    var orbit = this.crystalSphere.orbits[j];
    if(k == -1){
      console.log("new Method!");
      orbit.orbitalBodies.forEach(body => {
        if(!(body.type.toString() == 'belt')) {
          var theta = Math.PI * 2;
          var r = orbit.radiusOffset + body.spacialRadius;
          body.mesh.position.x = (r * Math.cos(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
          body.mesh.position.y = 0;
          body.mesh.position.z = (r * Math.sin(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
          body.mesh.geometry = new THREE.SphereGeometry(body.meshRadius, 24, 24);
          body.mesh.material = new THREE.MeshStandardMaterial({color: body.color});
          this.scene.add(body.mesh);
        } else {
          this.scene.remove(body.mesh);
          body.belt.forEach(mesh => {
            this.scene.remove(mesh);
          });
          for (var i = 0; i<1000; i++){

            var theta = MathUtils.randFloat(1, 100);
            var r = orbit.radiusOffset + body.spacialRadius;
            
            var x = ((r + MathUtils.randFloatSpread(8)) * Math.cos(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
            var y = MathUtils.randFloatSpread(8);
            var z = ((r + MathUtils.randFloatSpread(8))  * Math.sin(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
            var geometry = new THREE.SphereGeometry(MathUtils.randFloat(.1, .25), 24, 24);
            var material = new THREE.MeshStandardMaterial({color: body.color});
            var belt = new THREE.Mesh(geometry, material);
            belt.position.x = x;
            belt.position.y = y;
            belt.position.z = z;
            body.belt.push(belt);
            this.scene.add(belt);
          }
        }
        k++;
      });
      j++;
    } else {
      var body = this.crystalSphere.orbits[j].orbitalBodies[k];
      if((body.type.toString() == 'belt')) {
        this.scene.remove(body.mesh);
        body.belt.forEach(mesh => {
          this.scene.remove(mesh);
        });
        for (var i = 0; i<1000; i++){

          var theta = MathUtils.randFloat(1, 100);
          var r = orbit.radiusOffset + body.spacialRadius;
          
          var x = ((r + MathUtils.randFloatSpread(8)) * Math.cos(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
          var y = MathUtils.randFloatSpread(8);
          var z = ((r + MathUtils.randFloatSpread(8))  * Math.sin(Math.PI * 2 * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (theta/100))));
          var geometry = new THREE.SphereGeometry(MathUtils.randFloat(.1, .25), 24, 24);
          var material = new THREE.MeshStandardMaterial({color: body.color});
          var belt = new THREE.Mesh(geometry, material);
          belt.position.x = x;
          belt.position.y = y;
          belt.position.z = z;
          body.belt.push(belt);
          this.scene.add(belt);
        }
      } else {
        var theta = Math.PI * 2;
        var r = orbit.radiusOffset + body.spacialRadius;
        body.mesh.position.x = (r * Math.cos(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
        body.mesh.position.y = 0;
        body.mesh.position.z = (r * Math.sin(theta * ((1+k)/orbit.orbitalBodies.length)+((Math.PI * 2)* (orbit.anglePercentage/100))));
        body.mesh.geometry = new THREE.SphereGeometry(body.meshRadius, 24, 24);
        body.mesh.material = new THREE.MeshStandardMaterial({color: body.color});
        console.log(body.type);
        this.scene.add(body.mesh);
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    //animate shaders
    this.uniforms[ 'time' ].value += 0.2 * .25;
    this.renderer.clear();

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
      //this.selectCrystal(object3d, object3d.children[0]);
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
      style	= getComputedStyle(tmpElement, null);
  
      elPosition.x	+= parseInt(style.getPropertyValue("border-left-width"), 10);
      elPosition.y	+= parseInt(style.getPropertyValue("border-top-width"), 10);
    } while(tmpElement = tmpElement.offsetParent);
    
    var elDimension	= {
      width	: (element === window) ? window.innerWidth	: element.offsetWidth,
      height	: (element === window) ? window.innerHeight	: element.offsetHeight
    };
    console.log('x :' + (+((event.pageX - elPosition.x) / elDimension.width ) * 2 - 1));
    console.log('y :' + (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1));
    return [(+((event.pageX - elPosition.x) / elDimension.width ) * 2 - 1), (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1)];
  }

  resize(any:any) {
    this.camera.aspect = (window.innerWidth/2) / (window.innerHeight/2);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );

    this.renderer.render(this.scene, this.camera);
  }

  toggleOrbitCollapse(j: number) {
    this.crystalSphere.orbits[j].collapse = !this.crystalSphere.orbits[j].collapse;
    console.log(this.crystalSphere.orbits[j].collapse);
  }

  toggleBodyCollapse(j:number, k:number) {
    this.crystalSphere.orbits[j].orbitalBodies[k].collapse = !this.crystalSphere.orbits[j].orbitalBodies[k].collapse;
  }

  toggleWellCollapse() {
    this.gravityWellCollapse = !this.gravityWellCollapse;
  }

  toggleWellBodyCollapse(i:number) {
    this.crystalSphere.stars[i].collapse = !this.crystalSphere.stars[i].collapse;
  }
}

