const worldSize = 10;
const imgSize = 100;

function makeImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function GetWorld() {
    const tiles = [];
    const promises = [];

    for (let i = 0; i < worldSize; i++) {
        
        for (let j = 0; j < worldSize; j++) {
            const promise = getImage(i + 1, j + 1);
            promises.push(promise);
            
        }
    }
    
    const values = await Promise.all(promises);
    
    for (let i = 0; i < worldSize; i++) {
        tiles.push([]);
        for (let j = 0; j < worldSize; j++) {
            const link = values[i*worldSize + j] ? values[i*worldSize + j] : 'images/tile.jpg';

            tiles[i].push(makeImage(link));
        }
    }

    return tiles;
}

$(async () => {
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext('2d');
    const tiles = await GetWorld();

    ctx.canvas.width  = window.innerWidth - 200;
    ctx.canvas.height = window.innerHeight - 50;

    const boundaryX = worldSize*imgSize - ctx.canvas.width;
    const boundaryY = worldSize*imgSize - ctx.canvas.height;
    let lastX = 0, lastY = 0, dragStart;
    let deltaX = 0;
    let deltaY = 0;

    async function redraw() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();

        for (let i = 0; i < worldSize; i++) {
            for (let j = 0; j < worldSize; j++) {
                ctx.drawImage(await tiles[i][j],imgSize*i,imgSize*j,imgSize,imgSize); 
            }
        }
    }

    canvas.addEventListener('mousedown',function(evt){
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = true;
    },false);

    canvas.addEventListener('mousemove',function(evt){
        currentX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        currentY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        if (dragStart) {
            let dx = currentX - lastX;
            let dy = currentY - lastY;

            if (deltaX + dx > 0 || deltaX + dx < -boundaryX) {
                dx = 0;
            }
            if (deltaY + dy > 0 || deltaY + dy < -boundaryY) {
                dy = 0;
            }

            ctx.translate(dx, dy);
            deltaX += dx;
            deltaY += dy;
            redraw();
        }

        lastX = currentX;
        lastY = currentY;
    },false);

    canvas.addEventListener('mouseup',function(evt){
        dragStart = false;
    },false);
    canvas.addEventListener('mouseleave',function(evt){
        dragStart = false;
    },false);

    canvas.addEventListener('contextmenu', async function(evt){
        x = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        y = evt.offsetY || (evt.pageY - canvas.offsetTop);

        x = parseInt(x / 100) + 1;
        y = parseInt(y / 100) + 1;
        
        $('#parcel-x').text(x);
        $('#parcel-y').text(y);

        let img = await getImage(x, y);

        if (img) {
            $('#modal-submit-btn').text('Upload new image');
            $('#parcel-new-link').show();
            $('#modal-submit-btn').on('click', async function() {
                console.log('upload new', x, y)
                await setImage(x, y, $('#parcel-new-link').val());
            });
        } else {
            img = 'images/tile.jpg';
            $('#modal-submit-btn').text('Mint parcel');
            $('#modal-submit-btn').on('click', async function() {
                console.log('minting', x, y)
                await mint(x, y);
            });
        }

        $('#parcel-img').attr('src', img);
        $("#tile-modal").modal();
    },false);

    /*canvas.addEventListener('mousewheel',function(evt){
        console.log(evt);
        const factor = 1 + 0.05*Math.sign(evt.wheelDelta);

        ctx.translate(lastX,lastY);
        ctx.scale(factor,factor);
        ctx.translate(-lastX,-lastY);
        redraw();
    },false);*/

    redraw();
});