const config = {
  tokenApiUrl: 'localhost:3000/',
};

async function getImage(x, y) {
  return fetch(`${config.signerServiceUrl}getImage?x=${x}&y=${y}`).then(res => res.json()).then(resp => { 
    console.log(resp);
    return resp.image;
  });
}