import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment.development";
import {GpsPoint} from "../models/GpsPoint.model";

@Injectable({
  providedIn: 'root'
})
export class GpsService {

  constructor(private http: HttpClient) {
  }

  getPointsByDevice(deviceId: number):Observable<Array<GpsPoint>> {
    return this.http.get<Array<GpsPoint>>(`${environment.apiUrl}/api/gps/${deviceId}`);
  }
}
