"use strict";
onmessage = function(e) {
    var imgdatas = e.data;

    //转换对象数据
    var pointDatas = [];
    for (var i = 0, len = imgdatas.length; i < len; i += 4) {
        if (imgdatas[i + 3] == 0) {
            pointDatas.push("");
        } else {
            pointDatas.push({
                r: imgdatas[i],
                g: imgdatas[i + 1],
                b: imgdatas[i + 2]
            });
        }
    }

    postMessage(pointDatas);

    delete e.data;
    pointDatas = null;
};
