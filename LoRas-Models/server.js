const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get model data
app.get('/api/models', async (req, res) => {
    try {
        const modelData = await scanModelFolder();
        res.json(modelData);
    } catch (error) {
        console.error('Error scanning model folder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function scanModelFolder() {
    const modelsPath = path.join(__dirname, 'Models');
    const models = [];
    
    // Read the main categories
    const categories = await fs.readdir(modelsPath);
    
    for (const category of categories) {
        const categoryPath = path.join(modelsPath, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
            // Read subcategories (if any)
            const items = await fs.readdir(categoryPath);
            
            for (const item of items) {
                const itemPath = path.join(categoryPath, item);
                const itemStat = await fs.stat(itemPath);
                
                if (itemStat.isDirectory()) {
                    // Look for metadata.json in the folder
                    try {
                        const metadataPath = path.join(itemPath, 'metadata.json');
                        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
                        
                        models.push({
                            name: metadata.name || item,
                            category: category.toLowerCase(),
                            timestamp: metadata.timestamp || itemStat.mtime,
                            previewImage: metadata.previewImage || findPreviewImage(itemPath),
                            fullImage: metadata.fullImage,
                            description: metadata.description,
                            shortDescription: metadata.shortDescription,
                            links: metadata.links || []
                        });
                    } catch (error) {
                        console.warn(`No metadata found for ${item}, using defaults`);
                        // Add basic entry without metadata
                        models.push({
                            name: item,
                            category: category.toLowerCase(),
                            timestamp: itemStat.mtime,
                            previewImage: findPreviewImage(itemPath),
                            description: '',
                            links: []
                        });
                    }
                }
            }
        }
    }
    
    return models;
}

function findPreviewImage(folderPath) {
    // Logic to find the first image in the folder
    // You might want to implement this based on your naming conventions
    return '/images/default-preview.png';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
