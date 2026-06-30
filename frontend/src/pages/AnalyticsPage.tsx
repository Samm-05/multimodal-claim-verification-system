import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  analyticsKPIs,
  monthlyClaimsData,
  claimsByTypeData,
  fraudTrendData,
} from '../constants/mockData';
import {
  FileText,
  Timer,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'Timer':
        return <Timer className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'DollarSign':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getKPIColors = (color: string) => {
    switch (color) {
      case 'primary':
        return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
      case 'success':
        return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/20' };
      case 'danger':
        return { text: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' };
      default:
        return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    }
  };

  // Colors for category donut chart
  const PIE_COLORS = ['#c0c1ff', '#ffdcc5', '#ffb783', '#8083ff'];

  return (
    <div className="p-page-margin-desktop max-w-[1600px] mx-auto flex flex-col gap-stack-lg animate-[fade-in-up_0.4s_ease-out]">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Analytics &amp; Insights</h2>
        <p className="text-text-muted text-sm mt-1">
          Detailed metrics showing operational efficiency, model precision, and fraud prevention trends.
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        {analyticsKPIs.map((kpi, idx) => {
          const colors = getKPIColors(kpi.color);
          const isPos = kpi.changeType === 'positive';
          return (
            <div
              key={idx}
              className={`bg-surface-card border border-border-subtle p-stack-md rounded-xl flex flex-col justify-between hover:border-border-subtle/80 hover:bg-surface-card/90 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${colors.text} ${colors.bg}`}>
                  {getIcon(kpi.icon)}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-on-surface">{kpi.value}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-xs font-bold flex items-center ${isPos ? 'text-success' : 'text-danger'}`}>
                    {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-text-muted">vs last quarter</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg">
        {/* Main Performance History Area Chart */}
        <div className="lg:col-span-2 bg-surface-card border border-border-subtle p-stack-lg rounded-xl flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary fill-primary/10" />
              <span>Claims Processing Volume</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">Total count of successfully verified claims month-by-month.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyClaimsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2020" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#e2e2e2',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#c0c1ff" strokeWidth={2} fillOpacity={1} fill="url(#colorClaims)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claim Categorization Pie Chart */}
        <div className="bg-surface-card border border-border-subtle p-stack-lg rounded-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-on-surface">Claims By Category</h3>
            <p className="text-xs text-text-muted mt-1">Percentage distribution across object types.</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={claimsByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {claimsByTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#e2e2e2',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-on-surface">12.8K</span>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Active</span>
            </div>
          </div>
          {/* Legend list */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            {claimsByTypeData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                <span className="text-text-muted">{item.name}</span>
                <span className="text-on-surface ml-auto font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Prevention Trend Bar Chart */}
        <div className="lg:col-span-3 bg-surface-card border border-border-subtle p-stack-lg rounded-xl flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-on-surface">Fraud Prevention Trend</h3>
            <p className="text-xs text-text-muted mt-1">Monthly fraud attempts intercepted by the Risk Assessment Agent.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2020" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#e2e2e2',
                  }}
                />
                <Bar dataKey="value" fill="#8083ff" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
