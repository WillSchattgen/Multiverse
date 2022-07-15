import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router } from '@angular/router';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { BackSide, DoubleSide, Loader, MathUtils, MeshStandardMaterial, Vector3} from 'three';
import { CrystalSphere } from '../crystal-sphere';
import { Orbit } from '../orbit';
import { OrbitalBody } from '../orbital-body';
import { MappingService } from '../mapping.service';

@Component({
  selector: 'app-campaign-map',
  templateUrl: './campaign-map.component.html',
  styleUrls: ['./campaign-map.component.css'],
  providers: [MappingService]
})
export class CampaignMapComponent implements OnInit {

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
		"uvScale": { value: new THREE.Vector2( 3.0, 1.0 ) },
		"texture1": { value: this.textureLoader.load( '../../assets/cloud.png' ) }//,
		//"texture2": { value: this.textureLoader.load( '../../assets/purple_smoke.jpg' ) }
	};

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.1, 1000);

  //renderer = new THREE.WebGLRenderer({alpha: true});
  renderer = new THREE.WebGLRenderer();
  //pointLight = new THREE.PointLight(0xffffff);
  //lightHelper = new THREE.PointLightHelper(this.pointLight)
 
  ambientLight = new THREE.AmbientLight(0xffffff);

  gridHelper = new THREE.GridHelper(200, 50);

  controls = new OrbitControls(this.camera, this.renderer.domElement);
  //controls = new TrackballControls(this.camera, this.renderer.domElement);

  stars: any[] = [];

  selectedSphere = this.addTower();

  moveCamera: boolean = false;

  moveTarget: boolean = false;

  moveCameraDirection = new THREE.Vector3();

  moveCameraFinal = new THREE.Vector3();

  xDone: boolean = false;

  yDone: boolean = false;

  zDone: boolean = false;

  xTargetDone: boolean = false;

  yTargetDone: boolean = false;

  zTargetDone: boolean = false;

  targetFinal = new THREE.Vector3();

  targetMoveDirection = new THREE.Vector3();

  activeCrystalSphere = new CrystalSphere();

  orbitalBodies = new Map();

  constructor(private router: Router, private mappingService: MappingService) { }

  ngOnInit(): void {
    //console.log(THREEx);
    //this.pointLight.position.set(10, 10, 10);
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    var element = document.getElementById("mapFrame");
    if (element != null) {
      element.appendChild(this.renderer.domElement);
    }
    // this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 3;
    // this.controls.panSpeed = 0.8;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = .25;
    this.controls.minZoom = 50;
    
	  this.uniforms[ "texture1" ].value.wrapS = this.uniforms[ "texture1" ].value.wrapT = THREE.RepeatWrapping;
	  //this.uniforms[ "texture2" ].value.wrapS = this.uniforms[ "texture2" ].value.wrapT = THREE.RepeatWrapping;
  
    //this.controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
    //document.body.addEventListener('wheel', this.scroll, false);
    //document.body.appendChild(this.renderer.domElement);
    this.camera.position.setZ(30);
    //this.scene.add(this.pointLight);
    //this.scene.add(this.lightHelper);
    this.scene.add(this.ambientLight);
    //this.scene.add(this.gridHelper);

    //commented out for api update this is good code
    // for(var i = 0;i<2000;i++){
    //   this.addSphere();
    // }

    // var sphereList: string | any[] = [];
    // this.mappingService.getAllSpheres().subscribe(
    //   value => {
    //     console.log(value);
    //     sphereList = value.sphereList;
    //     console.log(sphereList);
    //     console.log(sphereList.length);
    //     for(var i = 0;i<sphereList.length;i++){
    //       this.addSpheresFromApi(sphereList[i]);
    //     }
    //     //this.scene.background = new THREE.Color(0xFF00FF);
    //     //this.addSkyBox();
    //     this.createCurrents();
    //     this.updateActiveCrystalSphere();
    //     this.animate();
    //   },
    //   err => {
    //     console.log(err);
    //     console.log('oops');
    //   }
    // );

    //spheres and bodies
    var sphereAndBodyList: string | any[] = [];
    this.mappingService.getAllSpheresAndBodies().subscribe(
      value => {
        console.log(value);
        sphereAndBodyList = value.sphereList;
        console.log(sphereAndBodyList);
        console.log(sphereAndBodyList.length);
        for(var i = 0;i<sphereAndBodyList.length;i++){
          this.addSpheresAndBodiesFromApi(sphereAndBodyList[i].crystalSphere, sphereAndBodyList[i].orbitalBodies);
          console.log(i);
        }
    
        //this.scene.background = new THREE.Color(0xFF00FF);
        //this.addSkyBox();
        this.createCurrents();
        this.updateActiveCrystalSphere();
        this.animate();
      },
      err => {
        console.log(err);
        console.log('oops');
      }
    );

  }

  updateActiveCrystalSphere(){
    this.activeCrystalSphere.orbits = [];
    this.activeCrystalSphere.stars = [];

    this.activeCrystalSphere.name = this.selectedSphere.name;
    this.activeCrystalSphere.faction = this.selectedSphere.name;
    this.selectedSphere.children.forEach(element => {
      console.log(element.name);
      if(element.name.match('^.*G.*\%.*')){
        var orbitalBody = new OrbitalBody();
        orbitalBody.name = element.name;
        this.activeCrystalSphere.stars.push(orbitalBody);
      } else if(element.name.match('^.*B.*\%.*')){
        var orbit = new Orbit();
        var orbitalBody = new OrbitalBody();
        orbitalBody.name = element.name;
        orbit.orbitalBodies.push(orbitalBody);
        this.activeCrystalSphere.orbits.push(orbit);
      }
    });

  }

  addSkyBox() {
    var skyGeometry = new THREE.SphereGeometry(500, 24, 24);
    const skyMaterial = new THREE.ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    } );
    skyMaterial.side = DoubleSide;
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(skyBox);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if(this.moveTarget){
      if(Math.abs(this.targetFinal.x - this.controls.target.x) < 1){
        this.xTargetDone;
      } else {
        this.controls.target.x = this.controls.target.x + (this.targetMoveDirection.x * 2);
      }
      if(Math.abs(this.targetFinal.y - this.controls.target.y) < 1){
        this.yTargetDone = true;
      } else {
        this.controls.target.y = this.controls.target.y + (this.targetMoveDirection.y * 2);
      }
      if(Math.abs(this.targetFinal.z - this.controls.target.z) < 1){
        this.zTargetDone = true;
      } else {
        this.controls.target.z = this.controls.target.z + (this.targetMoveDirection.z * 2);
      }

      if(this.xDone && this.yDone && this.zDone){
        this.moveTarget = false;
        this.controls.target = this.targetFinal;
      }
    }

    if(this.moveCamera){
      if(Math.abs(this.camera.position.x - this.moveCameraFinal.x) < 2){
        this.xDone = true;
      } else {
        this.camera.position.x = this.camera.position.x + this.moveCameraDirection.x;
      }
      if(Math.abs(this.camera.position.y - this.moveCameraFinal.y) < 2){
        this.yDone = true;
      } else {
        this.camera.position.y = this.camera.position.y + this.moveCameraDirection.y;
      }
      if(Math.abs(this.camera.position.y - this.moveCameraFinal.y) < 2){
        this.zDone = true;
      } else {
        this.camera.position.z = this.camera.position.z + this.moveCameraDirection.z;
      }

      if(this.xDone && this.yDone && this.zDone){
        this.moveCamera = false;
        this.controls.autoRotate = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        // this.camera.position.x = this.moveCameraFinal.x + 2;
        // this.camera.position.y = this.moveCameraFinal.y + 2;
        // this.camera.position.z = this.moveCameraFinal.z + 2;
      }
    }

    //animate shaders
    this.uniforms[ 'time' ].value += 0.2 * .25;
    this.renderer.clear();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  addSphere() {
    var geometry = new THREE.SphereGeometry(.5, 24, 24);
    var colors: any[] = [0xffffff, 0xff00ff, 0x00ff00];
    
    //var material = new THREE.MeshStandardMaterial({color: colors[MathUtils.randInt(0,2)]});
    var material = new THREE.MeshStandardMaterial({color: 0xffffff});
   
    var sphere = new THREE.Mesh(geometry, material);
    // var x = THREE.MathUtils.randFloatSpread(500);
    // var y = THREE.MathUtils.randFloatSpread(500);
    // var z = THREE.MathUtils.randFloatSpread(500);
    var theta = THREE.MathUtils.randFloat(0, (Math.PI * 2));
    var v = THREE.MathUtils.randFloat(0, 1);
    var phi = Math.acos((2*v)-1);
    var r = Math.pow(THREE.MathUtils.randFloat(0,100000000), 1/3);
    var x = r * Math.sin(phi) * Math.cos(theta);
    var y = r * Math.sin(phi) * Math.sin(theta);
    var z = r * Math.cos(phi);

    // if(this.lastStar != null){
    //   this.addCurrent([x,y,z], this.lastStar);
    // }
    // this.lastStar = [x,y,z];
    //this.createCurrents();
    sphere.position.set(x,y,z);
    sphere.name = 'S\%number';
    this.scene.add(sphere);
    this.stars.push(sphere);
  }

  addSpheresFromApi(savedSphere: CrystalSphere){
    console.log("Adding saved sphere");
    var geometry = new THREE.SphereGeometry(.5, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xffffff});
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(savedSphere.xpos,savedSphere.ypos,savedSphere.zpos);
    if(savedSphere.name != ''){
      sphere.name = 'S\%'+ savedSphere.name;
    }
    else {
      sphere.name = 'S\%'+ savedSphere.crystal_sphere_id;
    }
    this.scene.add(sphere);
    this.stars.push(sphere);
  }

  addSpheresAndBodiesFromApi(savedSphere: CrystalSphere, savedBodies: OrbitalBody[]){
    console.log("Adding saved sphere");
    var geometry = new THREE.SphereGeometry(.5, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xffffff});
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(savedSphere.xpos,savedSphere.ypos,savedSphere.zpos);
    if(savedSphere.name != ''){
      sphere.name = 'S\%'+ savedSphere.name;
    }
    else {
      sphere.name = 'S\%'+ savedSphere.crystal_sphere_id;
    }

    var center = sphere.position;
    //add bodies to mesh
    this.orbitalBodies.set(savedSphere.crystal_sphere_id, []);

    if(savedBodies != null && savedBodies.length > 0){
      console.log(savedBodies[0].orbital_offset);
      console.log('SavedBodies length: ' + savedBodies.length);
      for(var i = 0; i < savedBodies.length; i++){
        
        var theta = 0;
        var r = 0;
        var x = 0;
        var y = 0;
        var z = 0;

        if(savedBodies[i].type == 3) {
          theta = savedBodies[i].orbital_offset;
          r = savedBodies[i].spacialRadius;
          x = (r * Math.cos(theta)) + center.x;
          y = center.y;
          z = (r * Math.sin(theta)) + center.z;
        } else {
          theta = Math.PI * 2 * MathUtils.randFloat(0,1);
          console.log(savedBodies[i]);
          r = savedBodies[i].spacialRadius;
          x = (r * Math.cos(theta)) + center.x;
          y = center.y;
          z = (r * Math.sin(theta)) + center.z;
        }

        var sphereGeometry = new THREE.SphereGeometry(savedBodies[i].meshRadius, 24, 24);
        var material = new THREE.MeshStandardMaterial({color: 0xFFFF00});
        var body = new THREE.Mesh(sphereGeometry, material);
        console.log('Position X: ' + x);
        body.position.x = x;
        body.position.y = y;
        body.position.z = z;
        body.name = 'B\%' + i;
        //sphere.children.push(body);
        this.scene.add(body);
        console.log(body);
        var tempList = this.orbitalBodies.get(savedSphere.crystal_sphere_id);
        tempList.push(body);

        console.log('Added body at center: ' + center.x + ',' + center.y + ',' + center.z);
        this.orbitalBodies.set(savedSphere.crystal_sphere_id, tempList);
      }
    }
    this.scene.add(sphere);
    this.stars.push(sphere);
  }

  addCurrent(a:number[], b:number[], destination:THREE.Mesh) {

    var coneGeometry = new THREE.ConeBufferGeometry(.1, .3, 5);
    coneGeometry.rotateX( 3 * Math.PI / 2);//Rotates the "Up" by 270degrees
    var coneMaterial = new THREE.MeshBasicMaterial( {color: 0x2a9754} );
    var cone = new THREE.Mesh( coneGeometry, coneMaterial);

    var lineLength = Math.sqrt(Math.pow(b[0]-a[0],2) 
       + Math.sqrt(Math.pow(b[1]-a[1],2) 
       + Math.sqrt(Math.pow(b[2]-a[2],2))));    

    var deltaX = b[0] - a[0];
    var deltaY = b[1] - a[1];
    var deltaZ = b[2] - a[2];

    var center = new THREE.Vector3(a[0], a[1], a[2]);
    var point = new THREE.Vector3(b[0], b[1], b[2]);

    //var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var theta = Math.atan((deltaZ)/(deltaX));
    //var phi = Math.acos(deltaY/(lineLength));
    var phi = Math.atan((Math.sqrt((deltaX*deltaX)+(deltaZ*deltaZ))/deltaY));
    console.log(phi);
    console.log(deltaY/(lineLength));
    console.log(deltaY);
    console.log(lineLength);
    var r = 1;
    var xCorrection = 1;
    var yCorrection = 1;
    var zCorrection = 1;
    if(deltaX < 0){
      xCorrection = -xCorrection;
    }
    if(deltaY < 0){
      yCorrection = -yCorrection;
    }
    if(deltaZ < 0){
      zCorrection = -zCorrection;
    }

    var xOffset = (r * Math.sin(phi) * Math.cos(theta) * xCorrection * yCorrection);
    var yOffset = (r * Math.cos(phi) * yCorrection)
    var zOffset = (r * Math.sin(phi) * Math.sin(theta) * xCorrection * yCorrection)

    var x = center.x + xOffset;
    var y = center.y + yOffset;
    var z = center.z + zOffset;

    var rotationMatrix = new THREE.Matrix4();
    var target = new THREE.Quaternion();

    cone.position.x = x;
    cone.position.y = y;
    cone.position.z = z;
    cone.rotation.x = Math.PI;
    cone.name = 'travel';
    rotationMatrix.lookAt(center, point, cone.position);
    cone.rotation.setFromRotationMatrix(rotationMatrix);
    // cone.rotation.x = theta;
    // cone.rotation.y = phi;

    cone.children.push(destination);
    this.scene.add(cone);

    // points.push( new THREE.Vector3( a[0], a[1], a[2] ) );
    // points.push( new THREE.Vector3( b[0], b[1], b[2] ) );
    // ///points.push( new THREE.Vector3( 10, 10, 10 ) );

    // var curve = new CustomCurve(10);
    // var currentGeometry = new THREE.TubeGeometry(curve, 20, 2, 8, false);
    // var currentMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    // currentMaterial.side = THREE.DoubleSide;
    // const currentMesh = new THREE.Mesh( currentGeometry, currentMaterial );
    // currentMesh.position.x = center.x + (deltaX/2);
    // currentMesh.position.y = center.y + (deltaY/2);
    // currentMesh.position.z = center.z + (deltaZ/2);

    // this.scene.add(currentMesh);

    /*
    var height = Math.sqrt(Math.pow(destination.position.x-this.selectedSphere.position.x,2) 
    + Math.sqrt(Math.pow(destination.position.y-this.selectedSphere.position.y,2) 
    + Math.sqrt(Math.pow(destination.position.z-this.selectedSphere.position.z,2))));

    var cylinderGeometry = new THREE.CylinderGeometry(.2, .2, height, 32, 1, true);
    cylinderGeometry.rotateX(Math.PI / 2);//Rotates the "Up" by 90degrees
    var cylinderMaterial = new THREE.MeshBasicMaterial( { color: 0x005500 } );
    cylinderMaterial.side = THREE.DoubleSide;
    var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial);
    cylinder.position.x = center.x + (deltaX/2);
    cylinder.position.y = center.y + (deltaY/2);
    cylinder.position.z = center.z + (deltaZ/2);
    rotationMatrix.lookAt(center, point, cylinder.position);
    cylinder.rotation.setFromRotationMatrix(rotationMatrix);

    console.log(lineLength);
    console.log(cylinder.geometry);

    this.scene.add(cylinder);
    */

/*    const pts1 = [];

    pts1.push(new THREE.Vector3(a[0] + xOffset * 3, a[1] + yOffset * 3, a[2] + zOffset * 3));
    pts1.push(new THREE.Vector3(b[0] - xOffset * 3, b[1] - yOffset * 3, b[2] - zOffset * 3));

    var spline = new THREE.CatmullRomCurve3(pts1);

    const extrudeSettings = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: spline
    };

    const pts = [];

    pts.push(new THREE.Vector2(1,1));
    pts.push(new THREE.Vector2(0,1));


    const arcShape = new THREE.Shape()
      .moveTo( 10, 10 )
      .absarc( 0, 0, .25, 0, Math.PI * 2, false );

    const holePath = new THREE.Path()
      .moveTo( 10, 10 )
      .absarc( 0, 0, .25, 0, Math.PI * 2, true );

    arcShape.holes.push( holePath );

		const size = 0.65;
    const currentGeometry = new THREE.ExtrudeGeometry(arcShape, {steps: 10, bevelEnabled: false, extrudePath: spline});

    const currentMaterial = new THREE.ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    } );

    var currentMesh = new THREE.Mesh(currentGeometry, currentMaterial);
    this.scene.add(currentMesh);*/

    const pts1 = [];

    var start = new THREE.Vector3(a[0] + xOffset * 2, a[1] + yOffset * 2, a[2] + zOffset * 2);
    var end = new THREE.Vector3(b[0] - xOffset * 2, b[1] - yOffset * 2, b[2] - zOffset * 2);
    pts1.push(start);
    pts1.push(end);

    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    var lineGeometry = new THREE.BufferGeometry().setFromPoints(pts1);
    var line = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(line);
  }

  createCurrents() {
    console.log('stars length:' + this.stars.length);
    for(var i = 0; i < this.stars.length; i++){
      if(Math.abs(this.selectedSphere.position.x - this.stars[i].position.x) < 50
      && Math.abs(this.selectedSphere.position.y - this.stars[i].position.y) < 50
      && Math.abs(this.selectedSphere.position.z - this.stars[i].position.z) < 50
      && this.selectedSphere != this.stars[i]){
        this.addCurrent([this.selectedSphere.position.x, this.selectedSphere.position.y, this.selectedSphere.position.z],
          [this.stars[i].position.x, this.stars[i].position.y, this.stars[i].position.z], this.stars[i]);
      }
    }
  }

  inRadius(a: number[], b: number[], radius: number): boolean {
    if(Math.abs(a[0] - b[0]) > 40){
      return false;
    } else if(Math.abs(a[1] - b[1]) > 40){
      return false;
    } else if(Math.abs(a[2] - b[2]) > 40){
      return false;
    }
    return true;
  }

  addTower(): THREE.Mesh{
    var geometry = new THREE.SphereGeometry(.5, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0x333333});
    var realmSphere = new THREE.Mesh(geometry,material);
    realmSphere.position.set(0, 0, 0);
    realmSphere.name = "S\%Realm Space";
    this.selectedSphere = realmSphere;

    var center = realmSphere.position;
    //var stars = MathUtils.randInt(1, 3);
    //var orbits = MathUtils.randInt(1, 9);
    
    this.scene.add(realmSphere);
    //this.selectSphere(realmSphere);
    realmSphere.material = new THREE.MeshStandardMaterial({color: 0x000000});
    realmSphere.material.side = BackSide;
    realmSphere.name = "A" + realmSphere.name;

    this.stars.push(realmSphere);

    var center = realmSphere.position;

    var starx = center.x;
    var stary = center.y;
    var starz = center.z;

    var geometry = new THREE.SphereGeometry(.05, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xFCF030});
    var star = new THREE.Mesh(geometry, material);
    //var star = new THREE.PointLight(colors[MathUtils.randInt(0, colors.length)]);
    star.position.x = starx;
    star.position.y = stary;
    star.position.z = starz;
    star.name = 'G\%' + 0;
    this.scene.add(star);
    this.selectedSphere.children.push(star);

    //planet1
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .08
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xC0FFEE});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 0;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet2
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .1
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0x8fce00});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 1;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet3
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .15
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xFFB90F});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 2;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet4
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .18
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xC80815});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 3;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet5
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .2
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0x177245});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 4;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet6
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .3
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0x00b2ee});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 5;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet7
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .32
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xFFB90F});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 6;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    //planet7
    var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
    var r = .4
    var x = (r * Math.cos(theta)) + center.x;
    var y = center.y;
    var z = (r * Math.sin(theta)) + center.z;

    var geometry = new THREE.SphereGeometry(.005, 24, 24);
    var material = new THREE.MeshStandardMaterial({color: 0xC80815});
    var body = new THREE.Mesh(geometry, material);
    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
    body.name = 'B\%' + 7;
    this.scene.add(body);
    this.selectedSphere.children.push(body);

    return realmSphere;
  }

  // onClickCanvas(event:any) {
  //   //console.log(event);
  //   let intersects;
  //   var x = (event.clientX / window.innerWidth) * 2 - 1;
  //   var y = - (event.clientY / window.innerHeight) * 2 + 1;

  //   console.log("X: " + x + "Y: " + y);
  //   //console.log(this.scene.children);
  //   console.log(this.camera.position);

  //   //raycaster.setFromCamera(mouse, camera);
  //   var raycast = new THREE.Raycaster(this.camera.position);

  //   intersects = raycast.intersectObjects(this.scene.children);
  //   if (intersects.length !== 0) console.log(intersects[0]['object'])
  // }

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
      if(element.object.name.match('^.*S.*\%.*')){
        meshes.push(element.object);
      } else if (element.object.name.match('travel')) {
        meshes.push(element.object);
      }
    });

    if( meshes.length === 0 )	return;
    var object3d = meshes[0];

    console.log(object3d);
    console.log(intersects);

    if(object3d.name == 'travel'){
      if(object3d.children[0] != null){
        this.controls.enableRotate = false;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.xDone = false;
        this.yDone = false;
        this.zDone = false;

        //this.camera.position.set(object3d.children[0].position.x + 2, object3d.children[0].position.y + 2, object3d.children[0].position.z + 2);
        this.controls.autoRotate = false;
        this.moveCameraFinal = new Vector3(object3d.children[0].position.x, object3d.children[0].position.y, object3d.children[0].position.z);
        this.moveCameraDirection = new Vector3((object3d.children[0].position.x - this.camera.position.x)/100, (object3d.children[0].position.y - this.camera.position.y)/100, (object3d.children[0].position.z - this.camera.position.z)/100);
        //this.camera.lookAt(object3d.children[0].position.x, object3d.children[0].position.y, object3d.children[0].position.z);
        //this.controls.target.set(object3d.children[0].position.x, object3d.children[0].position.y, object3d.children[0].position.z);
        this.targetFinal = new Vector3(object3d.children[0].position.x, object3d.children[0].position.y, object3d.children[0].position.z);
        this.targetMoveDirection = new Vector3((object3d.children[0].position.x - this.controls.target.x)/100, (object3d.children[0].position.y - this.controls.target.y)/100, (object3d.children[0].position.z - this.controls.target.z)/100);
        this.moveCamera = true;
        this.moveTarget = true;
        this.selectSphere(object3d.children[0]);
        this.updateActiveCrystalSphere();
      }
    } else {
      if(this.controls.target.x == object3d.position.x
        && this.controls.target.y == object3d.position.y
        && this.controls.target.z == object3d.position.z){
          console.log("Already selected");
          return;
      }
      this.controls.enableRotate = false;
      this.controls.enablePan = false;
      this.controls.enableZoom = false;
      this.xDone = false;
      this.yDone = false;
      this.zDone = false;
      //this.camera.position.set(object3d.position.x + 2, object3d.position.y + 2, object3d.position.z + 2);
      this.moveCameraFinal = new Vector3(object3d.position.x, object3d.position.y, object3d.position.z);
      this.moveCameraDirection = new Vector3((object3d.position.x - this.camera.position.x)/200, (object3d.position.y - this.camera.position.y)/200, (object3d.position.z - this.camera.position.z)/200);
      //this.camera.lookAt(object3d.position.x, object3d.position.y, object3d.position.z);
      //this.controls.target.set(object3d.position.x, object3d.position.y, object3d.position.z);
      this.targetFinal = new THREE.Vector3(object3d.position.x, object3d.position.y, object3d.position.z);
      this.targetMoveDirection = new Vector3((object3d.position.x - this.controls.target.x)/200, (object3d.position.y - this.controls.target.y)/200, (object3d.position.z - this.controls.target.z)/200);
      this.moveCamera = true;
      this.moveTarget = true;
      this.selectSphere(object3d);
      this.updateActiveCrystalSphere();
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
    console.log('x :' + (+((event.pageX - elPosition.x) / elDimension.width) * 2 - 1));
    console.log("y :" + (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1));
    return [(+((event.pageX - elPosition.x) / elDimension.width ) * 2 - 1), (-((event.pageY - elPosition.y) / elDimension.height) * 2 + 1)];
  }

  selectSphere(sphere:THREE.Mesh){
    if(!sphere.name.match('^.*A.*\%.*')){
      this.selectedSphere = sphere;
      console.log(this.selectedSphere.type);
      this.createCurrents();
      //sphere.geometry = new THREE.SphereGeometry(.5, 24, 24, 0, Math.PI * 2, 0, Math.PI * .5);
      sphere.material = new THREE.MeshBasicMaterial({color: 0x090909});
      sphere.material.side = BackSide;
      sphere.name = "A" + sphere.name;
      
      if(this.orbitalBodies.get(Number.parseInt(sphere.name.split('%')[1])).length > 0){
        this.generateSavedSystem(sphere.name.split('%')[1]);
      } else {
        this.generateSystem(sphere, Number.parseInt(sphere.name.split('%')[1]));
      }
        
      // var fogGeometry = new THREE.SphereGeometry(2, 24, 24);
      // const fogMaterial = new THREE.ShaderMaterial( {
      //   uniforms: this.uniforms,
      //   vertexShader: this.vertexShader,
      //   fragmentShader: this.fragmentShader
      // } );
      
      // fogMaterial.side = BackSide;
      // var fog = new THREE.Mesh(fogGeometry, fogMaterial);
      // fog.position.set(sphere.position.x,sphere.position.y,sphere.position.z);
      // this.scene.add(fog);
    }
  }

  generateSystem(sphere:THREE.Mesh, sphereId: Number){
    var center = sphere.position;
    var stars = MathUtils.randInt(1, 3);
    var orbits = MathUtils.randInt(1, 9);
    this.generateStars(center, stars, sphereId);
    this.generateBodies(center, orbits, sphereId);

    //var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.001, .003), 24, 24);
    // var geometry = new THREE.CircleGeometry(.5, 32);
    // var colors = [0x00ff00];
    // var material = new THREE.MeshStandardMaterial({color: 0x000000});
    // var plate = new THREE.Mesh(geometry, material);
    // plate.rotation.x += THREE.MathUtils.degToRad(-90);
    // plate.position.x = center.x;
    // plate.position.y = center.y - .02;
    // plate.position.z = center.z;
    // this.scene.add(plate);
  }

  generateStars(center:THREE.Vector3, total:number, sphereId: Number){
    for(var i = 0; i < total; i++){
      var theta = 0;
      var r = 0;
      var x = 0;
      var y = 0;
      var z = 0;
      if (total > 1){
        theta = Math.PI * 2;
        r = .04;
        x = (r * Math.cos(theta * ((1+i)/total))) + center.x;
        y = center.y;
        z = (r * Math.sin(theta * ((1+i)/total))) + center.z;
      } else {
        x = center.x;
        y = center.y;
        z = center.z;
      }

      var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.01 * (3/total), .03 * (3/total)), 24, 24);
      var colors = [0x00ffff, 0x00007a, 0xe8e800, 940000, 0xffff00, 0xf4fffe];
      var material = new THREE.MeshStandardMaterial({color: colors[MathUtils.randInt(0, colors.length-1)]});
      var star = new THREE.Mesh(geometry, material);
      //var star = new THREE.PointLight(colors[MathUtils.randInt(0, colors.length)]);
      star.position.x = x;
      star.position.y = y;
      star.position.z = z;
      star.name = 'G\%' + i;
      var orbitalBody: OrbitalBody = new OrbitalBody();
      orbitalBody.name = star.name;
      orbitalBody.orbital_distance = r;
      orbitalBody.orbital_offset = theta;
      orbitalBody.type = 3;
      orbitalBody.color = star.material.color.getHexString();

      var tempList = this.orbitalBodies.get(sphereId);
      tempList.push(orbitalBody);
      this.orbitalBodies.set(sphereId, tempList);
      this.mappingService.saveOrbitalBody(orbitalBody, sphereId);
      this.scene.add(star);
      //this.selectedSphere.children.push(star);
    }
  }

  generateBodies(center:THREE.Vector3, total:number, sphereId: Number){
    for(var i = 0; i < 9; i++){
      var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
      var r = .1 + ((i/9)*.4);
      var x = (r * Math.cos(theta)) + center.x;
      var y = center.y;
      var z = (r * Math.sin(theta)) + center.z;

      var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.003, .006), 24, 24);
      var colors = [0x6a6a6a, 0xebebeb, 0x017501, 0x0599ed, 0x4d3222]
      var material = new THREE.MeshStandardMaterial({color: colors[MathUtils.randInt(0, colors.length - 1)]});
      var body = new THREE.Mesh(geometry, material);
      body.position.x = x;
      body.position.y = y;
      body.position.z = z;
      body.name = 'B\%' + i;

      var orbitalBody: OrbitalBody = new OrbitalBody();
      orbitalBody.name = body.name;
      orbitalBody.orbital_distance = r;
      orbitalBody.orbital_offset = theta;
      orbitalBody.type = 6;
      orbitalBody.color = body.material.color.getHexString();

      var tempList = this.orbitalBodies.get(sphereId);
      this.orbitalBodies.set(sphereId, tempList);
      this.mappingService.saveOrbitalBody(orbitalBody, sphereId);
      this.scene.add(body);
      //this.selectedSphere.children.push(body);
    }
  }

  generateSavedSystem(id: string){
    console.log('adding bodies to scene for id: ' + id);
    var bodies = this.orbitalBodies.get(Number.parseInt(id));
    console.log(bodies);
    console.log(bodies.length);
    for(var i = 0; i<bodies.length; i++){
      console.log('testing!');
      this.scene.add(bodies[i]);
    }
  }

  loadShader(shader:any): string | undefined{
    if(shader.textContent != null){
      return shader.textContent;
    } else {
      return undefined;
    }
  }

  resize(test:any) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.renderer.render(this.scene, this.camera);
  }

}
