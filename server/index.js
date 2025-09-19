// Express server entry point
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const authRouter = require('./routes/authRouter');

app.use(express.json());
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Metana Fullstack Bootcamp - Module 9 API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
