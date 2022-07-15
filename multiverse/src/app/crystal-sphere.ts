import { Orbit } from "./orbit";
import { OrbitalBody } from "./orbital-body";

export class CrystalSphere {
    crystal_sphere_id: number = -1;
    name: string = "Sphere Space";
    xpos: number = 0;
    ypos: number = 0;
    zpos: number = 0;
    size: number = 0;
    sphere_type_id: number = 1;
    stars: OrbitalBody[] = [];
    orbits: Orbit[] = [];
    faction: string = "";
}
