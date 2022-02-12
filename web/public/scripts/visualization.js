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

const imageUrls = [];
const owners = [];

async function GetWorld() {    
    const values = await getImages(0, worldSize, 0, worldSize);
    const tiles = [];
    for (let i = 0; i < worldSize; i++) {
        tiles.push([]);
        for (let j = 0; j < worldSize; j++) {
            const link = values[0][i*worldSize + j] ? values[0][i*worldSize + j] : 'images/tile.jpg';
            owners.push(values[1][i*worldSize + j]);
            imageUrls.push(link);
            tiles[i].push(makeImage(link));
        }
    }

    return tiles;
}

$(async () => {
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext('2d');
    const tiles = await GetWorld();

    ctx.canvas.width  = window.innerWidth * 0.5;
    ctx.canvas.height = window.innerHeight - 100;

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

        x -= deltaX;
        y -= deltaY;

        x = parseInt(x / 100);
        y = parseInt(y / 100);
        
        $('#parcel-x').text(x);
        $('#parcel-y').text(y);

        const tile = imageUrls[x*worldSize + y];
        const owner = owners[x*worldSize + y];

        if (owner != '0x0000000000000000000000000000000000000000') {
            $('#parcel-new-link').show();
            $('#modal-submit-btn').show();
            $('#modal-mint-btn').hide();
            $('#owner-addr').text(owner);
        } else {
            $('#parcel-new-link').hide();
            $('#modal-submit-btn').hide();
            $('#modal-mint-btn').show();
        }

        $('#parcel-img').attr('src', tile);
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

    document.addEventListener('contextmenu', event => event.preventDefault());
    $('#modal-submit-btn').on('click', async function() {
        await setImage(x, y, $('#parcel-new-link-input').val());
    });
    $('#modal-mint-btn').on('click', async function() {
        await mint(x, y);
    });
    redraw();
});