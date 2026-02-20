// index.js - Main server entry point
const express = require('express');
const app = express();

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');

app.use(express.json());

app.get('/', (req, res) => res.send('API Running'));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
