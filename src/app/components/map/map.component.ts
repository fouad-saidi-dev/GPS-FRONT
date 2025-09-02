import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from "leaflet";
import {GpsService} from "../../services/gps.service";
import {GpsPoint} from "../../models/GpsPoint.model";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;

  constructor(private gpsService: GpsService) {
  }

  ngOnInit() {

    this.gpsService.getPointsByDevice(429911).subscribe({
      next: points => {
        console.log(points);
      },
      error: err => console.log(err)
    });
  }

  ngAfterViewInit(): void {

    this.initMap();

    this.gpsService.getPointsByDevice(429911).subscribe(points => {
      if (points.length > 0) {
        this.showPolyline(points);
        this.animateMarker(points);
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [35.62, 10.74], // default center
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private showPolyline(points: GpsPoint[]): void {
    const coords = points.map(p => [p.latitude, p.longitude]) as [number, number][];
    L.polyline(coords, {color: 'blue'}).addTo(this.map);
    this.map.fitBounds(coords as any);
  }

  private animateMarker(points: GpsPoint[]): void {
    const coords = points.map(p => [p.latitude, p.longitude]) as [number, number][];
    const marker = L.marker(coords[0]).addTo(this.map);

    let i = 0;
    setInterval(() => {
      if (i < coords.length) {
        marker.setLatLng(coords[i]);
        marker.bindPopup(`
          <b>Date:</b> ${points[i].date}<br>
          <b>Speed:</b> ${points[i].speed} km/h<br>
          <b>Fuel:</b> ${points[i].fuel}<br>
          <b>Heading:</b> ${points[i].heading}°
        `).openPopup();
        i++;
      }
    }, 1000); // move every second
  }
}
