// 모듈을 읽어 들입니다.
const request = require('request')
require('dotenv').config(); 
// 요청을 위한 상수를 선언합니다: TOKEN은 자신의 것을 입력해주세요.
const TARGET_URL = process.env.LINE_TARGET_URL || lineTargetUrl;
const TOKEN = process.env.LINE_TOKEN || lineToken;
// 요청합니다.

function lineSend( message ) {
    request.post({
    url: TARGET_URL,
    headers: {
        'Authorization': `Bearer ${TOKEN}`
    },
    form: {
        message: `${message}`
    }
    }, (error, response, body) => {
    if (error) console.log('lineSend',error);
    // 요청 완료
    console.log(body)
    })
}

module.exports.lineSend = lineSend;

