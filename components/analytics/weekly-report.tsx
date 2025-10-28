'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Heart, Activity, RefreshCw, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyReportData {
  content: string;
  metadata: {
    weekStart: string;
    weekEnd: string;
    generatedAt: string;
    dataPoints: {
      moodEntries: number;
      journalEntries: number;
      meditationSessions: number;
      therapySessions: number;
    };
    isFailover: boolean;
  };
  insights: {
    averageMood: number;
    moodTrend: string;
    topEmotions: string[];
    activityStreak: number;
    progressHighlights: string[];
  };
}

interface WeeklyReportProps {
  className?: string;
}

export function WeeklyReport({ className }: WeeklyReportProps) {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/analytics/weekly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          weekEnd: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReport(data.report);
      toast({
        title: "Weekly Report Generated",
        description: "Your personalized wellness report is ready!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'declining':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleShare = async () => {
    if (!report) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Weekly Wellness Report',
          text: report.content.substring(0, 200) + '...',
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(report.content);
        toast({
          title: "Report Copied",
          description: "Weekly report copied to clipboard!",
        });
      }
    } catch (err) {
      console.error('Error sharing report:', err);
    }
  };

  const handleDownload = () => {
    if (!report) return;

    const content = `Weekly Wellness Report
Generated: ${formatDate(report.metadata.generatedAt)}
Week: ${formatDate(report.metadata.weekStart)} - ${formatDate(report.metadata.weekEnd)}

${report.content}

---
Insights:
- Average Mood: ${report.insights.averageMood}/10
- Mood Trend: ${report.insights.moodTrend}
- Activity Streak: ${report.insights.activityStreak} days
- Top Emotions: ${report.insights.topEmotions.join(', ') || 'None'}

Data Points:
- Mood Entries: ${report.metadata.dataPoints.moodEntries}
- Journal Entries: ${report.metadata.dataPoints.journalEntries}
- Meditation Sessions: ${report.metadata.dataPoints.meditationSessions}
- Therapy Sessions: ${report.metadata.dataPoints.therapySessions}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${formatDate(report.metadata.weekEnd)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your weekly report has been saved!",
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Wellness Report
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={generateReport}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!report && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Report Yet</h3>
              <p className="text-sm mb-4">
                Generate your personalized weekly wellness report to see insights about your mood, activities, and progress.
              </p>
              <Button onClick={generateReport} disabled={loading}>
                Generate My First Report
              </Button>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Week of {formatDate(report.metadata.weekStart)} - {formatDate(report.metadata.weekEnd)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Generated on {formatDate(report.metadata.generatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShare} size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleDownload} size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-800">{report.insights.averageMood}</div>
                  <div className="text-xs text-blue-600">Avg Mood</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-800">{report.insights.activityStreak}</div>
                  <div className="text-xs text-green-600">Active Days</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getMoodTrendIcon(report.insights.moodTrend)}
                  </div>
                  <div className="text-sm font-bold text-purple-800 capitalize">{report.insights.moodTrend}</div>
                  <div className="text-xs text-purple-600">Mood Trend</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-800">{report.metadata.dataPoints.moodEntries + report.metadata.dataPoints.journalEntries}</div>
                  <div className="text-xs text-orange-600">Entries</div>
                </div>
              </div>

              {/* Mood Trend Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mood Trend:</span>
                <Badge className={getMoodTrendColor(report.insights.moodTrend)}>
                  {getMoodTrendIcon(report.insights.moodTrend)}
                  <span className="ml-1 capitalize">{report.insights.moodTrend}</span>
                </Badge>
              </div>

              {/* Top Emotions */}
              {report.insights.topEmotions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Emotions This Week</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.insights.topEmotions.map((emotion, index) => (
                      <Badge key={index} variant="secondary">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Highlights */}
              {report.insights.progressHighlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Progress Highlights</h4>
                  <div className="space-y-1">
                    {report.insights.progressHighlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Report Content */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">AI Wellness Insights</h4>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {report.content}
                  </pre>
                </div>
              </div>

              {/* Data Summary */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Based on {report.metadata.dataPoints.moodEntries} mood entries, {report.metadata.dataPoints.journalEntries} journal entries, {report.metadata.dataPoints.meditationSessions} meditation sessions, and {report.metadata.dataPoints.therapySessions} therapy sessions.</p>
                {report.metadata.isFailover && (
                  <p className="mt-1 text-orange-600">Report generated using fallback method due to AI service unavailability.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
