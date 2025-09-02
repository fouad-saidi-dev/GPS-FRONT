import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from "leaflet";
import {GpsService} from "../../services/gps.service";
import {GpsPoint} from "../../models/GpsPoint.model";
import {interval, Subject, Subscription, takeUntil} from "rxjs";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit {

  private map!: L.Map;
  private coords: L.LatLngExpression[] = [];
  private gpsPoints: GpsPoint[] = [];

  constructor(private gpsService: GpsService) {}

  ngOnInit() {

    this.gpsService.getPointsByDevice(429911).subscribe({
      next: points => {
        console.log(points);
      },
      error: err => console.log(err)
    });
  }

  ngAfterViewInit(): void {
    this.loadPoints();
  }

  private loadPoints(): void {
    this.gpsService.getPointsByDevice(429911).subscribe((data: GpsPoint[]) => {
      this.gpsPoints = data.filter(p => p.latitude && p.longitude);
      this.coords = this.gpsPoints.map(p => [p.latitude, p.longitude]);

      if (this.coords.length > 0) {
        this.initMap();
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map');


    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);


    const polyline = L.polyline(this.coords, {
      color: 'red',
      weight: 5,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(this.map);

    this.map.fitBounds(polyline.getBounds());

    const iconA = L.icon({
      iconUrl: 'assets/marker-a.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35]
    });


    const iconB = L.icon({
      iconUrl: 'assets/marker-b.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35]
    });


    L.marker(this.coords[0],{icon: iconA}).addTo(this.map);


    L.marker(this.coords[this.coords.length - 1],{icon: iconB}).addTo(this.map);


    const carIcon = L.icon({
      iconUrl: 'assets/marker.png',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const movingMarker = L.marker(this.coords[0], { icon: carIcon }).addTo(this.map);


    let i = 0;
    const speed = 200;
    const step = () => {
      if (i < this.coords.length - 1) {
        const from = L.latLng(this.coords[i]);
        const to = L.latLng(this.coords[i + 1]);
        let t = 0;
        const interval = setInterval(() => {
          t += 0.05;
          if (t > 1) {
            clearInterval(interval);
            i++;
            step();
          } else {
            const lat = from.lat + (to.lat - from.lat) * t;
            const lng = from.lng + (to.lng - from.lng) * t;
            movingMarker.setLatLng([lat, lng]);


            const point = this.gpsPoints[i];
            if (point) {
              movingMarker.bindPopup(`
                <b>📍 Device:</b> ${429911}<br>
                <b>🕒 Date:</b> ${point.date}<br>
                <b>🚗 Speed:</b> ${point.speed} km/h<br>
                <b>⛽ Fuel:</b> ${point.fuel}
              `);
            }
          }
        }, speed / 20);
      }
    };

    step();
  }
}
