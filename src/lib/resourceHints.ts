/**
 * Resource Hints Manager
 * Prefetch and preload critical resources for better performance
 */

export class ResourceHintsManager {
  private static instance: ResourceHintsManager;
  private prefetchedUrls = new Set<string>();

  private constructor() {}

  static getInstance(): ResourceHintsManager {
    if (!ResourceHintsManager.instance) {
      ResourceHintsManager.instance = new ResourceHintsManager();
    }
    return ResourceHintsManager.instance;
  }

  /**
   * Prefetch a resource (low priority)
   */
  prefetch(url: string): void {
    if (this.prefetchedUrls.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = this.getResourceType(url);
    document.head.appendChild(link);
    
    this.prefetchedUrls.add(url);
  }

  /**
   * Preload a resource (high priority)
   */
  preload(url: string, type?: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type || this.getResourceType(url);
    document.head.appendChild(link);
  }

  /**
   * Preconnect to an origin
   */
  preconnect(url: string, crossorigin = false): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  /**
   * DNS prefetch for an origin
   */
  dnsPrefetch(url: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Determine resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.endsWith('.js') || url.endsWith('.mjs')) return 'script';
    if (url.endsWith('.css')) return 'style';
    if (url.endsWith('.woff2') || url.endsWith('.woff')) return 'font';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'image';
    return 'fetch';
  }

  /**
   * Prefetch route chunks on idle
   */
  prefetchRouteChunks(routes: string[]): void {
    if (!('requestIdleCallback' in window)) return;

    requestIdleCallback(() => {
      routes.forEach(route => {
        // Convert route to chunk name
        const chunkName = route.replace(/^\//, '').replace(/\//g, '-') || 'index';
        const chunkUrl = `/assets/js/page-${chunkName}-*.js`;
        this.prefetch(chunkUrl);
      });
    });
  }
}

export const resourceHints = ResourceHintsManager.getInstance();
