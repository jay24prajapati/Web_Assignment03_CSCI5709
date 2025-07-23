import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private cache = new Map<string, string>();
  private readonly MAX_CACHE_SIZE = 50;

  async getOptimizedImage(url: string, width?: number, height?: number): Promise<string> {
    const cacheKey = `${url}-${width}-${height}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const optimizedUrl = this.createOptimizedUrl(url, width, height);
      
      await this.preloadImage(optimizedUrl);
      
      this.addToCache(cacheKey, optimizedUrl);
      
      return optimizedUrl;
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return url;
    }
  }

  private createOptimizedUrl(url: string, width?: number, height?: number): string {
    if (url.includes('pixabay.com')) {
      const params = [];
      if (width) params.push(`w=${width}`);
      if (height) params.push(`h=${height}`);
      
      return params.length > 0 ? `${url}?${params.join('&')}` : url;
    }
    
    return url;
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

    private addToCache(key: string, value: string): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const iterator = this.cache.keys();
        const firstEntry = iterator.next();
        
        if (!firstEntry.done && firstEntry.value) {
        this.cache.delete(firstEntry.value);
        }
    }
    this.cache.set(key, value);
    }

  clearCache(): void {
    this.cache.clear();
  }
}