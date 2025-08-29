const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const BING_API_KEY = process.env.BING_SEARCH_API_KEY;

export const searchEngines = {
  async google(query, startIndex = 1) {
    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.warn('Google Search API not configured');
      return [];
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items) {
        return data.items
          .map(item => item.link)
          .filter(link => link && link.includes('typepad.com'));
      }
      
      return [];
    } catch (error) {
      console.error('Google search failed:', error);
      return [];
    }
  },

  async bing(query) {
    if (!BING_API_KEY) {
      console.warn('Bing Search API not configured');
      return [];
    }

    try {
      const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        headers: {
          'Ocp-Apim-Subscription-Key': BING_API_KEY
        }
      });
      
      const data = await response.json();
      
      if (data.webPages?.value) {
        return data.webPages.value
          .map(item => item.url)
          .filter(url => url && url.includes('typepad.com'));
      }
      
      return [];
    } catch (error) {
      console.error('Bing search failed:', error);
      return [];
    }
  }
};
