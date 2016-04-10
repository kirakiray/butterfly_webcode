defer(function(require, respone) {
    var options = this.data;
    var defaults = {
        //视频源的宽
        width: 128,
        //视频源的高
        height: 72,
        // 模拟单个像素的大小（字体大小）
        point: 10
    };
    $.extend(defaults, options);
    var point = defaults.point;

    //绝对居上位置
    var top = -370;
    var left = -100;

    //计算长方体最大高度
    var maxLong = Math.sqrt(Math.pow(defaults.width, 2) + Math.pow(defaults.height, 2));
    maxLong = Math.ceil(maxLong);

    //获取窗体大小
    var uwid = $(window).width(),
        uhei = $(window).height();

    left += (uwid - 1280) / 2;
    top += (uhei - 720) / 2;

    //初始化样式
    var mainStyle = $('<style />');
    mainStyle.html('.vcode_container{width: ' + maxLong * point + 'px;height: ' + maxLong * point + 'px;line-height: ' + point + 'px;top:' + top + 'px;left:' + left + 'px;} .vcode_container span{display: inline-block;float: left;height: ' + point + 'px;width: ' + point + 'px;font-size: ' + point + 'px;}');
    $('head').append(mainStyle);

    var tools = $('.tools');

    //工具条定位
    tools.css({
        top: uhei / 2 + 720 / 2 + 30 + "px",
        left: (uwid - tools.width()) / 2 + "px"
    });

    //设置html
    var canvasElement = $('<canvas width="' + maxLong + '" height="' + maxLong + '" />')[0];
    var vcode_container = $('<div class="vcode_container"></div>');
    playstate = 'initCanvas';
    // conEvent.trigger('initCanvas');
    $('body').append(vcode_container);
    respone(canvasElement);
});
