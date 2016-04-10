defer(function(require, respone) {
    "use strict";
    //歌词时间偏差
    var lyctimediff = 2;
    var tar_rang = this.data.tar_rang;
    //初始化歌词
    var initLrc = function(lrcstr) {
        //清除芜杂信息
        var nstr = lrcstr.replace(/\s/g, "");
        var nTimeArr = nstr.match(/\[.+?\]/g);
        var nStrArr = nstr.split(/\[.+?\]/g).filter(function(e) {
            if (e) {
                return e;
            }
        });
        nTimeArr.forEach(function(element, index) {
            var timestr = element.replace(/[\[\]]/g, "");
            var a = timestr.split(':');
        });
        // console.log(nTimeArr);
        //转换时间成秒
        nTimeArr = nTimeArr.map(function(e) {
            var a = e.replace(/[\[\]]/g, "");
            var t = a.split(':');
            var m = parseInt(t[0]);
            var s = parseFloat(t[1]);
            var j = s + m * 60;
            if (j == 0) {
                return j;
            }
            j += lyctimediff
            return j;
        });
        //添加个最后长度
        nTimeArr.push(1000000);
        // console.log(nTimeArr);
        // console.log(nStrArr);

        //返回获取歌词方法
        respone(function() {
            //获取进度帧数
            var r = parseInt(tar_rang.value);
            var playtime = r / 24;

            //返回的歌词
            var str;
            $.each(nTimeArr, function(i, e) {
                if (playtime < e) {
                    str = nStrArr[i - 1];
                    return false;
                }
            });

            return str;

            // return {
            //     r: r,
            //     time: playtime,
            //     str: str
            // };
        });
    };

    //歌词载入
    $.ajax({
            url: 'lrc.txt',
            type: 'GET'
        })
        .done(function(e) {
            // console.log(e);
            initLrc(e);
        })
        .fail(function(e) {
            console.log("error", e);
        });
});
