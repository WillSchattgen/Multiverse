import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrbitalBody } from './orbital-body';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  url = 'http://localhost:8080';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient, private router: Router) { }

  public getAllSpheres(): Observable<any> {
    //var body = {voterCode: voterCode};
    console.log('getSpheres()');
    console.log(this.url + '/multiverse/api/getAllSpheres');
    return this.http.get<any>(this.url + '/multiverse/api/getAllSpheres', this.httpOptions);
  }

  public getAllSpheresAndBodies(): Observable<any> {
    //var body = {voterCode: voterCode};
    console.log('getSpheresAndBodies()');
    console.log(this.url + '/multiverse/api/getAllSpheresAndBodies');
    return this.http.get<any>(this.url + '/multiverse/api/getAllSpheresAndBodies', this.httpOptions);
  }

  public saveOrbitalBody(orbitalBody: OrbitalBody, sphereId: Number) {

    var body = {"orbital_body_id":orbitalBody.orbital_body_id,
      "orbital_body_type":orbitalBody.orbital_body_type,
      "size":orbitalBody.size,
      "orbital_distance":orbitalBody.orbital_distance,
      "orbital_offset":orbitalBody.orbital_offset,
      "name":orbitalBody.name,
      "meshRadius":orbitalBody.meshRadius,
      "spacialRadius":orbitalBody.spacialRadius,
      "spacialAngle":orbitalBody.spacialAngle,
      "color":orbitalBody.color,
      "collapse":orbitalBody.collapse,
      "type":orbitalBody.type,
      "sphereId":sphereId
    };

    console.log(body);

    this.http.put<any>(this.url + '/multiverse/api/saveOrbitalBody', body, this.httpOptions).subscribe();
    console.log("testingSave");
  }
}
