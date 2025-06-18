export interface MetricDefinition {
  name: string
  description: string
  unit: string
  type: 'counter' | 'gauge' | 'histogram'
  tags?: string[]
}

export interface DashboardWidget {
  title: string
  type: 'timeseries' | 'number' | 'heatmap' | 'table'
  metrics: string[]
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count'
  groupBy?: string[]
}

export interface Dashboard {
  name: string
  description: string
  widgets: DashboardWidget[]
}

// Define all metrics we're tracking
export const metrics: Record<string, MetricDefinition> = {
  // Performance metrics
  'web.performance.lcp': {
    name: 'Largest Contentful Paint',
    description: 'Time to largest content element render',
    unit: 'milliseconds',
    type: 'histogram',
    tags: ['page', 'device_type'],
  },
  'web.performance.fid': {
    name: 'First Input Delay',
    description: 'Time from first interaction to response',
    unit: 'milliseconds',
    type: 'histogram',
    tags: ['page', 'interaction_type'],
  },
  'web.performance.cls': {
    name: 'Cumulative Layout Shift',
    description: 'Visual stability score',
    unit: 'score',
    type: 'gauge',
    tags: ['page'],
  },
  
  // API metrics
  'api.request.count': {
    name: 'API Request Count',
    description: 'Number of API requests',
    unit: 'requests',
    type: 'counter',
    tags: ['endpoint', 'method', 'status'],
  },
  'api.request.duration': {
    name: 'API Request Duration',
    description: 'Time to process API request',
    unit: 'milliseconds',
    type: 'histogram',
    tags: ['endpoint', 'method'],
  },
  
  // Business metrics
  'business.waitlist.signups': {
    name: 'Waitlist Signups',
    description: 'Number of waitlist signups',
    unit: 'signups',
    type: 'counter',
    tags: ['source', 'variant'],
  },
  'business.purchase.count': {
    name: 'Purchase Count',
    description: 'Number of completed purchases',
    unit: 'purchases',
    type: 'counter',
    tags: ['plan', 'source'],
  },
  'business.purchase.value': {
    name: 'Purchase Value',
    description: 'Total purchase value',
    unit: 'cents',
    type: 'counter',
    tags: ['plan', 'currency'],
  },
  
  // Error metrics
  'error.count': {
    name: 'Error Count',
    description: 'Number of errors',
    unit: 'errors',
    type: 'counter',
    tags: ['type', 'severity', 'source'],
  },
  
  // Database metrics
  'db.query.count': {
    name: 'Database Query Count',
    description: 'Number of database queries',
    unit: 'queries',
    type: 'counter',
    tags: ['query_type', 'table'],
  },
  'db.query.duration': {
    name: 'Database Query Duration',
    description: 'Time to execute query',
    unit: 'milliseconds',
    type: 'histogram',
    tags: ['query_type', 'table'],
  },
  'db.pool.active': {
    name: 'Active DB Connections',
    description: 'Number of active database connections',
    unit: 'connections',
    type: 'gauge',
    tags: [],
  },
}

// Define dashboards
export const dashboards: Dashboard[] = [
  {
    name: 'Web Performance',
    description: 'Core Web Vitals and performance metrics',
    widgets: [
      {
        title: 'Core Web Vitals',
        type: 'timeseries',
        metrics: ['web.performance.lcp', 'web.performance.fid', 'web.performance.cls'],
        aggregation: 'avg',
      },
      {
        title: 'Page Load Performance by Page',
        type: 'heatmap',
        metrics: ['web.performance.lcp'],
        groupBy: ['page'],
      },
      {
        title: 'Performance Score',
        type: 'number',
        metrics: ['web.performance.lcp', 'web.performance.fid', 'web.performance.cls'],
        aggregation: 'avg',
      },
    ],
  },
  
  {
    name: 'API Health',
    description: 'API performance and error rates',
    widgets: [
      {
        title: 'Request Rate',
        type: 'timeseries',
        metrics: ['api.request.count'],
        aggregation: 'sum',
        groupBy: ['endpoint'],
      },
      {
        title: 'Response Time',
        type: 'timeseries',
        metrics: ['api.request.duration'],
        aggregation: 'avg',
        groupBy: ['endpoint'],
      },
      {
        title: 'Error Rate',
        type: 'timeseries',
        metrics: ['api.request.count'],
        aggregation: 'sum',
        groupBy: ['status'],
      },
      {
        title: 'Slowest Endpoints',
        type: 'table',
        metrics: ['api.request.duration'],
        aggregation: 'max',
        groupBy: ['endpoint'],
      },
    ],
  },
  
  {
    name: 'Business Metrics',
    description: 'Key business performance indicators',
    widgets: [
      {
        title: 'Waitlist Signups',
        type: 'timeseries',
        metrics: ['business.waitlist.signups'],
        aggregation: 'sum',
        groupBy: ['variant'],
      },
      {
        title: 'Purchase Funnel',
        type: 'timeseries',
        metrics: ['business.purchase.count'],
        aggregation: 'sum',
      },
      {
        title: 'Revenue',
        type: 'number',
        metrics: ['business.purchase.value'],
        aggregation: 'sum',
      },
      {
        title: 'Conversion Rate by Source',
        type: 'table',
        metrics: ['business.purchase.count', 'business.waitlist.signups'],
        groupBy: ['source'],
      },
    ],
  },
  
  {
    name: 'Database Performance',
    description: 'Database query performance and connection pool health',
    widgets: [
      {
        title: 'Query Volume',
        type: 'timeseries',
        metrics: ['db.query.count'],
        aggregation: 'sum',
        groupBy: ['query_type'],
      },
      {
        title: 'Query Performance',
        type: 'timeseries',
        metrics: ['db.query.duration'],
        aggregation: 'avg',
        groupBy: ['query_type'],
      },
      {
        title: 'Connection Pool Usage',
        type: 'timeseries',
        metrics: ['db.pool.active'],
        aggregation: 'max',
      },
      {
        title: 'Slow Queries',
        type: 'table',
        metrics: ['db.query.duration'],
        aggregation: 'max',
        groupBy: ['query_type', 'table'],
      },
    ],
  },
  
  {
    name: 'Error Tracking',
    description: 'Application errors and issues',
    widgets: [
      {
        title: 'Error Rate',
        type: 'timeseries',
        metrics: ['error.count'],
        aggregation: 'sum',
        groupBy: ['severity'],
      },
      {
        title: 'Errors by Type',
        type: 'table',
        metrics: ['error.count'],
        aggregation: 'sum',
        groupBy: ['type'],
      },
      {
        title: 'Critical Errors',
        type: 'number',
        metrics: ['error.count'],
        aggregation: 'sum',
      },
    ],
  },
]

// Helper to format dashboard configuration for Datadog
export const getDatadogDashboardConfig = (dashboard: Dashboard) => {
  return {
    title: dashboard.name,
    description: dashboard.description,
    widgets: dashboard.widgets.map(widget => ({
      definition: {
        title: widget.title,
        type: widget.type,
        requests: [
          {
            q: widget.metrics
              .map(metric => `${widget.aggregation || 'avg'}:${metric}{*}`)
              .join(', '),
            display_type: widget.type === 'timeseries' ? 'line' : widget.type,
          },
        ],
      },
    })),
  }
}