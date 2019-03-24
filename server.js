var cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.get('/', (req,res) => {
    res.send('Hello World');
});

app.listen(3000, () => 
    console.log('listen to port 3000'),
);