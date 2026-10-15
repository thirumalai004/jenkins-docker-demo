const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello from CI/CD v1'));
app.listen(3000, () => console.log('Running on 3000'));