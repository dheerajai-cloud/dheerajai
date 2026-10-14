import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support large payloads for screenshots and file data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Google GenAI initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize JSON extracted from Gemini
function extractJsonFromText(text: string): any {
  try {
    // Try clean direct parse
    return JSON.parse(text);
  } catch (err) {
    // Attempt markdown json code block extraction
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (innerErr) {
        // Fallback: look for first { and last }
      }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(slice);
    }
    throw new Error('Could not parse valid JSON from model response');
  }
}

// 1. Generate Report Endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const {
      prompt,
      reportType = 'dashboard',
      theme = 'looker-classic',
      dataSources = [],
      rawTextData = '',
      images = [], // array of { mimeType, data: base64 }
      dateRange = { start: 'Last 30 Days', end: 'Today' },
      clientName = 'Acme Corp',
    } = req.body;

    const systemInstruction = `You are PromptStudio, an elite BI & Analytics architect inspired by Google Looker Studio (formerly Google Data Studio) and world-class management consulting firms (McKinsey, Bain).
Your task is to take the user's prompt, data sources, uploaded raw data (from GA4, Google Search Console, Microsoft Clarity, Excel spreadsheets, or pasted notes), and uploaded screenshots/images, and produce a COMPLETE, PRODUCTION-READY, LOOKER STUDIO-STYLE REPORT.

IMPORTANT GUIDELINES:
1. Every report MUST be grounded in the user's actual data or instructions. If realistic metrics are requested or inferred from uploaded sources (e.g. GA4 sessions, bounce rate, e-commerce conversion, GSC organic impressions/clicks/CTR/keywords, Clarity rage clicks/dead clicks/scroll depth), synthesize accurate, coherent, and mathematically consistent figures.
2. Structure the output as clean JSON matching the specified schema.
3. Include high-impact executive summaries, scorecards (KPI cards with comparison % and sparklines), and multiple visualization widgets (TimeSeries line/area, Bar charts, Donut charts, Conversion funnels, Clarity UX friction heatmaps, Geo distributions, Case Study blocks with before/after lift, and prioritized Recommendations).
4. Provide realistic multi-period time-series (e.g. 14-30 daily or weekly data points) so charts look rich and authentic, exactly like Google Looker Studio.
5. If the user requested a Case Study (or reportType is 'case-study'), include detailed 'case_study_block' sections with The Challenge, The Solution, Key Results, Before vs After metrics, and a Client Quote.
6. The JSON must strictly conform to the expected format without extra conversational preamble.`;

    const userPrompt = `Generate a comprehensive ${reportType} report.
User Prompt / Goal: "${prompt || 'Comprehensive Multi-Channel Performance Report'}"
Target Theme: ${theme}
Client / Brand: ${clientName}
Date Range: ${JSON.stringify(dateRange)}
Connected Data Sources: ${JSON.stringify(dataSources)}
User Provided Data / Notes / CSV / Text:
${rawTextData ? rawTextData.substring(0, 10000) : 'None provided; synthesize realistic data based on the chosen sources.'}

Format requirements: Return a JSON object with this EXACT structure:
{
  "id": "rep-${Date.now()}",
  "title": "string (clear, professional report title)",
  "subtitle": "string (explanatory subtitle with date & scope)",
  "reportType": "${reportType}",
  "theme": "${theme}",
  "dateRange": { "start": "string", "end": "string", "label": "string" },
  "clientInfo": { "name": "${clientName}", "industry": "string" },
  "executiveSummary": {
    "headline": "string",
    "paragraphs": ["string", "string"],
    "highlightChips": [{"label": "string", "value": "string", "color": "blue|green|amber|purple"}],
    "status": "positive"
  },
  "scorecards": [
    {
      "id": "sc-1",
      "label": "string (e.g. Total Sessions, Organic Clicks, Conv. Rate)",
      "value": "string (e.g. 148,290 or $42.5K)",
      "prefix": "$ or empty",
      "suffix": "% or empty",
      "changePercent": 14.8,
      "changeType": "positive" (positive|negative|neutral),
      "comparisonLabel": "vs. previous 30 days",
      "sparkline": [12, 14, 13, 18, 22, 25, 24, 28, 30],
      "sourceBadge": "GA4" (or GSC, Clarity, Excel)
    }
  ],
  "pages": [
    {
      "pageId": "p1",
      "pageTitle": "string (e.g. Executive Performance & KPIs)",
      "sections": [
        {
          "id": "sec-1",
          "title": "string",
          "description": "string",
          "widgets": [
            // List of widgets (timeSeries, barChart, donutChart, funnel, clarityFriction, dataTable, caseStudyBlock, recommendations)
          ]
        }
      ]
    }
  ]
}

Widget definitions:
- timeSeries: { "type": "timeSeries", "id": "w1", "title": "string", "yAxisLabel": "string", "series": [{"name": "string", "color": "#1a73e8", "data": [{"date": "Oct 1", "value": 1200}, ...]}] }
- barChart: { "type": "barChart", "id": "w2", "title": "string", "orientation": "vertical"|"horizontal", "categories": ["Direct", "Organic Search", "Paid Search", "Social", "Email"], "series": [{"name": "Sessions", "color": "#1a73e8", "values": [3200, 8500, 4100, 2200, 1900]}] }
- donutChart: { "type": "donutChart", "id": "w3", "title": "string", "slices": [{"label": "Organic", "value": 48, "color": "#1a73e8"}, {"label": "Direct", "value": 26, "color": "#34a853"}, {"label": "Paid", "value": 16, "color": "#fbbc04"}, {"label": "Social", "value": 10, "color": "#ea4335"}] }
- funnel: { "type": "funnel", "id": "w4", "title": "string", "steps": [{"stepName": "Homepage Visits", "count": 84200, "rate": "100%", "dropoffRate": "0%"}, {"stepName": "Product Page", "count": 42100, "rate": "50%", "dropoffRate": "50%"}, {"stepName": "Added to Cart", "count": 12630, "rate": "15%", "dropoffRate": "70%"}, {"stepName": "Checkout Initiated", "count": 7580, "rate": "9%", "dropoffRate": "40%"}, {"stepName": "Purchase Completed", "count": 4820, "rate": "5.7%", "dropoffRate": "36%"}] }
- clarityFriction: { "type": "clarityFriction", "id": "w5", "title": "Microsoft Clarity UX & Friction Analysis", "totalSessions": 45120, "metrics": [{"label": "Rage Clicks", "rate": "2.4%", "status": "warning", "insight": "High rage clicking on checkout billing address form"}, {"label": "Dead Clicks", "rate": "4.1%", "status": "warning", "insight": "Users clicking non-interactive promo banner"}, {"label": "Quick Backs", "rate": "6.8%", "status": "neutral", "insight": "Normal back navigation on category pages"}, {"label": "Avg Scroll Depth", "rate": "68%", "status": "positive", "insight": "Hero and pricing fold has 92% visibility"}] }
- dataTable: { "type": "dataTable", "id": "w6", "title": "string", "columns": [{"key": "keyword", "label": "Query / Page"}, {"key": "clicks", "label": "Clicks"}, {"key": "impressions", "label": "Impressions"}, {"key": "ctr", "label": "CTR"}, {"key": "position", "label": "Avg Pos"}], "rows": [{"keyword": "ecommerce analytics tool", "clicks": 4290, "impressions": 58200, "ctr": "7.37%", "position": 2.4}, ...] }
- caseStudyBlock: { "type": "caseStudyBlock", "id": "w7", "title": "Client Case Study & Impact", "challenge": "Client was experiencing a 42% cart abandonment rate and declining organic rank across key product categories.", "solution": "Implemented multi-step checkout optimization, SEO technical overhaul, schema tags, and UX friction elimination based on Clarity heatmaps.", "clientQuote": { "quote": "The results surpassed our quarterly targets within 60 days. The clarity in data reporting was instrumental.", "author": "Sarah Jenkins", "role": "VP of Growth, " + clientName }, "beforeAfter": [{"metric": "Organic Traffic", "before": "45,000 /mo", "after": "142,000 /mo", "lift": "+215%"}, {"metric": "Checkout Conversion", "before": "1.82%", "after": "3.94%", "lift": "+116%"}, {"metric": "Monthly Revenue", "before": "$82,000", "after": "$234,000", "lift": "+185%"}] }
- recommendations: { "type": "recommendations", "id": "w8", "title": "Strategic Next Steps & ROI Roadmap", "items": [{"priority": "high", "title": "Fix Checkout Address Autocomplete", "impact": "+$18K MRR", "effort": "Low", "description": "Eliminating dead clicks on checkout step 2 will recover estimated 320 abandoned carts/mo."}, {"priority": "medium", "title": "Scale High-CTR Long-Tail Keywords", "impact": "+24% Organic Traffic", "effort": "Medium", "description": "Build cluster content around top 5 rising queries identified in Search Console."}] }

Make sure you include at least 4 scorecards and at least 3-5 rich widgets across 1-2 pages so the report looks truly world-class, ready for client presentation.`;

    const parts: any[] = [];

    // Add any uploaded screenshots or images
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.data && img.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        }
      }
    }

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const reportJson = extractJsonFromText(response.text || '{}');
    res.json({ success: true, report: reportJson });
  } catch (err: any) {
    console.error('Error in /api/generate-report:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate report',
    });
  }
});

