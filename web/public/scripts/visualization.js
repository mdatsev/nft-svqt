$(() => {
    const ctx = document.getElementById("world").getContext('2d');
    var img = new Image;
    img.onload = function(){
        ctx.drawImage(img,0,0);
    };
    img.src = 'images/world.jpg';
});