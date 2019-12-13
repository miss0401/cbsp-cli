const fs = require('fs');
const path = require('path');


module.exports = {

 // 查看文件/文件夹是否存在
 checkFileIsExists(path) {
   return fs.existsSync(path);
 },

 // 创建文件夹
  createDir(src) {
    return new Promise(resolve => {
      fs.mkdir(src, { recursive: true }, (err) => {
       if (err) {
         throw err
       }
       return resolve();
      })
    })
  },

  // 获取文件夹下的list
  readDir(path) {
    return new Promise(resolve => {
      fs.readdir(path, (err, files) => {
       if (err) {
         throw err;
       }

       return resolve(files);
      })
    })
  },

  // 复制文件
  copyFile(originPath, curPath) {
   return new Promise(resolve => {
    fs.copyFile(originPath, curPath, fs.constants.COPYFILE_EXCL, (err) => {
     if (err) {
       throw err;
     }
     return resolve('copyFile success');
    })
   })
  },

  //批量复制文件
  copyFilesArr(originPath, curPath, arr) {
    return new Promise(async resolve => {
      let exName = '';
      for (let i = 0; i < arr.length; i++) {
        extName = path.extname(arr[i]);
        await this.copyFile(`${originPath}/${arr[i]}`, curPath + extName)
      }
      return resolve('copyFileArr success');
    })
  }
}