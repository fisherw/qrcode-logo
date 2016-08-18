var  fs = require('fs'),
    qrCodeLogo = require('../index');

qrCodeLogo('http://www.baidu.com', '/Users/fisher/myworkspace/test_qr_logo.png', {
    size: 10,
    margin: 2,
    logo:  fs.readFileSync('/Users/fisher/myworkspace/testa.png', {
        encoding: null
    }),
    logoBorder: {
        width: 20,
        radius: 100,
        color: 0xcccfff
    },
    bottomText: {
        text: '            text string',
        bgColor: 0xeeefff
    }
}, function (err, img) {
    console.log(err, img);
});

qrCodeLogo('http://www.baidu.com', '/Users/fisher/myworkspace/test_qr_logo1.png', {
    size: 10,
    margin: 2,
    logo:  fs.readFileSync('/Users/fisher/myworkspace/testa.png', {
        encoding: null
    }),
    logoBorder: {
        width: 0,
        radius: 100,
        color: 0xeeefff
    },
    bottomText: {
        text: '            text string',
        bgColor: 0xeeefff
    }
}, function (err, img) {
    console.log(err, img);
});


qrCodeLogo('http://www.baidu.com', '/Users/fisher/myworkspace/test_qr_logo2.png', {
    size: 10,
    logo:  fs.readFileSync('/Users/fisher/myworkspace/test3.png', {
        encoding: null
    })
}, function (err, img) {
    console.log(err, img);
});

qrCodeLogo('http://www.baidu.com', '/Users/fisher/myworkspace/test_qr.png', function (err, img) {
    console.log(err, img);
});