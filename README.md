# qrcode-logo
基于node-gd图形处理库，用于生成带logo的二维码图片。


# 示例

##生成带logo的二维码
```javascript
var fs = require('fs'),
    qrCodeLogo = require('../index');

qrCodeLogo('https://www.baidu.com/', '/Users/test/myworkspace/_qr_logo.png', {
    size: 10,  // 二维码大小
    logo:  fs.readFileSync('/Users/test/myworkspace/logo.png', {
        encoding: null
    })
}, function (err, img) {
    // 回调函数，在生成图片文件后执行
    // img为生成图片的属性字典（包启大小，色值等信息）
    console.log(err, img);
});
```


##仅生成二维码图片
```javascript
var fs = require('fs'),
    qrCodeLogo = require('../index');

qrCodeLogo('https://www.baidu.com/', '/Users/fisher/myworkspace/test_qr.png', function (err, img) {
    console.log(err, img);
});
```

#API

##调用方式
qrcode(text, outpath, qrOpts, cb) 或 qrcode(text, outpath, cb)

##参数
###text
(String)生成二维码的文本、url

###outpath
(String）生成的二维码的文件路径

###cb
生成二维码图片文件回调方法: function (err, img) {
    // err 错误认息
    // img  生成的二维码图片信息（高度、宽度、色值等）
}

###qrOpts.size
(Number)二维码图片大小，默认值为10（pixel)

###qrOpts.parse_url
(Boolean)是否优化处理text为url的情况， 默认为true

###qrOpts.logo
(Buffer) logo图片的buffer数据

###qrOpts.logoBorderWidth
(Number)边框大小，默认值为4(pixel)。
        
###qrOpts.logoBorderRadius
(Number)logo圆角大小, 默认值为20(pixel)。

###qrOpts.logoBorderColor
(Number)边框颜色，使用十六进制颜色值.





