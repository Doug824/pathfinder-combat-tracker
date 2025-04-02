// deploy.js
const ghpages = require('gh-pages');

const options = {
    repo: 'https://github.com/Doug824/pathfinder-combat-tracker.git',
    branch: 'gh-pages',
    message: 'Auto-generated commit',
    user: {
    name: 'Doug824',
    email: 'doug.hagan824@gmail.com'
    },
    dotfiles: true
};

console.log('Deploying with options:', options);

ghpages.publish('build', options, function(err) {
    if (err) {
        console.error('Deployment error:', err);
    } else {
        console.log('Deployment successful!');
    }
    });