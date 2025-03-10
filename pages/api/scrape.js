import { formatMathWithGemini } from '../../utils/gemini';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    // Run scraper script
    await new Promise((resolve, reject) => {
      execFile('node', ['test.js', url], async (error) => {
        if (error) reject(error);
        resolve();
      });
    });

    // Read scraped data
    const scrapedData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'scraping1.json'), 'utf8')
    );

    // Process through Gemini with better error handling
    const formattedData = {
      ...scrapedData,
    };

    // Process each field separately with error handling
    try {
      formattedData.statement = await formatMathWithGemini(scrapedData.statement);
      formattedData.inputSpec = await formatMathWithGemini(scrapedData.inputSpec);
      formattedData.outputSpec = await formatMathWithGemini(scrapedData.outputSpec);
    } catch (formatError) {
      console.error('Error formatting with Gemini:', formatError);
      // Use original data if formatting fails
      formattedData.statement = scrapedData.statement;
      formattedData.inputSpec = scrapedData.inputSpec;
      formattedData.outputSpec = scrapedData.outputSpec;
    }

    formattedData.sampleInputs = scrapedData.sampleInputs;
    formattedData.sampleOutputs = scrapedData.sampleOutputs;

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
}
