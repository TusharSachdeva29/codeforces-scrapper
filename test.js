const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const homepageUrl = "https://codeforces.com/contest/2065/problem/H"; // Change URL for different problems
const filePath = path.join(__dirname, 'scraping1.json');
const imagesDir = path.join(__dirname, 'images');
const TIMEOUT = 60000;

async function downloadImage(url, filename) {
    try {
        const response = await axios({ url, responseType: 'arraybuffer' });
        fs.writeFileSync(path.join(imagesDir, filename), response.data);
        console.log(`✅ Image saved: ${filename}`);
    } catch (error) {
        console.error(`❌ Failed to download image: ${url}`, error.message);
    }
}

async function scrape() {
    try {
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir);
        }
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Set User-Agent & Viewport
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );
        await page.setViewport({ width: 1366, height: 768 });
        
        // Visit Codeforces Problem Page
        await page.goto(homepageUrl, { waitUntil: 'networkidle2', timeout: TIMEOUT });
        
        // Extract Problem Title
        const title = await page.$eval('.title', el => el.innerText.trim());
        
        // Extract Problem Statement (Handles multiple paragraphs)
        const statement = await page.$$eval('.problem-statement p', elements =>
            elements.map(el => el.innerText.trim()).join("\n")
        );
        
        // Extract Input Specification
        const inputSpec = await page.$$eval('.input-specification p', elements =>
            elements.map(el => el.innerText.trim()).join("\n")
        );
        
        // Extract Output Specification
        const outputSpec = await page.$$eval('.output-specification p', elements =>
            elements.map(el => el.innerText.trim()).join("\n")
        );
        
        // Extract Example Test Cases (Inputs & Outputs)
        const examples = await page.$$eval('.sample-test .input pre, .sample-test .output pre', elements =>
            elements.map(el => el.innerText.trim())
        );
        
        // Separate Input and Output Test Cases
        const sampleInputs = examples.filter((_, i) => i % 2 === 0);
        const sampleOutputs = examples.filter((_, i) => i % 2 === 1);
        
        // Extract Note (if exists)
        let note = "";
        const noteElement = await page.$('.note p');
        if (noteElement) {
            note = await page.$$eval('.note p', elements =>
                elements.map(el => el.innerText.trim()).join("\n")
            );
        }
        
        // Extract and Download Images
        const images = await page.$$eval('.problem-statement img', elements =>
            elements.map(el => el.src)
        );
        
        const imageFilenames = [];
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i].startsWith("/") ? `https://codeforces.com${images[i]}` : images[i];
            const filename = `image_${i + 1}.png`;
            await downloadImage(imageUrl, filename);
            imageFilenames.push(filename);
        }
        
        // Store Data in JSON
        const scrapedData = { title, statement, inputSpec, outputSpec, sampleInputs, sampleOutputs, note, images: imageFilenames };
        fs.writeFileSync(filePath, JSON.stringify(scrapedData, null, 2));
        
        console.log("✅ Data scraped and saved successfully!");
        await browser.close();
        return scrapedData;
        
    } catch (error) {
        console.error("❌ Scraping failed:", error.message);
    }
}

// Execute Function
(async () => {
    await scrape();
})();