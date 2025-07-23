import { Component } from '@angular/core';
import { OptimizedImageComponent } from "../../components/optimized-image/optimized-image.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [OptimizedImageComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {}