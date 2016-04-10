"use strict";
onmessage = function(e) {
    var data = e.data;
    var imgdata = data.imgdata;
    var lyc = data.lyc;


    var lyclen = lyc.length;

    //歌词计数
    var lycid = 0;

    //输出字符串
    var codestr = '',
        //点单元数据
        pointData;

    for (var len = imgdata.length, i = 0; i < len; i++) {
        pointData = imgdata[i];
        if (pointData.r <= 250 || pointData.g <= 250 || pointData.b <= 250) {
            codestr += '<span style="color:rgb(' + pointData.r + ',' + pointData.g + ',' + pointData.b + ')">' + lyc[lycid] + '</span>';
            lycid++;
            if (lycid >= lyclen) {
                lycid = 0;
            }
        } else {
            codestr += '<span></span>';
        }
    }

    postMessage(codestr);

    delete e.data;
    codestr = null;
};
