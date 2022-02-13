const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); 


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || googleClientId;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || googleClientSecret;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || googleRedirectUri;

let REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || googleRefreshToken;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 토큰 획득
// oauth2Client.on('tokens', (tokens) => {
//   if (tokens.refresh_token) {
//     REFRESH_TOKEN = tokens.access_token;
//     console.log("REFRESH_TOKEN 기존 기존");
//   }
//   console.log("REFRESH_TOKEN 새로운 토큰");
// });

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// access token 획득
// oauth2Client.refreshAccessToken((error, tokens) => {
//   console.dir('refreshAccessToken', tokens);

//   if (error) {
//     console.log('error ',error);
//   }
// })

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

// image폴더id
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || googleDriveFolderId;
// image폴더안에 있는 폴더명들 격납
let folderNameArray = [];
// 숫자폴더안에 있는 파일명들 격납
let fileNameArray = [];


async function googleDrive(folderName) {

    folderNameArray = await getFolderName();
    folderNameArray.forEach(async (v) => {
        if (v.name == folderName) {
            fileNameArray = await getFileName(v.id);
                fileNameArray.forEach(async (v) => {
                    await downloadFile(v.id, v.name);
                })
        };
    });
}

/**
 * 폴더명 가져오기
 * @return {response.data.files} folder array
 */
async function getFolderName() {
  try {
    const response = await drive.files.list({
        maxResults: 10,
        orderBy: 'createdTime',
        q: `'${folderId}' in parents`,
    });
    return response.data.files;
  } catch (error) {
    console.log('getFolderName 에러',error.message);
    //TODO refresh token의 갱신이 필요할 경우
  }
}

/**
 * 파일명 가져오기
 * @param {response.data.files.id} folderId
 * @return {response.data.files} files array
 */
async function getFileName( folderId ) {
  try {
    const response = await drive.files.list({
        maxResults: 10,
        orderBy: 'createdTime',
        q: `'${folderId}' in parents`,
    });
    return response.data.files;
  } catch (error) {
    console.log('getFileName 에러',error.message);
  }
}

/**
 * 파일 다운로드
 * @param {response.data.files.id} folderId
 */
async function downloadFile( fileId , fileName) {
    let dest = fs.createWriteStream(path.join(__dirname, `../tempSave/${fileName}`));
    drive.files.get({
        fileId : `${fileId}`,
        alt: 'media',
    },{ 
        responseType: 'stream'
    },  
      function(err, response){
        if(err)return console.log("err",err); 
        response.data.on('error', err => {
             console.log('downloadFile 에러', err)
        }).on('end', ()=>{
            console.log('Done downloadFile');
        })
         .pipe(dest);
        });
}

/**
 * 드라이브에 폴더 생성
 */
async function makeFolder() {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: 'test',
        mimeType: 'application/vnd.google-apps.folder',
      }
    });

    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * 파일 업로드
 * @return {response.data.files} files array
 */
// const filePath = path.join(__dirname, 'example.jpg');
// async function uploadFile() {
//   try {
//     const response = await drive.files.create({
//       requestBody: {
//         name: 'example.jpeg', //This can be name of your choice
//         mimeType: 'image/jpeg',
//       },
//       media: {
//         mimeType: 'image/jpeg',
//         body: fs.createReadStream(filePath),
//       },
//     });

//     console.log(response.data);
//   } catch (error) {
//     console.log(error.message);
//   }
// }

module.exports.googleDrive = googleDrive;


