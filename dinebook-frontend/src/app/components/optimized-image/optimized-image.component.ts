import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCacheService } from '../../services/image-cache.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-container" [style.width.px]="width" [style.height.px]="height">
      <img 
        [src]="optimizedSrc || fallbackSrc" 
        [alt]="alt"
        [loading]="loading"
        [class.loaded]="imageLoaded"
        (load)="onImageLoad()"
        (error)="onImageError()"
        class="optimized-image">
      <div *ngIf="!imageLoaded" class="image-placeholder">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
    }
    
    .optimized-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    
    .optimized-image.loaded {
      opacity: 1;
    }
    
    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e0e0e0;
      border-left-color: #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class OptimizedImageComponent implements OnInit, OnDestroy {
  @Input() src!: string;
  @Input() alt = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  
  optimizedSrc?: string;
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  imageLoaded = false;
  
  private destroy$ = new Subject<void>();

  constructor(private imageCacheService: ImageCacheService) {}

  ngOnInit() {
    this.loadOptimizedImage();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadOptimizedImage() {
    try {
      this.optimizedSrc = await this.imageCacheService.getOptimizedImage(
        this.src, 
        this.width, 
        this.height
      );
    } catch (error) {
      console.warn('Failed to load optimized image:', error);
      this.optimizedSrc = this.src;
    }
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  onImageError() {
    this.optimizedSrc = this.fallbackSrc;
    this.imageLoaded = true;
  }
}