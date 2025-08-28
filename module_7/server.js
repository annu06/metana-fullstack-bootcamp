const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/blogs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blogs.html'));
});

app.get('/blog/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'singleBlog.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminDashboard.html'));
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- Homepage: http://localhost:' + PORT);
    console.log('- Blog List: http://localhost:' + PORT + '/blogs');
    console.log('- Single Blog: http://localhost:' + PORT + '/blog/1');
    console.log('- Admin Dashboard: http://localhost:' + PORT + '/admin');
});

module.exports = app;