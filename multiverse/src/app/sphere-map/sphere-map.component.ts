import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router } from '@angular/router';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import { MathUtils, MOUSE, WireframeGeometry } from 'three';

@Component({
  selector: 'app-sphere-map',
  templateUrl: './sphere-map.component.html',
  styleUrls: ['./sphere-map.component.css']
})
export class SphereMapComponent implements OnInit {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();

  //geometry = new THREE.TorusGeometry(10,3,16,100);
  //material = new THREE.MeshStandardMaterial( {color: 0xFF6347} );
  //torus = new THREE.Mesh(this.geometry, this.material);
  //pointLight = new THREE.PointLight(0xffffff);
  //lightHelper = new THREE.PointLightHelper(this.pointLight)
 
  ambientLight = new THREE.AmbientLight(0xffffff);

  gridHelper = new THREE.GridHelper(200, 50);

  controls = new OrbitControls(this.camera, this.renderer.domElement);
  //controls = new TrackballControls(this.camera, this.renderer.domElement);

  stars: any[] = [];

  selectedSphere = this.addTower();

  constructor(private router: Router) { }

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
  
    //this.controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
    //document.body.addEventListener('wheel', this.scroll, false);
    //document.body.appendChild(this.renderer.domElement);
    this.camera.position.setZ(30);
    //this.scene.add(this.pointLight);
    //this.scene.add(this.lightHelper);
    this.scene.add(this.ambientLight);
    //this.scene.add(this.torus);
    //this.scene.add(this.gridHelper);
    for(var i = 0;i<2000;i++){
      this.addSphere();
    }
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // this.torus.rotation.x += 0.01;
    // this.torus.rotation.y += 0.01;
    // this.torus.rotation.z += 0.01;
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
    sphere.name = 'S-number';
    this.scene.add(sphere);
    this.stars.push(sphere);
  }

  addCurrent(a:number[], b:number[]) {
    var points = [];
    points.push( new THREE.Vector3( a[0], a[1], a[2] ) );
    points.push( new THREE.Vector3( b[0], b[1], b[2] ) );
    ///points.push( new THREE.Vector3( 10, 10, 10 ) );

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const line = new THREE.Line( geometry, material );
    this.scene.add(line);
  }

  createCurrents() {
    for(var i = 0; i < this.stars.length; i++){
      if(Math.abs(this.selectedSphere.position.x - this.stars[i].position.x) < 50
      && Math.abs(this.selectedSphere.position.y - this.stars[i].position.y) < 50
      && Math.abs(this.selectedSphere.position.z - this.stars[i].position.z) < 50){
        this.addCurrent([this.selectedSphere.position.x, this.selectedSphere.position.y, this.selectedSphere.position.z],
          [this.stars[i].position.x, this.stars[i].position.y, this.stars[i].position.z]);
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
    var geometry = new THREE.CylinderGeometry(1.25, 1.25, 4, 24, 24, false, 10, 10);
    var material = new THREE.MeshStandardMaterial({color: 0x333333});
    var tower = new THREE.Mesh(geometry,material);
    tower.position.set(0, 0, 0);
    // this.domEvents.addEventListener(tower, 'click', (event: any) =>{
    //   console.log("test Click");
    // });
    tower.name = "tower";
    this.scene.add(tower);
    return tower;
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

    var intersects = raycaster.intersectObjects( this.scene.children);
    // if there are no intersections, return now
    if( intersects.length === 0 )	return;
    // init some variables
    // var intersect	= intersects[0];
    // var object3d	= intersect.object;
    // var objectParent = object3d.parent;
    var meshes: any[] = [];

    intersects.forEach(element => {
      if(element.object.name.match('^S.*')){
        meshes.push(element.object);
      }
    });

    if( meshes.length === 0 )	return;
    var object3d = meshes[0];

    console.log(object3d);
    console.log(intersects);

    if(this.controls.target.x == object3d.position.x
      && this.controls.target.y == object3d.position.y
      && this.controls.target.z == object3d.position.z){
        console.log("Already selected");
        return;
    }

    this.camera.position.set(object3d.position.x + .5, object3d.position.y + .5, object3d.position.z + .5);
    this.camera.lookAt(object3d.position.x, object3d.position.y, object3d.position.z);
    this.controls.target.set(object3d.position.x, object3d.position.y, object3d.position.z);
    this.selectSphere(object3d);
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

  selectSphere(sphere:THREE.Mesh){
    this.selectedSphere = sphere;
    console.log(this.selectedSphere.type);
    this.createCurrents();
    //sphere.geometry = new THREE.SphereGeometry(.5, 24, 24, 0, Math.PI * 2, 0, Math.PI * .5);
    sphere.material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
    this.generateSystem(sphere);
  }

  generateSystem(sphere:THREE.Mesh){
    var center = sphere.position;
    var stars = MathUtils.randInt(1, 3);
    var orbits = MathUtils.randInt(1, 9);
    this.generateStars(center, stars);
    this.generateBodies(center, orbits);

    //var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.001, .003), 24, 24);
    var geometry = new THREE.CircleGeometry(.5, 32);
    var colors = [0x00ff00];
    var material = new THREE.MeshStandardMaterial({color: 0x000000});
    var plate = new THREE.Mesh(geometry, material);
    plate.rotation.x += THREE.MathUtils.degToRad(-90);
    plate.position.x = center.x;
    plate.position.y = center.y - .02;
    plate.position.z = center.z;
    this.scene.add(plate);
  }

  generateStars(center:THREE.Vector3, total:number){
    for(var i = 0; i < total; i++){

      if (total > 1){
        var theta = Math.PI * 2;
        var r = .04;
        var x = (r * Math.cos(theta * ((1+i)/total))) + center.x;
        var y = center.y;
        var z = (r * Math.sin(theta * ((1+i)/total))) + center.z;
      } else {
        var x = center.x;
        var y = center.y;
        var z = center.z;
      }

      var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.01, .03), 24, 24);
      var colors = [0x00ffff, 0x00007a, 0xe8e800, 940000, 0xffff00, 0xf4fffe];
      var material = new THREE.MeshStandardMaterial({color: colors[MathUtils.randInt(0, colors.length-1)]});
      var star = new THREE.Mesh(geometry, material);
      //var star = new THREE.PointLight(colors[MathUtils.randInt(0, colors.length)]);
      star.position.x = x;
      star.position.y = y;
      star.position.z = z;
      this.scene.add(star);
    }
  }

  generateBodies(center:THREE.Vector3, total:number){
    for(var i = 0; i < 9; i++){
      var theta = Math.PI * 2 * MathUtils.randFloat(0,1);
      var r = .1 + ((i/9)*.4);
      var x = (r * Math.cos(theta)) + center.x;
      var y = center.y;
      var z = (r * Math.sin(theta)) + center.z;

      var geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(.001, .003), 24, 24);
      var colors = [0x6a6a6a, 0xebebeb, 0x017501, 0x0599ed, 0x4d3222]
      var material = new THREE.MeshStandardMaterial({color: colors[MathUtils.randInt(0, colors.length - 1)]});
      var body = new THREE.Mesh(geometry, material);
      body.position.x = x;
      body.position.y = y;
      body.position.z = z;
      this.scene.add(body);
    }
  }
}
