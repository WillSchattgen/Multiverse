import * as THREE from "three";

export class CustomCurve extends THREE.Curve<THREE.Vector3> {
    scale: number = 0;

    constructor( scale = 1 ) {
		super();
        this.scale = scale;
	}

	getPoint( t: number, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( .5*Math.PI * t );
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    }
}
