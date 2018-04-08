var _ = require('underscore'),
    gd = require('node-gd'),
    qrImage = require('qr-image'),
    path = require('path');

/**
 * [exports description]
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-08-18T11:48:06+0800
 * @param    {[type]}                           text    [description]
 * @param    {[type]}                           outpath [description]
 * @param    {[type]}                           options [description]
 * @param    {Function}                         cb      [description]
 * @return   {[type]}                                   [description]
 */
module.exports = function (text, outpath, options, cb) {

    if ('function' === typeof qrOpts) {
        cb = qrOpts;
        qrOpts = {};
    }

    options = options || {};

    if (!text) {
        throw Error('text is required!');
    }

    // 处理text长度过短导致识别二维码失效的问题
    _.times(80 - text.length, function() {
        text += ' ';
    });

    if (!outpath) {
        throw Error('outpath is required!');
    }

    options = _.extend({
        size: 10,
        // ec_level: 'H', // One of L, M, Q, H
        // type: 'png',    //png (default), svg, pdf and eps.
        margin: 4, // white space around QR image in modules. Default 4 for png and 1 for others.
        // customize: null, // (only png) — function to customize qr bitmap before encoding to PNG.
        parse_url: true,  // (experimental, default false) — try to optimize QR-code for URLs.
        logo: null
    }, options);

    // 写死生成的图片类型
    options.type = 'png';
    // 不设置容错级别为'H'，二维码无法识别
    options.ec_level = 'H';

    // logo边框配置
    options.logoBorder = _.extend({
        width: 0,           // 边框宽度
        radius: 10,         // 给logo添加圆角
        color: 0xffffff     // 边框颜色
    }, options.logoBorder || {});

    // 底部文本框配置
    options.bottomText = _.extend({
        height: 45,         // 文本框高度
        align: 'center',    // 文本对齐方式
        size: 25,           // 文本字体大小
        angle: 0,           // 旋转角度
        color: 0x000000,    // 文本颜色
        bgColor: 0xffffff,  // 文本框背景色 ,
        fontFilePath: null  // 文本对应字体ttf文件路径。默认为楷体（gb-2312）
    }, options.bottomText || {});

    var qrImageBuffer,
        gdLogoImage,
        gdQrImage;

    // 生成二维码图片buffer
    qrImageBuffer = qrImage.imageSync(text, options);

    // 由图片buffer创建二维码画布
    gdQrImage = gd.createFromPngPtr(qrImageBuffer);

    // 添加logo
    if(options.logo){
        gdLogoImage = gd.createFromPngPtr(options.logo);
        if (!gdLogoImage) {
            gdLogoImage = gd.createFromJpegPtr(options.logo);
        }

        // 添加logo的border
        if (options.logoBorder && options.logoBorder.width != undefined) {
            gdLogoImage = borderImage(gdLogoImage, options.logoBorder.radius, options.logoBorder.width, options.logoBorder.color);
        }

        addLogoImage(gdQrImage, gdLogoImage); 
    }

    // 添中底部文本
    if (options.bottomText && options.bottomText.text) {
        gdQrImage = addBottomText(gdQrImage, options.bottomText, options.size, options.margin);
    }

    // 保存图片
    gdQrImage.savePng(outpath, function(err, img) {
        if (err) {
            console.error(err);
            if (cb) {
                cb(err, null);
            }
            return;
        }

        if (cb) {
            cb(null, gdQrImage);
        }

        if (gdLogoImage) {
            gdLogoImage.destroy();
        }
        gdQrImage.destroy();
    });
};

/**
 * 给图片中间添加Logo
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-08-18T11:27:52+0800
 * @param    {[type]}                           img     [description]
 * @param    {[type]}                           logoImg [description]
 */
var addLogoImage = function(img, logoImg) {
    var imgWidth,
        imgHeight,
        logoImgWidth,
        logoImgHeight;

    imgWidth = img.width;
    imgHeight = img.height;
    logoImgWidth = logoImg.width;
    logoImgHeight = logoImg.height;
    
    logoQrWidth = parseInt(imgWidth / 5);
    scale = logoImgWidth / logoQrWidth;
    logoQrHeight = parseInt(logoImgHeight / scale);
    
    // 取目标图像的2/5大小作为logo填充大小在图像的2/5处填充，保证logo处于图像中间
    logoImg.copyResampled(img,
        parseInt(imgWidth * 2 / 5), parseInt(imgHeight * 2 / 5),
        0, 0,
        logoQrWidth, logoQrHeight,
        logoImgWidth, logoImgHeight);
};


/**
 * 给图片添加圆角边框
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-08-16T16:42:44+0800
 * @param    {[type]}                           img          [description]
 * @param    {[type]}                           borderRadius [description]
 * @param    {[type]}                           borderWidth  [description]
 * @param    {[type]}                           borderColor  [description]
 * @return   {[type]}                                        [description]
 */
