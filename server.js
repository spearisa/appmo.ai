const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simple AI simulation (replace with actual OpenAI integration)
app.post('/api/ask-ai', async (req, res) => {
    const { prompt, model, apiKey, html } = req.body;
    
    console.log('AI Request:', { prompt: prompt.substring(0, 100), model, hasApiKey: !!apiKey });
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Simulate AI generation with realistic HTML output
    const generatedHTML = generateRealisticHTML(prompt);
    
    // Stream the response
    const streamResponse = async () => {
        const words = generatedHTML.split('');
        for (let i = 0; i < words.length; i++) {
            res.write(words[i]);
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate streaming
        }
        res.end();
    };
    
    streamResponse().catch(err => {
        console.error('Streaming error:', err);
        res.status(500).json({ error: 'Streaming failed' });
    });
});

function generateRealisticHTML(prompt) {
    // Extract key themes from prompt
    const isLanding = prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('homepage');
    const isPortfolio = prompt.toLowerCase().includes('portfolio') || prompt.toLowerCase().includes('designer');
    const isEcommerce = prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('shop') || prompt.toLowerCase().includes('product');
    const isBlog = prompt.toLowerCase().includes('blog') || prompt.toLowerCase().includes('article');
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">`;

    if (isLanding) {
        html += `
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="container mx-auto px-4 py-20">
            <div class="text-center">
                <h1 class="text-5xl font-bold mb-6">Welcome to Our Platform</h1>
                <p class="text-xl mb-8 max-w-2xl mx-auto">Transform your business with our innovative solutions and cutting-edge technology.</p>
                <div class="flex gap-4 justify-center">
                    <button class="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                        Get Started
                    </button>
                    <button class="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Features Section -->
    <div class="container mx-auto px-4 py-16">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">Discover the features that make us the leading choice for businesses worldwide.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-blue-600">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Fast & Reliable</h3>
                <p class="text-gray-600">Lightning-fast performance with 99.9% uptime guarantee.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-green-600">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Secure</h3>
                <p class="text-gray-600">Enterprise-grade security to protect your data.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-md">
                <div class="text-4xl mb-4 text-purple-600">
                    <i class="fas fa-cogs"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Customizable</h3>
                <p class="text-gray-600">Tailor the platform to your specific needs.</p>
            </div>
        </div>
    </div>
    
    <!-- Testimonials -->
    <div class="bg-gray-100 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-gray-600 mb-4">"This platform has transformed our business operations. Highly recommended!"</p>
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                            JD
                        </div>
                        <div>
                            <div class="font-semibold">John Doe</div>
                            <div class="text-sm text-gray-500">CEO, TechCorp</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-gray-600 mb-4">"Excellent service and support. The best decision we've made."</p>
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                            JS
                        </div>
                        <div>
                            <div class="font-semibold">Jane Smith</div>
                            <div class="text-sm text-gray-500">Founder, InnovateLab</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Contact Section -->
    <div class="container mx-auto px-4 py-16">
        <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Ready to Get Started?</h2>
            <form class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Your Name" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <input type="email" placeholder="Your Email" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <textarea placeholder="Your Message" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"></textarea>
                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                    Send Message
                </button>
            </form>
        </div>
    </div>`;
    } else if (isPortfolio) {
        html += `
    <!-- Navigation -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold text-gray-900">Portfolio</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="text-gray-700 hover:text-blue-600">Home</a>
                    <a href="#about" class="text-gray-700 hover:text-blue-600">About</a>
                    <a href="#work" class="text-gray-700 hover:text-blue-600">Work</a>
                    <a href="#contact" class="text-gray-700 hover:text-blue-600">Contact</a>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section id="home" class="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-5xl font-bold mb-6">Creative Designer</h1>
                <p class="text-xl mb-8">Bringing ideas to life through innovative design and creative solutions.</p>
                <button class="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                    View My Work
                </button>
            </div>
        </div>
    </section>
    
    <!-- About Section -->
    <section id="about" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
                        <p class="text-gray-600 mb-6">I'm a passionate designer with over 5 years of experience creating beautiful and functional designs. I specialize in web design, branding, and user experience.</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-purple-600">50+</div>
                                <div class="text-sm text-gray-600">Projects Completed</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">30+</div>
                                <div class="text-sm text-gray-600">Happy Clients</div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
                        <div class="text-6xl">🎨</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Portfolio Gallery -->
    <section id="work" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">My Work</h2>
                <p class="text-gray-600">A selection of my recent projects</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <div class="text-4xl text-white">🌐</div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">E-commerce Website</h3>
                        <p class="text-gray-600">Modern e-commerce platform with responsive design.</p>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <div class="text-4xl text-white">📱</div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">Mobile App Design</h3>
                        <p class="text-gray-600">User-friendly mobile application interface.</p>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                        <div class="text-4xl text-white">🎯</div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">Brand Identity</h3>
                        <p class="text-gray-600">Complete brand identity and logo design.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Contact Section -->
    <section id="contact" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">Let's Work Together</h2>
                <p class="text-gray-600 mb-8">Ready to start your next project? Get in touch!</p>
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <div class="text-center">
                        <div class="text-2xl mb-2">📧</div>
                        <div class="font-semibold">Email</div>
                        <div class="text-gray-600">hello@example.com</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">📱</div>
                        <div class="font-semibold">Phone</div>
                        <div class="text-gray-600">+1 (555) 123-4567</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl mb-2">📍</div>
                        <div class="font-semibold">Location</div>
                        <div class="text-gray-600">San Francisco, CA</div>
                    </div>
                </div>
                <button class="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors">
                    Send Message
                </button>
            </div>
        </div>
    </section>`;
    } else if (isEcommerce) {
        html += `
    <!-- Product Page -->
    <div class="bg-white">
        <div class="container mx-auto px-4 py-8">
            <div class="grid md:grid-cols-2 gap-12">
                <!-- Product Images -->
                <div>
                    <div class="bg-gray-200 h-96 rounded-lg mb-4 flex items-center justify-center">
                        <div class="text-6xl">📱</div>
                    </div>
                    <div class="grid grid-cols-4 gap-2">
                        <div class="bg-gray-200 h-20 rounded flex items-center justify-center">
                            <div class="text-2xl">📱</div>
                        </div>
                        <div class="bg-gray-200 h-20 rounded flex items-center justify-center">
                            <div class="text-2xl">📱</div>
                        </div>
                        <div class="bg-gray-200 h-20 rounded flex items-center justify-center">
                            <div class="text-2xl">📱</div>
                        </div>
                        <div class="bg-gray-200 h-20 rounded flex items-center justify-center">
                            <div class="text-2xl">📱</div>
                        </div>
                    </div>
                </div>
                
                <!-- Product Details -->
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Premium Smartphone</h1>
                    <div class="flex items-center mb-4">
                        <div class="flex text-yellow-400">
                            <span>★★★★★</span>
                        </div>
                        <span class="text-gray-600 ml-2">(128 reviews)</span>
                    </div>
                    <p class="text-2xl font-bold text-green-600 mb-6">$599.99</p>
                    <p class="text-gray-600 mb-6">Experience the latest in smartphone technology with our premium device. Featuring advanced camera system, all-day battery life, and stunning display.</p>
                    
                    <!-- Product Options -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div class="flex gap-2">
                            <button class="w-8 h-8 bg-black rounded-full border-2 border-gray-300"></button>
                            <button class="w-8 h-8 bg-blue-600 rounded-full border-2 border-transparent"></button>
                            <button class="w-8 h-8 bg-red-600 rounded-full border-2 border-transparent"></button>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Storage</label>
                        <select class="w-full p-3 border border-gray-300 rounded-lg">
                            <option>128GB</option>
                            <option>256GB</option>
                            <option>512GB</option>
                        </select>
                    </div>
                    
                    <!-- Add to Cart -->
                    <div class="flex gap-4 mb-6">
                        <div class="flex items-center border border-gray-300 rounded-lg">
                            <button class="px-4 py-2 text-xl">-</button>
                            <span class="px-4 py-2">1</span>
                            <button class="px-4 py-2 text-xl">+</button>
                        </div>
                        <button class="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Add to Cart
                        </button>
                    </div>
                    
                    <!-- Product Features -->
                    <div class="border-t pt-6">
                        <h3 class="text-lg font-semibold mb-4">Key Features</h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center">
                                <span class="text-green-500 mr-2">✓</span>
                                6.1-inch Super Retina display
                            </li>
                            <li class="flex items-center">
                                <span class="text-green-500 mr-2">✓</span>
                                Advanced camera system
                            </li>
                            <li class="flex items-center">
                                <span class="text-green-500 mr-2">✓</span>
                                All-day battery life
                            </li>
                            <li class="flex items-center">
                                <span class="text-green-500 mr-2">✓</span>
                                Water resistant
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="bg-gray-50 py-16">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                JD
                            </div>
                            <div>
                                <div class="font-semibold">John Doe</div>
                                <div class="flex text-yellow-400">★★★★★</div>
                            </div>
                        </div>
                        <p class="text-gray-600">"Excellent phone with great camera quality. Battery life is amazing!"</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                JS
                            </div>
                            <div>
                                <div class="font-semibold">Jane Smith</div>
                                <div class="flex text-yellow-400">★★★★★</div>
                            </div>
                        </div>
                        <p class="text-gray-600">"Fast delivery and the phone exceeded my expectations. Highly recommended!"</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    } else {
        // Default/Blog layout
        html += `
    <!-- Blog Header -->
    <header class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900">My Blog</h1>
                <nav class="hidden md:flex space-x-8">
                    <a href="#" class="text-gray-700 hover:text-blue-600">Home</a>
                    <a href="#" class="text-gray-700 hover:text-blue-600">About</a>
                    <a href="#" class="text-gray-700 hover:text-blue-600">Contact</a>
                </nav>
            </div>
        </div>
    </header>
    
    <!-- Featured Post -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl">
                <div class="inline-block bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Featured Post
                </div>
                <h2 class="text-4xl font-bold mb-4">The Future of Web Development</h2>
                <p class="text-xl mb-6">Exploring the latest trends and technologies shaping the future of web development in 2024.</p>
                <div class="flex items-center text-sm">
                    <span>By John Doe</span>
                    <span class="mx-2">•</span>
                    <span>January 15, 2024</span>
                    <span class="mx-2">•</span>
                    <span>5 min read</span>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Blog Posts -->
    <section class="py-16">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <div class="text-4xl">🚀</div>
                    </div>
                    <div class="p-6">
                        <div class="text-sm text-blue-600 font-semibold mb-2">Technology</div>
                        <h3 class="text-xl font-bold mb-3">Getting Started with AI</h3>
                        <p class="text-gray-600 mb-4">Learn the basics of artificial intelligence and how to implement it in your projects.</p>
                        <div class="flex items-center text-sm text-gray-500">
                            <span>Jan 10, 2024</span>
                            <span class="mx-2">•</span>
                            <span>3 min read</span>
                        </div>
                    </div>
                </article>
                
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <div class="text-4xl">🎨</div>
                    </div>
                    <div class="p-6">
                        <div class="text-sm text-purple-600 font-semibold mb-2">Design</div>
                        <h3 class="text-xl font-bold mb-3">Modern UI Trends</h3>
                        <p class="text-gray-600 mb-4">Discover the latest design trends that are shaping modern user interfaces.</p>
                        <div class="flex items-center text-sm text-gray-500">
                            <span>Jan 8, 2024</span>
                            <span class="mx-2">•</span>
                            <span>4 min read</span>
                        </div>
                    </div>
                </article>
                
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <div class="text-4xl">💻</div>
                    </div>
                    <div class="p-6">
                        <div class="text-sm text-orange-600 font-semibold mb-2">Programming</div>
                        <h3 class="text-xl font-bold mb-3">JavaScript Best Practices</h3>
                        <p class="text-gray-600 mb-4">Essential tips and tricks for writing clean, maintainable JavaScript code.</p>
                        <div class="flex items-center text-sm text-gray-500">
                            <span>Jan 5, 2024</span>
                            <span class="mx-2">•</span>
                            <span>6 min read</span>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
    
    <!-- Newsletter Signup -->
    <section class="bg-gray-100 py-16">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p class="text-gray-600 mb-8 max-w-2xl mx-auto">Subscribe to our newsletter and never miss a post. Get the latest articles delivered to your inbox.</p>
            <form class="max-w-md mx-auto flex gap-4">
                <input type="email" placeholder="Your email address" class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <button type="submit" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                </button>
            </form>
        </div>
    </section>`;
    }

    html += `
</body>
</html>`;

    return html;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Appmo Functional Server running on http://localhost:${PORT}`);
    console.log(`📝 AI simulation server ready for requests`);
});

module.exports = app;
