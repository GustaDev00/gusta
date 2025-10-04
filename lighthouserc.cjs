const fs = require('fs');
const path = require('path');

function getPageUrls() {
  const appDir = path.join(__dirname, 'src', 'app');
  const entries = fs.readdirSync(appDir, { withFileTypes: true });

  const urls = entries
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const pageName = entry.name === 'home' ? 'index' : entry.name;
      return `http://localhost/${pageName}.html`;
    });

  return urls;
}

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 3,
      url: getPageUrls(),
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
