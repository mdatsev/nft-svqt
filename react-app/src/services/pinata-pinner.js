//imports needed for this function

//import fetch, { FormData, fileFromSync } from 'node-fetch';
//import path from 'path';

const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
// const url = `https://requestbin.io/1ez5gkz1`;

export async function pinFile(image, name) {
  //we gather the files from a local directory in this example, but a valid readStream is all that's needed for each file in the directory.

  let formData = new FormData();
  formData.append('file', image, `${name}`);

  const metadata = JSON.stringify({
    name
  });
  formData.append('pinataMetadata', metadata);

  // console.log([...formData.entries()]);

  console.log(`Sending ${name}`);
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      pinata_api_key: '88a179b316e37d9a4d08',
      pinata_secret_api_key: 'a7de43296bd643c9795764ae20a3414f326fc602641e22b096b2c535d6b59262'
    }
  });

  if (response.status == 200) {
    const hashResponse = await response.json();
    console.log(`[] ${hashResponse.IpfsHash}`);

    return hashResponse.IpfsHash;
  } else {
    console.log(await response.text());
    throw new Error(`Pin failed for ${name}`);
  }
}
//pinFile(fileFromSync(path.join(__dirname, 'download.jpeg')), 'test');
/*for (let i = 0; i < 20; i++) {
  const name = `images-${i * 50000 + 1}-${(i + 1) * 50000}`;
  const dirName = `E:\\chains-images-split\\${name}`;
  await pinDir(dirName, name, i);
}*/

// pinDir('E:\\test\\t1', 'testdir1111')

// 0: QmVigbSEfr7mYFf3P2L5vFVixQ6gb9oCGEVFu9vuaWzWPy
// 1: QmZAcSrjdnvzaDJLRN8v7THhmkPiGozkJj7tsTEGHE4zc5