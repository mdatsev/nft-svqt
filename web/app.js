const path = require('path');
const express = require('express');

const { getImage, getImages } = require('./nft-api');

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {});
})

app.get('/getImage', async (req, res) => {
  const { x, y } = req.query;
  const image = await getImage(+x, +y);

  res.json({
    image
  });
});

app.get('/getImages', async (req, res) => {
  const { fromX, fromY, toX, toY } = req.query;
  const images = await getImages(fromX, toX, fromY, toY);

  res.json({
    images
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})