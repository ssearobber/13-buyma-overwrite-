# buyma macro

## [notion link](https://www.notion.so/c4aea5c512c04db9a26403cad9a87fa2)


2021/05/30  
브랜드 입력 추가  

2021/6/13
発送地를 default값에서 한국으로 수정

2021/8/11
- 브랜드 선택부분 수정(await page.click()에 선택자가 여러개면 puppeteer가 인식을 잘 못함)
- html의 id로 크롤링하는 것은 수정필요..

2021/8/12
- page.waitForSelector()를 사용할 때, 선택자가 여러개면 puppeteer가 인식을 잘 못함.

2021/8/22
- page.click()를 사용할 떄, 선택자의 길이를 짧게 고침