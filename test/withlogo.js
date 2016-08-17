var  fs = require('fs'),
    qrCodeLogo = require('../index');

qrCodeLogo('https://www.baidu.com/', '/Users/fisher/myworkspace/test_qr_logo.png', {
    size: 10,
    logo:  fs.readFileSync('/Users/fisher/myworkspace/test.png', {
        encoding: null
    })
}, function (err, img) {
    console.log(err, img);
});


qrCodeLogo('https://www.baidu.com/', '/Users/fisher/myworkspace/test_qr_logo1.png', {
    size: 10,
    logo:  fs.readFileSync('/Users/fisher/myworkspace/test3.png', {
        encoding: null
    })
}, function (err, img) {
    console.log(err, img);
});

qrCodeLogo('https://www.baidu.com/', '/Users/fisher/myworkspace/test_qr.png', function (err, img) {
    console.log(err, img);
});