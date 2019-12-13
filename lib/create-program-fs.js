
 const inquirer = require('inquirer');

 const fs = require('fs');

 const path = require('path');

 const Config = require('./../config.root');

 const Log = require('./../log');

 const utils = require('./../utils');

 const jsonFormat = require('json-format');

 const __Data__ = {
 
   // 小程序项目app.json
   appJson: '',

   // 小程序所有的页面 
   appPageList: {}
 
 }


 // 获取app.json
 function getAppJson() {
   let appJsonRoot = path.join(Config.entry, 'app.json');
   console.log(appJsonRoot, '121212');

   try {
     return require(appJsonRoot);
   }
   catch (e) {
     Log.error(`未找到app.json, 请检查当前文件目录是否正确，path: ${appJsonRoot}`);
     process.exit(1);
   }
 }

 // 填充app.json
 function addAppJson(name, modulePath = '') {
   return new Promise(resolve => {
     let appJson = __Data__.appJson;

     // 没有分包 直接就是一个包丢上去 后续再加
     appJson.pages.push(`pages/${name}/${name}`);

     fs.writeFile(`${Config.entry}/app.json`, jsonFormat(appJson), (err) => {
       if (err) {
         Log.error('自动写入app.json文件失败，请手动填写，并检查错误');
         reject();
       }
       else {
         resolve();
       }
     })
   })
 }

 // 获取文件名/模块名
function getPathSubSting(path) {
 let result = '',
 arr = path.split('/');
 for (let i = arr.length; i > 0; i--) {
     if (!!arr[i]) {
         result = arr[i];
         break;
     }
 }
 console.log(result, 'result');
 return result;
}


 // 初始化app.json
 let parseAppJson = () => {
 
   // app Json 源文件
   let appJson = __Data__.appJson = getAppJson();

   console.log()

   appJson.pages.forEach(path => __Data__.appPageList[getPathSubSting(path)] = '');
 }

 

 // 创建页面
 async function createPage(name, modulePath = '') {
    // 模版文件路径
    let templateRoot = path.join(Config.template, '/page');
    if (!utils.checkFileIsExists(templateRoot)) {
      Log.error(`未找到模版文件，请检查当前文件目录是否正确，path:${templateRoot}`);
      return;
    }

    // 业务文件夹路径
    let page_root = path.join(Config.entry, modulePath, '/pages', name);
    if (utils.checkFileIsExists(page_root)) {
      Log.error(`当前页面已存在，请重新确认，path:${page_root}`);
      return;
    }

    // 创建文件夹
    await utils.createDir(page_root);

    // 获取模版文件列表
    let files = await utils.readDir(templateRoot);

    // 复制文件
    await utils.copyFilesArr(templateRoot, `${page_root}/${name}`, files);

    //填充app.json
    await addAppJson(name, modulePath)

    // 新建成功
    Log.success(`createPage success, path: ` + page_root);
    
 }

 const questions = [

   {
     type: 'list',
     name: 'mode',
     message: '选择你想生成的模版类型：',
     choices: [
       'page',
       'component'
     ]
   },

   // 设置名称
   {
     type: 'input',
     name: 'name',
     message: answer => `设置${answer.mode}的名字（例如： index）:`,
     validate(input) {
       let done = this.async();

       if (!input) {
         done('name设置不能为空');
         return;
       }
       done(null, true);
     }
   }
 ]

function startCreate () {
   // 解析appJson
   parseAppJson();

   // 问题执行
   inquirer.prompt(questions).then(answers => {
    let { name, mode } = answers;
    switch (mode) {
        case 'page':
            createPage(name);
            break;
        case 'component':
            createComponent({ name });
            break;
    }
   });
 }

 startCreate();