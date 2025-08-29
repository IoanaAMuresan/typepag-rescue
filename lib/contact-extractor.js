import * as cheerio from 'cheerio';

export async function extractContacts(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TypePadRescueBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const contacts = {
      emails: extractEmails(html),
      author: extractAuthor($),
      socialMedia: extractSocialMedia($),
      contactPage: findContactPage($, url),
      aboutPage: findAboutPage($, url),
      lastPost: extractLastPostDate($),
      postCount: extractPostCount($)
    };
    
    return contacts;
    
  } catch (error) {
    console.error(`Contact extraction failed for ${url}:`, error);
    return {
      emails: [],
      author: null,
      socialMedia: [],
      contactPage: null,
      aboutPage: null,
      lastPost: null,
      postCount: 0
    };
  }
}

function extractEmails(html) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex) || [];
  
  // Filter out common false positives
  return [...new Set(emails)].filter(email => 
    !email.includes('example.com') &&
    !email.includes('noreply') &&
    !email.includes('no-reply') &&
    !email.includes('donotreply') &&
    !email.includes('support@typepad.com')
  ).slice(0, 5);
}

function extractAuthor($) {
  const selectors = [
    '.author',
    '.by-author',
    '.post-author',
    '.blogger-name',
    '.profile-name',
    'meta[name="author"]',
    '.about-author'
  ];
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length) {
      const text = element.attr('content') || element.text().trim();
      if (text && text.length > 2 && text.length < 50) {
        return text;
      }
    }
  }
  
  return null;
}

function extractSocialMedia($) {
  const social = [];
  
  $('a[href*="twitter.com"], a[href*="facebook.com"], a[href*="instagram.com"]').each((i, el) => {
    const href = $(el).attr('href');
    const platform = href.includes('twitter') ? 'Twitter' : 
                    href.includes('facebook') ? 'Facebook' : 'Instagram';
    
    social.push({
      platform,
      url: href,
      handle: href.split('/').pop()
    });
  });
  
  return social.slice(0, 5);
}

function findContactPage($, baseUrl) {
  const contactLinks = $('a[href*="contact"]');
  if (contactLinks.length > 0) {
    const href = contactLinks.first().attr('href');
    return href?.startsWith('http') ? href : `${baseUrl}${href}`;
  }
  return null;
}

function findAboutPage($, baseUrl) {
  const aboutLinks = $('a[href*="about"]');
  if (aboutLinks.length > 0) {
    const href = aboutLinks.first().attr('href');
    return href?.startsWith('http') ? href : `${baseUrl}${href}`;
  }
  return null;
}

function extractLastPostDate($) {
  const dateSelectors = [
    '.post-date',
    '.entry-date',
    '.published',
    'time[datetime]',
    '.date'
  ];
  
  for (const selector of dateSelectors) {
    const element = $(selector);
    if (element.length) {
      const dateText = element.attr('datetime') || element.text().trim();
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  return null;
}

function extractPostCount($) {
  const posts = $('.post, .entry, article').length;
  return posts > 0 ? posts : 0;
}
