# qrcode-logo
基于node-gd图形处理库，用于生成带logo的二维码图片。


# 示例

##生成带logo的二维码
```javascript
var fs = require('fs'),
    qrCodeLogo = require('../index'),

    url = 'https://www.baidu.com/',
    qrcodeImgFilePath = '/Users/test/myworkspace/qr_logo.png',
    logoBuffer = fs.readFileSync('/Users/test/myworkspace/logo.png', {
        encoding: null
    });

qrCodeLogo(url, qrcodeImgFilePath, {
    size: 10,  // 二维码大小
    logo: logoBuffer // logo数据
});
```


##仅生成二维码图片
```javascript
var fs = require('fs'),
    qrCodeLogo = require('../index'),

    url = 'https://www.baidu.com/',
    qrcodeImgFilePath = '/Users/test/myworkspace/qr.png';

qrCodeLogo(url, qrcodeImgFilePath, function (err, img) {
    console.log(err, img); // img为生成二维码图片信息（包含高度、宽度等信息）
});
```

#API

##调用方式
qrcode(text, outpath, qrOpts, cb) 或 qrcode(text, outpath, cb)

##参数
###text（必填）
(String)生成二维码的文本、url。

###outpath（必填）
(String）生成的二维码图片的文件路径。

###cb（可选）
生成二维码图片文件回调方法: function (err, img) {
    // err 错误认息
    // img  生成的二维码图片信息（高度、宽度、色值等）
}

###qrOpts.size（可选）
(Number)二维码图片大小，默认值为10（pixel)

###qrOpts.parse_url（可选）
(Boolean)是否优化处理text为url的情况， 默认为true

###qrOpts.logo（可选）
(Buffer) logo图片的buffer数据

###qrOpts.logoBorderWidth（可选）
(Number)边框大小，默认值为4(pixel)。
        
###qrOpts.logoBorderRadius（可选）
(Number)logo圆角大小, 默认值为20(pixel)。

###qrOpts.logoBorderColor（可选）
(Number)边框颜色，使用十六进制颜色值.





