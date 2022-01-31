$(async () => {
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext('2d');
    const worldSize = 15;
    const imgSize = 100;
    // const tiles = GetWorld();

    ctx.canvas.width  = window.innerWidth - 200;
    ctx.canvas.height = window.innerHeight - 50;

    const boundaryX = worldSize*imgSize - ctx.canvas.width;
    const boundaryY = worldSize*imgSize - ctx.canvas.height;
    let lastX, lastY, dragStart;
    let deltaX = 0;
    let deltaY = 0;

    const img = await getImage('images/tile.jpg');

    function getImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    function redraw() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();

        for (let i = 0; i < worldSize; i++) {
            for (let j = 0; j < worldSize; j++) {
                ctx.drawImage(img,imgSize*i,imgSize*j,imgSize,imgSize); //tiles[i][j]    
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

    canvas.addEventListener('mousewheel',function(evt){
        console.log(evt);
        const factor = evt.wheelDelta/100;

        ctx.scale(factor,factor);
        redraw();
    },false);

    redraw();
});