"use strict";
defer(function(require, respone) {
    var imgurl = this.data;

    var img = document.createElement('img');
    img.onload = function() {
        respone(img);
    };
    img.src = imgurl;
});