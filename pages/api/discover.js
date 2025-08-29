import { searchEngines } from '../../lib/search-engines';
import { generateUrlPatterns } from '../../lib/url-patterns';
import { extractContacts } from '../../lib/contact-extractor';
import { searchQueries } from '../../data/search-queries';

let discoveryProgress = {
  isRunning: false,
  phase: '',
  progress: 0,
  total: 0,
  found: 0
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (discoveryProgress.isRunning) {
    return res.status(429).json({ 
      error: 'Discovery already running',
      progress: discoveryProgress 
    });
  }

  try {
    discoveryProgress.isRunning = true;
    discoveryProgress.phase = 'Initializing comprehensive discovery';
    discoveryProgress.progress = 0;
    
    const allUrls = new Set();
    const results = [];

    // Phase 1: Search Engine Discovery
    discoveryProgress.phase = 'Phase 1: Search Engine Discovery';
    discoveryProgress.total = searchQueries.comprehensive.length;

    for (let i = 0; i < searchQueries.comprehensive.length; i++) {
      const query = searchQueries.comprehensive[i];
      discoveryProgress.progress = i + 1;
      
      try {
        const urls = await searchEngines.google(query);
        urls.forEach(url => allUrls.add(url));
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
      }
    }

    // Phase 2: Pattern-based Discovery
    discoveryProgress.phase = 'Phase 2: Pattern-based URL Discovery';
    const patternUrls = generateUrlPatterns();
    discoveryProgress.total = patternUrls.length;
    
    for (let i = 0; i < patternUrls.length; i++) {
      discoveryProgress.progress = i + 1;
      allUrls.add(patternUrls[i]);
    }

    // Phase 3: URL Testing & Contact Extraction
    discoveryProgress.phase = 'Phase 3: Testing URLs and Extracting Contacts';
    const urlArray = Array.from(allUrls);
    discoveryProgress.total = urlArray.length;
    
    for (let i = 0; i < urlArray.length; i++) {
      const url = urlArray[i];
      discoveryProgress.progress = i + 1;
      
      try {
        // Test if URL is alive
        const isAlive = await testUrl(url);
        
        if (isAlive) {
          // Extract contact information
          const contactInfo = await extractContacts(url);
          
          const blogData = {
            url,
            ...contactInfo,
            discoveredAt: new Date().toISOString(),
            status: 'active'
          };
          
          results.push(blogData);
          discoveryProgress.found++;
          
          // Save to database (implement your preferred database)
          await saveBlogData(blogData);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to process ${url}:`, error);
      }
    }

    const stats = {
      totalDiscovered: allUrls.size,
      liveBlogs: results.length,
      withContacts: results.filter(r => r.emails?.length > 0 || r.contactPage).length,
      lastRun: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      stats,
      results: results.slice(0, 100), // Return first 100 for display
      totalFound: results.length
    });

  } catch (error) {
    console.error('Discovery failed:', error);
    return res.status(500).json({ error: 'Discovery failed', details: error.message });
  } finally {
    discoveryProgress.isRunning = false;
  }
}

async function testUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function saveBlogData(blogData) {
  // Implement database saving logic here
  // Could be SQLite, PostgreSQL, or even JSON files
  console.log('Saving blog data:', blogData.url);
}
