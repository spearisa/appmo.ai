# DeepSite Gallery

A gallery showcasing websites created with [DeepSite](https://enzostvs-Appmo.hf.space/projects/new) - an AI-powered web development tool.

## 🚀 Quick Start

### 1. Start the Gallery
```bash
# Start the local server
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### 2. Start the Functional AI Server
```bash
# Start the AI functionality server
node server.js
```

Access the functional interface at [http://localhost:3001/Appmo-functional.html](http://localhost:3001/Appmo-functional.html)

### 3. Start the Full DeepSite Application
```bash
# Start the complete DeepSite application
cd Appmo-full && npm run dev
```

Access the full application at [http://localhost:3000](http://localhost:3000)

### 4. Generate Placeholder Screenshots
If you see 404 errors for missing screenshots:
```bash
python3 generate_placeholders.py
```

### 5. Use DeepSite
```bash
# Open DeepSite and create sample prompts
python3 Appmo_client.py
```

## 📁 Project Structure

```
Appmo-gallery/
├── index.html              # Main gallery page
├── screenshots.json        # List of DeepSite projects
├── screenshots/            # Generated placeholder images (1,653 files)
├── generated-websites/     # Saved HTML from DeepSite
├── sample_prompts.txt      # Sample prompts for DeepSite
├── generate_placeholders.py # Script to create placeholder images
├── Appmo_client.py      # Python client for DeepSite
└── package.json           # Node.js dependencies (optional)
```

## 🎨 Features

- **Gallery Interface**: Browse DeepSite projects in a responsive grid
- **Screenshot Generation**: Automated placeholder image creation
- **DeepSite Integration**: Tools to work with the DeepSite web app
- **Sample Prompts**: Pre-made prompts for creating websites

## 🛠️ Tools Available

### 1. Placeholder Generator
Creates placeholder images for missing screenshots:
```bash
python3 generate_placeholders.py
```
- Generates 1,653 placeholder images
- Each image shows the project name
- Includes DeepSite branding

### 2. DeepSite Client
Opens DeepSite and provides sample prompts:
```bash
python3 Appmo_client.py
```
- Opens DeepSite in your browser
- Creates sample prompts file
- Saves generated HTML files

### 3. Gallery Server
Serves the gallery locally:
```bash
python3 -m http.server 8000
```

## 📝 Sample Prompts for DeepSite

The `sample_prompts.txt` file contains 10 ready-to-use prompts:

1. Modern startup landing page
2. Graphic designer portfolio
3. Restaurant website
4. Blog with clean design
5. E-commerce product page
6. Fitness app landing page
7. Real estate website
8. Photography portfolio
9. SaaS dashboard interface
10. Travel blog

## 🔧 Dependencies

### Python Dependencies
```bash
pip3 install Pillow requests
```

### Node.js Dependencies (Optional)
```bash
npm install
```

## 🌐 Live Demo

- **Gallery**: [http://localhost:8000](http://localhost:8000)
- **DeepSite**: [https://enzostvs-Appmo.hf.space/projects/new](https://enzostvs-Appmo.hf.space/projects/new)

## 📊 Gallery Statistics

- **Total Projects**: 1,653
- **Filtered by Rating**: ≥ 50
- **Screenshot Status**: ✅ All placeholders generated
- **Gallery Status**: ✅ Running without 404 errors

## 🎯 How to Use

1. **View the Gallery**: Open `http://localhost:8000` to see all DeepSite projects
2. **Create New Projects**: Use `python3 Appmo_client.py` to open DeepSite
3. **Generate Screenshots**: Run the placeholder generator if needed
4. **Save Projects**: Generated HTML files are saved to `generated-websites/`

## ⚠️ Important Notes

- The gallery shows placeholder images for projects without actual screenshots
- Each project links to its Hugging Face Space
- The warning about personal information and malicious code is displayed
- Projects are filtered by rating (≥ 50) for quality

## 🔗 Links

- [DeepSite Official](https://enzostvs-Appmo.hf.space/projects/new)
- [DeepSite Gallery](https://huggingface.co/spaces/victor/Appmo-gallery)
- [DeepSite Help](https://huggingface.co/spaces/enzostvs/Appmo/discussions/157)

## 📄 License

MIT License - Feel free to use and modify as needed.
