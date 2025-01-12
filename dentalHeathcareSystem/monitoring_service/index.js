const express = require('express');
const monitor = require('./monitor');
const app = express();
const port = 3999;


app.get("/", (req, res) => {
    res.send('Hello, Dockerode!')
});

// monitor.buildImage();


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})