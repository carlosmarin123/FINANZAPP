import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client lazily / safely
  let aiClient: GoogleGenAI | null = null;
  const getAiClient = () => {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  };

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'FinanzApp' });
  });

  // Google Sheets CSV proxy endpoint
  app.get('/api/fetch-sheet-csv', async (req, res) => {
    try {
      const defaultUrl =
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyATe6zNqapQ_zEQvkckWz5wsDW1IlAv0oZxvL1tcRygie5cLpQIXtB5kgMxaQcgZpuRckF-WrvM1w/pub?output=csv';
      const targetUrl = (req.query.url as string) || defaultUrl;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: `Error HTTP ${response.status} al obtener CSV` });
      }

      const csvText = await response.text();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csvText);
    } catch (err: any) {
      console.error('Error fetching sheet CSV:', err);
      return res.status(500).json({ error: err?.message || 'Error al descargar datos de Google Sheets' });
    }
  });

  // AI Advisor Endpoint
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const { prompt, summary, currency = 'BOB' } = req.body;
      const client = getAiClient();

      const symbolMap: Record<string, string> = {
        BOB: 'Bs.',
        USD: '$',
      };
      const currSymbol = symbolMap[currency] || 'Bs.';

      if (!client) {
        // Fallback response when no API key configured
        return res.json({
          reply: `Basándome en tus datos actuales (Patrimonio: ${currSymbol} ${summary?.totalWealth || 0}, Tasa de ahorro: ${summary?.savingsRatePercent?.toFixed(1) || 0}%), te sugiero optimizar los gastos recurrentes y destinar un 15% adicional a tus cuentas de inversión.`,
        });
      }

      const systemInstruction = `Eres FinanzApp AI, un asesor financiero profesional, conciso y empático. Responde en castellano/español con análisis estructurado y consejos prácticos en formato texto limpio o con bullets. Utiliza la moneda del usuario (${currSymbol}) y sus siguientes datos: Patrimonio Total: ${currSymbol} ${summary?.totalWealth}, Ingresos Mensuales: ${currSymbol} ${summary?.monthlyIncome}, Gastos Mensuales: ${currSymbol} ${summary?.monthlyExpenses}, Tasa de Ahorro: ${summary?.savingsRatePercent?.toFixed(1)}%.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'Análisis completado exitosamente.';
      return res.json({ reply });
    } catch (err) {
      console.error('AI Advisor error:', err);
      return res.json({
        reply: 'Recomendación recomendada: Mantén tu gasto mensual controlado y revisa el presupuesto de categorías con alertas.',
      });
    }
  });

  // Vite Middleware for Dev vs Production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanzApp server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