var borderImage = function(img, borderRadius, borderWidth, borderColor) {
    var imgW = img.width,
        imgH = img.height;

    // 创建画布
    var borderImg = gd.createTrueColorSync(imgW + borderWidth * 2, imgH + borderWidth * 2);

    // 填充背景色作为边框色
    // borderImg.fill(0, 0, 0xffffff); // 白色
    borderImg.fill(0, 0, borderColor);

    // 画白色背景距形以用于填充logo
    var colorRect = borderImg.colorAllocate(255, 255, 255);
    borderImg.filledRectangle(borderWidth, borderWidth, borderWidth + imgW, borderWidth + imgH, colorRect);
    // 设置距形透明
    // borderImg.colorTransparent(colorRect);

    // 将图片添加到画布(添加到(borderWidth, borderHeight)位置)
    img.copyResampled(borderImg,
            parseInt(borderWidth), parseInt(borderWidth),
            0, 0,
            imgW, imgH,
            imgW, imgH);

    // 左上角圆孤
    var tl_arc_img = getArcImg(borderRadius, borderColor, 1);
    tl_arc_img.copyMerge(borderImg, 0, 0, 0, 0, borderRadius, borderRadius, 100);
    tl_arc_img.destroy();

    // 右上角圆孤 
    var tr_arc_img = getArcImg(borderRadius, borderColor, 2);
    tr_arc_img.copyMerge(borderImg, borderImg.width - borderRadius, 0, 0, 0, borderRadius, borderRadius, 100);
    tr_arc_img.destroy();

    // 右下角圆孤 
    var rb_arc_img = getArcImg(borderRadius, borderColor, 3);
    rb_arc_img.copyMerge(borderImg, borderImg.width - borderRadius, borderImg.height - borderRadius, 0, 0, borderRadius, borderRadius, 100);
    rb_arc_img.destroy();

    // 左下角圆孤 
    var lb_arc_img = getArcImg(borderRadius, borderColor, 4);
    lb_arc_img.copyMerge(borderImg, 0, borderImg.height - borderRadius, 0, 0, borderRadius, borderRadius, 100);
    lb_arc_img.destroy();

    return borderImg;
};

/**
 * 获取半孤图片
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-08-17T15:14:42+0800
 * @param    {[type]}                           size      [description]
 * @param    {[type]}                           bgColor   [description]
 * @param    {[type]}                           direction 孤方向： 1-左上；2-右上；3-右下；4-左下
 * @return   {[type]}                                     [description]
 */
var getArcImg = function (size, bgColor, direction) {
    var arcImg = gd.createTrueColorSync(size, size),
        colorArc = arcImg.colorAllocate(0, 0, 0),
        point = [],
        start = 0,
        end = 0;

    switch (direction) {
        //左上
        case 1:
            point = [size, size];
            start = 180;
            end = 270;
            break;

        // 右上
        case 2:
            point = [0, size];
            start = 270;
            end = 360;
            break;

        // 右下
        case 3:
            point = [0, 0];
            start = 0;
            end = 90;
            break;

        // 左下
        case 4:
            point = [size, 0];
            start = 90;
            end = 180;
            break;
    }

    //圆孤画布颜色填充
    arcImg.fill(0, 0, bgColor);
    
    // 画孤（左上角）
    arcImg.filledArc(point[0], point[1], size * 2, size * 2, start, end, colorArc, 0);
    // 设置圆孤透明
    arcImg.colorTransparent(colorArc);

    return arcImg;
};

/**
 * 给图片添加底部文本
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-08-18T11:27:23+0800
 * @param    {[type]}                           img            [description]
 * @param    {[type]}                           options        [description]
 * @param    {[type]}                           baseModuleSize [description]
 * @param    {[type]}                           marginModules  [description]
 */
var addBottomText = function(img, options, baseModuleSize, marginModules) {
    var textHeight = options.height || (options.size + 20),
        textImg = gd.createTrueColorSync(img.width, img.height + textHeight),
        fontFilePath = options.fontFilePath || path.resolve(__dirname, './fonts/kai_gb2312.ttf'),
        textX = 0;

    // 左对齐
    if (options.align === 'left') {
        textX = baseModuleSize * marginModules;

    // 右对齐
    } else if (options.align === 'right') {
        textX = img.width - options.text.length * options.size - baseModuleSize * marginModules;
    // 居中
    } else{
        textX = parseInt((img.width - options.text.length * options.size) / 2);
    }

    textImg.fill(0, 0, options.bgColor);

    img.copyResampled(textImg,
            0, 0,
            0, 0,
            img.width, img.height,
            img.width, img.height);
    textImg.stringFT(options.color, fontFilePath, options.size, options.angle, textX, textImg.height - parseInt((textHeight - options.size) / 2), options.text, false);

    return textImg;
};