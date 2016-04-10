"use strict";
defer(function(require, respone) {
    var data = this.data;
    //目标图片
    var img = data.img;
    //旋转角度
    var deg = data.size.rotate;
    //主canvas
    var cans = data.cans;
    var cw = data.size.w;
    var ch = data.size.h;

    //转换线程
    var imgDataWorker = data.imgDataWorker;

    var ctx = cans.getContext('2d');
    var cwidth = cans.width,
        cheight = cans.height;

    //清空内容
    ctx.clearRect(0, 0, cwidth, cheight);

    // ctx.translate(cwidth / 2, cheight / 2);
    ctx.translate(cwidth / 2, cheight / 2);
    ctx.rotate(deg * Math.PI / 180);
    ctx.translate(-cwidth / 2, -cheight / 2);

    //保持居中渲染
    ctx.drawImage(img, (cwidth - cw) / 2, (cheight - ch) / 2, cw, ch);

    //获取元数据
    var imgdatas = ctx.getImageData(0, 0, cwidth, cheight).data;

    img.remove();

    imgDataWorker.postMessage(imgdatas);

    imgdatas = null;

    imgDataWorker.onmessage = function(e) {
        respone(e.data);
    };

});
