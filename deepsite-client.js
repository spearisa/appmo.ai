#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DeepSiteClient {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://enzostvs-deepsite.hf.space';
    }

    async init() {
        console.log('🚀 Starting DeepSite client...');
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for headless mode
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        await this.page.goto(`${this.baseUrl}/projects/new`);
        
        // Wait for the page to load
        await this.page.waitForSelector('textarea[placeholder*="Ask DeepSite"]', { timeout: 10000 });
        console.log('✅ DeepSite loaded successfully!');
    }

    async createWebsite(prompt) {
        if (!this.page) {
            throw new Error('DeepSite client not initialized. Call init() first.');
        }

        console.log(`🎨 Creating website with prompt: "${prompt}"`);
        
        // Find the textarea and enter the prompt
        const textarea = await this.page.$('textarea[placeholder*="Ask DeepSite"]');
        if (!textarea) {
            throw new Error('Could not find the DeepSite input textarea');
        }

        // Clear and type the prompt
        await textarea.click();
        await textarea.evaluate(el => el.value = '');
        await textarea.type(prompt);

        // Click the send button (arrow up icon)
        const sendButton = await this.page.$('button[disabled=""]');
        if (sendButton) {
            // Wait for button to be enabled
            await this.page.waitForFunction(
                () => {
                    const button = document.querySelector('button[disabled=""]');
                    return !button || !button.disabled;
                },
                { timeout: 30000 }
            );
        }

        // Find and click the send button
        const sendBtn = await this.page.$('button:has(svg.lucide-arrow-up)');
        if (sendBtn) {
            await sendBtn.click();
            console.log('📤 Prompt sent to DeepSite');
        }

        // Wait for the website to be generated
        await this.page.waitForTimeout(5000);

        // Try to get the generated HTML
        const generatedHTML = await this.page.evaluate(() => {
            const iframe = document.querySelector('#preview-iframe');
            return iframe ? iframe.srcdoc : null;
        });

        return generatedHTML;
    }

    async takeScreenshot(filename) {
        if (!this.page) {
            throw new Error('DeepSite client not initialized. Call init() first.');
        }

        console.log(`📸 Taking screenshot: ${filename}`);
        
        // Take screenshot of the preview area
        const previewArea = await this.page.$('#preview-iframe');
        if (previewArea) {
            const screenshotPath = path.join(__dirname, 'screenshots', filename);
            await previewArea.screenshot({ path: screenshotPath });
            console.log(`✅ Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        }
        
        throw new Error('Could not find preview area for screenshot');
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 DeepSite client closed');
        }
    }
}

// Example usage
async function main() {
    const client = new DeepSiteClient();
    
    try {
        await client.init();
        
        // Example: Create a simple website
        const prompt = "Create a modern landing page for a tech startup with a hero section, features, and contact form";
        const html = await client.createWebsite(prompt);
        
        if (html) {
            console.log('🎉 Website generated successfully!');
            
            // Take a screenshot
            const screenshotName = `space-deepsite-demo-${Date.now()}.png`;
            await client.takeScreenshot(screenshotName);
            
            // Save the HTML
            const htmlPath = path.join(__dirname, 'generated-websites', `demo-${Date.now()}.html`);
            fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
            fs.writeFileSync(htmlPath, html);
            console.log(`💾 HTML saved: ${htmlPath}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

// Export for use in other scripts
module.exports = DeepSiteClient;

// Run if called directly
if (require.main === module) {
    main();
}
