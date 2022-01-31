const config = {
  tokenApiUrl: 'http://localhost:3000/',
};

async function getImage(x, y) {
  return fetch(`${config.tokenApiUrl}getImage?x=${x}&y=${y}`).then(res => res.json()).then(resp => { 
    console.log(resp);
    return resp.image;
  });
}