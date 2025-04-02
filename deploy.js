// deploy.js
const ghpages = require('gh-pages');

ghpages.publish(
    'build',
    {
    repo: 'https://github.com/Doug824/pathfinder-combat-tracker.git',
    branch: 'gh-pages',
    message: 'Auto-generated commit'
    },
    function(err) {
    if (err) {
        console.error('Deployment error:', err);
    } else {
        console.log('Deployment successful!');
    }
    }
);