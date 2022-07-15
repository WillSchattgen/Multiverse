import * as THREE from "three";
import { Color } from "three";
import { OrbitalBodyType } from "./orbital-body-type";

export class OrbitalBody {
    mesh: THREE.Mesh = new THREE.Mesh();
    belt: THREE.Mesh[] = [];
    orbital_body_id: number = -1;
    orbital_body_type: number = 1;
    size: number = 0;
    orbital_distance: number = 0;
    orbital_offset: number = 0;
    name: string = '';
    meshRadius: number = 0;
    spacialRadius: number = 0;
    spacialAngle: number = 0;
    color: string = '0x228822';
    collapse: boolean = false;
    type: OrbitalBodyType = 6;
}
