var _ = require('underscore'),
    gd = require('node-gd'),
    qrImage = require('qr-image');

module.exports = function (text, outpath, qrOpts, cb) {

    if ('function' === typeof qrOpts) {
        cb = qrOpts;
        qrOpts = {};
    }

    options = qrOpts || {};

    if (!text) {
        throw Error('text is required!');
    }

    if (!outpath) {
        throw Error('outpath is required!');
    }

    options = _.extend({
        size: 10,
        // ec_level: 'H', // One of L, M, Q, H
        // type: 'png',    //png (default), svg, pdf and eps.
        // margin: null, // white space around QR image in modules. Default 4 for png and 1 for others.
        // customize: null, // (only png) — function to customize qr bitmap before encoding to PNG.
        parse_url: true,  // (experimental, default false) — try to optimize QR-code for URLs.
        logo: null,
        logoBorderWidth: 4,    // 加边框
        logoBorderRadius: 20, // 给logo添加圆角
        logoBorderColor: gd.trueColorAlpha(255, 255, 255, 10)

    }, options);

    // 写死生成的图片类型
    options.type = 'png';
    // 不设置容错级别为'H'，二维码无法识别
    options.ec_level = 'H';

    var qrImageBuffer,
        gdLogoImage,
        gdQrImage;

    // 生成二维码图片buffer
    qrImageBuffer = qrImage.imageSync(text, options);

    // 由图片buffer创建二维码画布
    gdQrImage = gd.createFromPngPtr(qrImageBuffer);

    if(options.logo){
        var gdQrImageWidth,
            gdQrImageHeight,
            gdLogoImageWidth,
            gdLogoImageHeight;

        gdLogoImage = gd.createFromPngPtr(options.logo);

        gdLogoImage = borderImage(gdLogoImage, options.logoBorderRadius, options.logoBorderWidth, options.logoBorderColor);

        gdQrImageWidth = gdQrImage.width;
        gdQrImageHeight = gdQrImage.height;
        
        gdLogoImageWidth = gdLogoImage.width;
        gdLogoImageHeight = gdLogoImage.height;
        
        logoQrWidth = parseInt(gdQrImageWidth / 3);
        scale = gdLogoImageWidth / logoQrWidth;
        logoQrHeight = parseInt(gdLogoImageHeight / scale);
        
        // 取目标图像的1/3大小作为logo填充大小在图像的1/3处填充，保证logo处于图像中间
        gdLogoImage.copyResampled(gdQrImage,
            parseInt(gdQrImageWidth / 3), parseInt(gdQrImageHeight / 3),
            0, 0,
            logoQrWidth, logoQrHeight,
            gdLogoImageWidth, gdLogoImageHeight);
            
        
    }

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