$(async () => {
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext('2d');
    const worldSize = 5;
    const imgSize = 100;
    // const tiles = GetWorld();

    ctx.canvas.width  = window.innerWidth - 200;
    ctx.canvas.height = window.innerHeight - 50;

    let lastX, lastY, dragStart;

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
        dragStart = {x: lastX, y: lastY};
        dragged = false;
    },false);

    canvas.addEventListener('mousemove',function(evt){
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        if (dragStart) {
            ctx.translate(lastX-dragStart.x,lastY-dragStart.y);
            redraw();
        }
    },false);

    canvas.addEventListener('mouseup',function(evt){
        dragStart = null;
    },false);

    redraw();
});