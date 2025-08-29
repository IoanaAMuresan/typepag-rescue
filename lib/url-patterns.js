export function generateUrlPatterns() {
  const patterns = [];
  
  // Common username patterns
  const commonNames = [
    // Common first names
    'john', 'mary', 'james', 'patricia', 'robert', 'jennifer', 'michael', 'linda',
    'david', 'elizabeth', 'richard', 'barbara', 'joseph', 'susan', 'thomas', 'jessica',
    // Common blog names
    'myblog', 'blog', 'journal', 'diary', 'thoughts', 'musings', 'reflections',
    'adventures', 'journey', 'stories', 'memories', 'experiences', 'life',
    // Professional
    'teacher', 'writer', 'photographer', 'artist', 'designer', 'consultant',
    // Hobbies
    'quilting', 'cooking', 'travel', 'books', 'music', 'art', 'craft', 'garden'
  ];
  
  // Generate combinations
  commonNames.forEach(name => {
    patterns.push(`https://${name}.typepad.com`);
    patterns.push(`https://${name}blog.typepad.com`);
    patterns.push(`https://${name}-blog.typepad.com`);
    patterns.push(`https://${name}writes.typepad.com`);
    patterns.push(`https://${name}thoughts.typepad.com`);
  });
  
  // Number combinations
  for (let i = 1; i <= 100; i++) {
    commonNames.slice(0, 10).forEach(name => {
      patterns.push(`https://${name}${i}.typepad.com`);
    });
  }
  
  return patterns;
}