// 2. Refine Report Endpoint (Prompt or Voice instruction)
app.post('/api/refine-report', async (req, res) => {
  try {
    const { currentReport, prompt, voiceCommand = false } = req.body;

    if (!currentReport || !prompt) {
      return res.status(400).json({ success: false, error: 'currentReport and prompt are required' });
    }

    const systemInstruction = `You are PromptStudio's real-time report modification AI.
The user wants to refine an existing Looker Studio-grade report using a natural language text prompt or voice command.
Examples of user commands:
- "Change the theme to dark slate"
- "Add a scorecard for ROAS with value 4.8x and +35% change"
- "Add an executive recommendation for improving mobile conversion"
- "Change the line chart to focus on monthly revenue"
- "Make the tone of the executive summary more formal and aimed at the board of directors"
- "Add a before-after case study section showing 300% growth"

RULES:
1. Apply the user's modifications precisely to the report JSON.
2. Preserve all existing widgets and data unless specifically asked to remove or replace them.
3. Return a JSON object with two fields:
   "updatedReport": The modified report object matching the exact original structure.
   "changeSummary": A concise 1-2 sentence description of what was updated.`;

    const contents = `Current Report JSON:
${JSON.stringify(currentReport)}

User Modification Prompt: "${prompt}" (Voice Command: ${voiceCommand})

Return JSON with:
{
  "updatedReport": { ...full report JSON... },
  "changeSummary": "string describing changes"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = extractJsonFromText(response.text || '{}');
    res.json({
      success: true,
      updatedReport: result.updatedReport || currentReport,
      changeSummary: result.changeSummary || 'Report updated successfully.',
    });
  } catch (err: any) {
    console.error('Error in /api/refine-report:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to refine report',
    });
  }
});

// 3. Analyze Screenshot / OCR Endpoint
app.post('/api/analyze-screenshot', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', additionalContext = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    const systemInstruction = `You are PromptStudio's computer vision and data extraction engine.
You are given a screenshot of a dashboard or report (e.g. from Google Analytics 4, Google Search Console, Microsoft Clarity, Excel spreadsheet, or client pitch deck).
Your task is to:
1. Identify the source platform (GA4, GSC, Clarity, Excel, Stripe, Shopify, Ads, etc.).
2. Extract all visible numeric metrics, dates, percentages, and table rows with high fidelity.
3. Transcribe visible graphs (trend directions, peak points, categories).
4. Auto-generate a structured Looker Studio report JSON representing the screenshot's data so the user can immediately edit, present, or export it.`;

    const parts = [
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      {
        text: `Analyze this dashboard screenshot and convert it into a complete PromptStudio Looker-style report.
Additional Context: ${additionalContext || 'None'}
Return JSON with:
{
  "detectedSource": "GA4 | Search Console | Microsoft Clarity | Excel | Other",
  "extractedSummary": "A concise summary of what was found in the image",
  "keyMetrics": [{"label": "string", "value": "string", "change": "string"}],
  "report": { ...full Looker Studio report JSON structure with scorecards, timeSeries/bar/donut/funnel/table widgets matching the screenshot... }
}`,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in /api/analyze-screenshot:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to analyze screenshot',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Dev vs Production static asset serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptStudio Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
