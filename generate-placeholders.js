#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

class PlaceholderGenerator {
    constructor() {
        this.width = 400;
        this.height = 300;
        this.screenshotsDir = path.join(__dirname, 'screenshots');
    }

    async generatePlaceholder(text, filename) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1a202c');
        gradient.addColorStop(1, '#2d3748');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Border
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, this.width - 2, this.height - 2);

        // Text
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split text into lines if too long
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > this.width - 40) {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        // Draw lines
        const lineHeight = 20;
        const totalHeight = lines.length * lineHeight;
        const startY = (this.height - totalHeight) / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, this.width / 2, startY + (index * lineHeight));
        });

        // DeepSite logo/badge
        ctx.fillStyle = '#3182ce';
        ctx.fillRect(this.width - 80, 10, 70, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('DeepSite', this.width - 45, 25);

        // Save image
        const buffer = canvas.toBuffer('image/png');
        const filePath = path.join(this.screenshotsDir, filename);
        fs.writeFileSync(filePath, buffer);
        
        return filePath;
    }

    async generateFromScreenshotsJson() {
        const jsonPath = path.join(__dirname, 'screenshots.json');
        
        if (!fs.existsSync(jsonPath)) {
            console.log('❌ screenshots.json not found');
            return;
        }

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!Array.isArray(data)) {
            console.log('❌ Invalid screenshots.json format');
            return;
        }

        // Create screenshots directory
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }

        console.log(`🎨 Generating ${data.length} placeholder screenshots...`);

        let generated = 0;
        const batchSize = 10;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (item) => {
                if (item.filename && item.filename.endsWith('.png')) {
                    // Extract project name from filename
                    const projectName = item.filename
                        .replace('space-', '')
                        .replace('.png', '')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());

                    try {
                        await this.generatePlaceholder(projectName, item.filename);
                        generated++;
                        
                        if (generated % 100 === 0) {
                            console.log(`📸 Generated ${generated}/${data.length} screenshots...`);
                        }
                    } catch (error) {
                        console.error(`❌ Error generating ${item.filename}:`, error.message);
                    }
                }
            }));

            // Small delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Successfully generated ${generated} placeholder screenshots!`);
    }
}

async function main() {
    const generator = new PlaceholderGenerator();
    
    try {
        await generator.generateFromScreenshotsJson();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PlaceholderGenerator;
