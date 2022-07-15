import { OrbitalBody } from "./orbital-body";

export class Orbit {
    orbitNumber: number = -1;
    orbitalBodies: OrbitalBody[] = [];
    radiusOffset: number = 0;
    radiusOffsetMax: number = 0;
    radiusOffsetMin: number = 0;
    orbitAngleStart: number = 0;
    anglePercentage: number = 0;
    angleMax = 2 * Math.PI;
    collapse: boolean = false;
}
