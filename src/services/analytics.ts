// Analytics service for tracking user engagement and app performance
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

class AnalyticsService {
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];

  // Initialize analytics (can be extended with actual analytics service)
  init() {
    this.isInitialized = true;
    console.log('Analytics initialized');
    
    // Process any queued events
    this.queue.forEach(event => this.track(event));
    this.queue = [];
  }

  // Track an event
  track(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    if (!this.isInitialized) {
      this.queue.push(enrichedEvent);
      return;
    }

    // In production, send to actual analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(enrichedEvent);
    } else {
      console.log('Analytics Event:', enrichedEvent);
    }
  }

  // Track page views
  trackPageView(page: string) {
    this.track({
      event: 'page_view',
      properties: { page }
    });
  }

  // Track user actions
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track({
      event: 'user_action',
      properties: { action, ...properties }
    });
  }

  // Track concert-related events
  trackConcertEvent(event: string, concertId?: string, properties?: Record<string, any>) {
    this.track({
      event: 'concert_event',
      properties: { event, concertId, ...properties }
    });
  }

  // Track ranking events
  trackRankingEvent(event: string, properties?: Record<string, any>) {
    this.track({
      event: 'ranking_event',
      properties: { event, ...properties }
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    this.track({
      event: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        context
      }
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track({
      event: 'performance',
      properties: { metric, value, ...properties }
    });
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Send to actual analytics service (placeholder)
  private sendToAnalytics(event: AnalyticsEvent) {
    // TODO: Integrate with actual analytics service (Google Analytics, Mixpanel, etc.)
    // For now, just log in production
    console.log('Analytics Event (Production):', event);
    
    // Example integration:
    // if (window.gtag) {
    //   window.gtag('event', event.event, event.properties);
    // }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  analytics.init();
}

export default analytics; 