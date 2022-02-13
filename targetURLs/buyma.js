const puppeteer = require('puppeteer');
const { lineSend } = require('../util/sns');
const path = require('path');
let fs = require('fs');

// insert data in buyma
async function buyma(row) {
    
    const id = process.env.BUYMA_ID || buymaId;
    const password = process.env.BUYMA_PASSWORD || buymaPassword;
    let array1 = [];//색 나누기
    let array2 = [];//색 나누기
    let imagePathArray = []; // 이미지 path 격납
    let browser = {};
    let page = {};

    try {
        browser = await puppeteer.launch({
        headless: true,
        args: [
            // '--window-size=1920,1180',
            // '--disable-notifications',
            // "--proxy-server=157.90.137.189:3128",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
        // slowMo : 1 ,
        userDataDir: path.join(__dirname, '../UserData') // 로그인 정보 쿠키 저장
    });
    page = await browser.newPage();
    // await page.setViewport({
    //     width: 1580,
    //     height: 980,
    // });
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.buyma.com/my/sell/new?tab=b');

    // 로그인 작업 건너뛰기
    if (await page.$('.user_name')) {
        console.log('이미 로그인 되어 있습니다.')
    } else {
        await page.evaluate((id,password) => {
            // login
            document.querySelector('#txtLoginId').value = id;
            document.querySelector('#txtLoginPass').value = password;
            document.querySelector('#login_do').click();
        }, id,password);
        console.log('로그인했습니다.')
    }

    //(商品名)
    await page.waitForSelector('.bmm-c-field__input input.bmm-c-text-field');
    await page.type('.bmm-c-field__input input.bmm-c-text-field',row.productName);

    //(商品コメント)
    await page.waitForSelector('#comment textarea.bmm-c-textarea');
    await page.type('#comment textarea.bmm-c-textarea',row.comment);

    //(カテゴリ1)
    await page.waitForSelector('#react-select-2--value .Select-placeholder');
    await page.click('#react-select-2--value .Select-placeholder');
    await page.waitForSelector(`div[aria-label="${row.category1}"]`);
    await page.click(`div[aria-label="${row.category1}"]`);

    //(カテゴリ2)
    // await page.waitForSelector('#react-select-10--value');
    // await page.click('#react-select-10--value .Select-placeholder');
    await page.waitForSelector('#react-select-12--value');
    await page.click('#react-select-12--value .Select-placeholder');
    await page.waitForSelector(`div[aria-label="${row.category2}"]`);
    await page.click(`div[aria-label="${row.category2}"]`);

    //(カテゴリ3)
    // await page.waitForSelector('#react-select-11--value');
    // await page.click('#react-select-11--value .Select-placeholder');
    await page.waitForSelector('#react-select-13--value');
    await page.click('#react-select-13--value .Select-placeholder');
    await page.waitForSelector(`div[aria-label="${row.category3}"]`);
    await page.click(`div[aria-label="${row.category3}"]`);

    //(ブランド)
    await page.waitForSelector('input[placeholder="ブランド名を入力すると候補が表示されます"]');
    if (row.brand) {
        await page.type('input[placeholder="ブランド名を入力すると候補が表示されます"]',row.brand);
    }
    if (row.checkedBrand == "◯") await page.evaluate(() => { document.querySelector(".bmm-c-checkbox .bmm-c-checkbox__input").click();});
    //(シーズン)

    //(テーマ)

    //(色)
    await page.waitForSelector('#react-select-5--value-item');
    //색 나누기
    array1 = array01(row.color);
    for (let i = 0 ; i < array1.length ; i++) {
        if(array1[i]) {
            array2 = array02(array1[i]);
        //(色の系統) 클릭
        await page.click(`tbody tr:nth-child(${i+1}) td span div`);
        //(色の系統)
        await page.waitForSelector(`tbody tr:nth-child(${i+1}) .Select.is-open .Select-menu-outer .Select-menu div[aria-label="${array2[0]}"]`);
        await page.click(`tbody tr:nth-child(${i+1}) .Select.is-open .Select-menu-outer .Select-menu div[aria-label="${array2[0]}"]`);
        //(色名)
        await page.waitForSelector(`tbody tr:nth-child(${i+1}) td:nth-child(3) .bmm-c-text-field`);
        await page.type(`tbody tr:nth-child(${i+1}) td:nth-child(3) .bmm-c-text-field`,array2[1]);
        //(新しい色を追加)
        if(i < array1.length -1) await page.click('.bmm-c-form-table__foot a');
        }
    }

    // add 2021/8/11 (ブランド) 브랜드 입력란 포커스를 벗어나기 위해 여기서 실행
    if (row.brand) {
        await page.click('input[placeholder="ブランド名を入力すると候補が表示されます"]');
        await page.waitForTimeout(2000);
        await page.waitForSelector('.bmm-c-suggest__main');
        await page.click('.bmm-c-suggest__main');
    }

    //(サイズ)
    await page.waitForSelector('#react-tabs-2');
    await page.click('#react-tabs-2');
    await page.waitForSelector('#react-tabs-3 .Select-placeholder');
    await page.click('#react-tabs-3 .Select-placeholder');
    await page.waitForSelector(`div[aria-label="${row.size}"]`);
    await page.click(`div[aria-label="${row.size}"]`);

    //(販売可否/在庫)
    await page.waitForSelector('.sell-amount-input input.bmm-c-text-field.bmm-c-text-field--half-size-char');
    await page.type('.sell-amount-input input.bmm-c-text-field.bmm-c-text-field--half-size-char',row.inventory);
    

    //TODO (配送方法) 정적으로 밑에서 2개만 체크하는 형식으로 만듬
    if (row.shippingMethod) await page.evaluate(() => { document.querySelector(".bmm-c-form-table__body .bmm-c-form-table__table tr:nth-child(11)").click();});//5〜12日
    if (row.shippingMethod) await page.evaluate(() => { document.querySelector(".bmm-c-form-table__body .bmm-c-form-table__table tr:nth-child(12)").click();});//30〜45日

    //(購入期限(日本時間))
    await page.waitForSelector('.react-datepicker__input-container input.bmm-c-text-field');
    await page.evaluate(() => { document.querySelector(".react-datepicker__input-container input.bmm-c-text-field").value = "";});
    await page.evaluate((purchaseDeadline) => { document.querySelector(".react-datepicker__input-container input.bmm-c-text-field").value = purchaseDeadline;},row.purchaseDeadline);
    await page.keyboard.press('Enter');

    //TODO (買付地) default값 그대로 사용
    //(発送地) default값 그대로 사용 -> [수정 2021/06/13] 発送地등록 추가
    // update 2021/8/12 page.waitForSelector()를 사용할 때, 선택자가 길면 잘 안되서 코멘트처리
    // await page.waitForSelector('.bmm-c-panel:nth-child(7) .bmm-c-panel__item:nth-child(4) .bmm-l-col-9 .bmm-c-field__input .bmm-c-radio:nth-child(2) .bmm-c-radio__body');
    // update 2021/8/22 page.click(여기를 짧게 줄였음)
    // await page.click('.bmm-c-panel:nth-child(7) .bmm-c-panel__item:nth-child(4) .bmm-l-col-9 .bmm-c-field__input .bmm-c-radio:nth-child(2) .bmm-c-radio__body');
    await page.click('.bmm-c-panel__item:nth-child(4) .bmm-c-radio:nth-child(2)');

    // await page.waitForSelector('#react-select-18--value-item');
    // await page.click('#react-select-18--value-item');
    await page.waitForSelector('#react-select-9--value-item');
    await page.click('#react-select-9--value-item');
    await page.waitForSelector('div[aria-label="アジア"]');
    await page.click('div[aria-label="アジア"]');
    // await page.waitForSelector('#react-select-19--value-item');
    // await page.click('#react-select-19--value-item');
    await page.waitForSelector('#react-select-10--value-item');
    await page.click('#react-select-10--value-item');
    await page.waitForSelector('div[aria-label="韓国"]');
    await page.click('div[aria-label="韓国"]');

    //(商品価格)
    await page.waitForSelector('.bmm-c-custom-text--unit-left input.bmm-c-text-field--half-size-char');
    await page.focus('.bmm-c-custom-text--unit-left input.bmm-c-text-field--half-size-char');
    await page.type('.bmm-c-custom-text--unit-left input.bmm-c-text-field--half-size-char',row.productPrice);
    
    //(商品画像)
    imagePathArray = fs.readdirSync(path.join(__dirname, '../tempSave'), function(error, fileList){
        if(error)return console.log("error",error);
        return fileList;
    })
    imagePathArray = imagePathArray.map((v) => {
        return path.join(__dirname, `../tempSave/${v}`);
    });
    const[fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('.bmm-c-img-upload .bmm-c-img-upload__dropzone span'),
    ])
    await fileChooser.accept(imagePathArray);
    await page.waitForTimeout(20000);

    //上書きボタンをクリックする
    await page.waitForSelector('.sell-btnbar button:nth-child(1)');
    await page.click('.sell-btnbar button:nth-child(1)');

    //에러 존재 확인 (에러가 존재하면 문자열로 만들어서 throw함)
    await page.waitForTimeout(5000);
    let errData = await page.evaluate(() => {
        let errString = Array.from(document.querySelectorAll(".bmm-c-box--overall-alert ul li")).reduce((preVal,CurVal) => {
                return preVal + "\n" + CurVal.textContent}, ""); 
        return errString;
    });
    if (errData) throw new SyntaxError(errData);

    //(状態) 변경
    row.status = '下書き完了';
    await row.save(); // save changes

    await page.close();
    await browser.close();

    // 성공한값 sns전송
    // lineSend(page.url());

    }
    catch(e) {
        console.log(e);
        // 에러값 저장
        row.status = 'エラー';
        if (e instanceof SyntaxError) {
            row.errData = e.message;
        } else {
            row.log = e.message;
        }

        await row.save(); // save changes

        await page.close();
        await browser.close();

        // 실패한값 sns전송
        // lineSend(row.productName);

    }
    
}

//  value /n value 형태 문자열 ⇨ 잘라서 배열로 만들기
function array01(colors) {
    return colors.split(/\n/g);
}
//  value : value 형태 문자열 ⇨ 잘라서 배열로 만들기
function array02(color) {
    return color.split(/：/g);
}


module.exports.buyma = buyma;