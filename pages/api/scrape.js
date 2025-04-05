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
    
    // Run scraper script with better error handling
    try {
      await new Promise((resolve, reject) => {
        execFile('node', ['test.js', url], {timeout: 60000}, (error, stdout, stderr) => {
          if (error) {
            console.error('Scraper script error:', error);
            console.error('Stderr:', stderr);
            if (error.message.includes('Cannot find module')) {
              reject(new Error('Missing dependencies. Please run: npm install puppeteer axios'));
            } else {
              reject(error);
            }
          } else {
            resolve(stdout);
          }
        });
      });
    } catch (scriptError) {
      console.error('Failed to run scraper:', scriptError);
      return res.status(500).json({ 
        message: scriptError.message || 'Failed to run scraper script',
        error: 'SCRAPER_ERROR' 
      });
    }

    // Check if the scraping result file exists
    const scrapingFilePath = path.join(process.cwd(), 'scraping1.json');
    if (!fs.existsSync(scrapingFilePath)) {
      return res.status(500).json({ 
        message: 'Scraping failed to produce output file',
        error: 'NO_OUTPUT_FILE'
      });
    }

    // Read scraped data
    const scrapedData = JSON.parse(
      fs.readFileSync(scrapingFilePath, 'utf8')
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
      formattedData.noteText = await formatMathWithGemini(scrapedData.noteText);
    } catch (geminiError) {
      console.error('Gemini processing error:', geminiError);
      // Continue with unformatted data if Gemini fails
      formattedData.statement = scrapedData.statement;
      formattedData.inputSpec = scrapedData.inputSpec;
      formattedData.outputSpec = scrapedData.outputSpec;
      formattedData.noteText = scrapedData.noteText;
    }

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: 'INTERNAL_ERROR' 
    });
  }
}
