(() => {
    "use strict";
    sr.config({
        baseUrl: "js"
    });

    //主体事件监控对象
    var conEvent = $({});

    //当前播放状态
    var playstate;

    //canvas元素
    var canvasElement;

    //缓存最大数
    var cacheMax = 6;
    //缓存最小数（再次启动缓存数）
    var cacheMin = 3;

    //进度元素
    var tar_rang = $('#tar_rang')[0];
    var show_num = $('#show_num');

    //获取歌词方法
    var getLrc;

    //初始化canvas
    require('task/initCanvas')
        .post({
            width: 128,
            height: 72,
            point: 10
        })
        .done(function(cans) {
            canvasElement = cans;
        })
        //初始化歌词函数
        .require('task/initLrc')
        .post({
            tar_rang: tar_rang
        })
        .done(function(glrc) {
            getLrc = glrc;
            //可以播放了
            $('#play').removeAttr('disabled');
        });

    //图片数组
    var imgArr = [];

    //图片数组载入所有完成
    var imgArrEnd = false;

    //缓存图片方法
    var cacheImg = (id, callback) => {
        if (playstate == 'pause') {
            //暂停则返回
            return;
        }
        //修正图片名
        var imgurl = 'source_jpg/';
        switch (String(id).length) {
            case 1:
                imgurl += 's_000' + +id + '.jpg';
                break;
            case 2:
                imgurl += 's_00' + +id + '.jpg';
                break;
            case 3:
                imgurl += 's_0' + +id + '.jpg';
                break;
            case 4:
                imgurl += 's_' + +id + '.jpg';
                break;
        }
        require('uModule/loadImg')
            .post(imgurl)
            .done(function(img) {
                imgArr.push(img);
                callback && callback();
            });
    };

    //选取范围加载图片
    var cacheImgBy = (min, max, onecall, allcall) => {
        //设置开始播放
        playstate = 'playing';
        var id = min;
        var cfun = () => {
            if (id <= max) {
                cacheImg(id, () => {
                    onecall && onecall();
                    conEvent.trigger('cacheImgOneDone');
                    id++;
                    if (imgArr.length < cacheMax) {
                        cfun();
                    } else {
                        var dfun = function() {
                            if (imgArr.length <= cacheMin) {
                                conEvent.unbind('transPointDatasDone', dfun);
                                cfun();
                            }
                        };
                        conEvent.bind('transPointDatasDone', dfun);
                    }
                });
            } else {
                imgArrEnd = true;
                allcall && allcall();
                conEvent.trigger('cacheImgOneEnd');
            }
        };
        //点火
        cfun();
    };

    //转换点数据后的数组
    var pointdataArr = [];

    var pointdataArrEnd = false;

    //图片转换点数据线程
    var imgDataWorder = new Worker('js/work/toPointDataWorker.js');

    //转换数据线程是否可以继续状态
    var transPointDatasOK = true;

    //差值角度
    var diffdeg = 0;

    //转换图片点数据
    var transPointDatas = () => {
        if (playstate == 'pause') {
            //暂停则返回
            return;
        }
        //判断是否空闲状态
        if (transPointDatasOK) {
            transPointDatasOK = false;
            require('uModule/getImgData')
                .post({
                    img: imgArr.shift(),
                    cans: canvasElement,
                    size: {
                        w: 128,
                        h: 72,
                        rotate: 15.2
                    },
                    imgDataWorker: imgDataWorder
                })
                .done(function(pointData) {
                    transPointDatasOK = true;
                    conEvent.trigger('transPointDatasDone');
                    pointdataArr.push(pointData);

                    //增加转化角度
                    diffdeg += 15.2;

                    //判断是否终结
                    if (!imgArr.length && imgArrEnd) {
                        //图片转换进程结束
                        pointdataArrEnd = true;
                        imgDataWorder.terminate();
                        conEvent.trigger('transPointDatasEnd');
                    }

                    //判断是否有待处理的，有就继续处理
                    if (imgArr.length) {
                        //小于最大值可以执行
                        if (pointdataArr.length < cacheMax) {
                            transPointDatas();
                        } else {
                            var dfun = function() {
                                if (pointdataArr.length < cacheMin) {
                                    conEvent.unbind('transToCodeDone', dfun);
                                    transPointDatas();
                                }
                            };
                            conEvent.bind('transToCodeDone', dfun);
                        }
                    }

                    //执行转换html线程
                    transToCode();
                });
        }
    };

    // 是否可使用html线程
    var transToCodeOK = true;

    //转换成html线程
    var toCodeWorkder = new Worker('js/work/toCodeWorker.js');

    //旋转图片角度
    var totaldeg = 0;

    //转换html是否终结
    var transToCodeEnd = false;

    //转换成html
    var transToCode = () => {
        if (playstate == 'pause') {
            //暂停则返回
            return;
        }
        //判断是否空闲状态
        if (transToCodeOK) {
            transToCodeOK = false;
            totaldeg += 15.2;
            require('uModule/toCode')
                .post({
                    imgdata: pointdataArr.shift(),
                    lyc: getLrc(),
                    toCodeWorker: toCodeWorkder
                })
                .done(function(codestr) {
                    transToCodeOK = true;
                    conEvent.trigger('transToCodeDone');
                    if (totaldeg > 360) {
                        totaldeg -= 360;
                    }
                    diffdeg -= 15.2;
                    $('.vcode_container').empty().append(codestr).css('transform', 'rotate(-' + totaldeg + 'deg)');
                    show_num.text(tar_rang.value);
                    tar_rang.value = parseInt(tar_rang.value) + 1;

                    //判断是否终结
                    if (!pointdataArr.length && pointdataArrEnd) {
                        transToCodeEnd = true;
                        toCodeWorkder.terminate();
                        conEvent.trigger('transToCodeEnd');
                    }

                    //判断是否有待处理的，有就继续处理
                    if (pointdataArr.length) {
                        transToCode();
                    }
                });
        }
    };

    //按钮逻辑
    $('#play').click(function(e) {
        //清空内容
        totaldeg += diffdeg;
        diffdeg = 0;
        imgArr = [];
        pointdataArr = [];
        conEvent.unbind('transPointDatasDone');
        conEvent.unbind('transToCodeDone');
        //点火
        cacheImgBy(tar_rang.value, 2135, transPointDatas);
        $('#pause').removeAttr('disabled');
        $('#play').attr('disabled', 'disabled');
        $('head').append('<style id="noselect">body{-webkit-user-select: none;user-select: none;}</style>');
        $(tar_rang).attr('disabled', 'disabled');
    });
    $('#pause').click(function(e) {
        playstate = 'pause';
        $('#play').removeAttr('disabled');
        $('#pause').attr('disabled', 'disabled');
        $('#noselect').remove();
        $(tar_rang).removeAttr('disabled');
    });

    //播放完毕
    conEvent.one('transToCodeEnd', function() {
        $('#noselect').remove();
    });
})();
