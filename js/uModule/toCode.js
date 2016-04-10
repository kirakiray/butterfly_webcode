"use strict";
defer(function(require, respone) {
    //获取图片数据
    var imgdata = this.data.imgdata;
    //歌词
    var lyc = this.data.lyc;

    var toCodeWorker = this.data.toCodeWorker;

    toCodeWorker.onmessage = function(e) {
        var data = e.data;
        respone(data);
    };

    toCodeWorker.postMessage({
        imgdata: imgdata,
        lyc: lyc
    });

    imgdata = null;
});
