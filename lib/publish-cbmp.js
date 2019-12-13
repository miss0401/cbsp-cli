#!/usr/bin/env node
const inquirer = require('inquirer'); 

const spawn  = require('cross-spawn');

const Config = require('./../config.root');

const fs = require('fs');

const jsonFormat = require('json-format');

const Log = require('./../log');

function getVersionChoices(version = "0.0.0") {

 // 描述数组
 const vArrsDesc = ['raise major: ', 'raise minor: ', 'raise patch: ', 'raise alter: '];
 
 // 版本号(数组形态)
 let vArrs = version.split('.');

 // 版本号选项
 let choices = vArrsDesc.map((item, index, array) => {

     // 当配置文件内的版本号，位数不够时补0
     array.length > vArrs.length ? vArrs.push(0) : '';

     // 版本号拼接
     return vArrsDesc[index] + versionNext(vArrs, index)
 }).reverse();

 // 添加选项
 choices.unshift('no change');

 return choices;
}

// 增加版本号
function versionNext(array, idx) {
 let arr = [].concat(array); ++arr[idx];
 
 arr = arr.map((v, i) => i > idx ? 0 : v);
 
 // 当最后一位是0的时候, 删除
 if (!parseInt(arr[arr.length - 1]))  arr.pop();

 return arr.join('.');
}

// 获取问题列表
function getQuestion({version, versionDesc} = {}) {
 return [
     // 确定是否发布正式版
     {
         type: 'confirm',
         name: 'isRelease',
         message: '是否为正式发布版本?',
         default: true
     },

     // 设置版本号
     {
         type: 'list',
         name: 'version',
         message: `设置上传的版本号 (当前版本号: ${version}):`,
         default: 1,
         choices: getVersionChoices(version),
         filter(opts) {
             if (opts === 'no change') {
                 return version;
             }
             return opts.split(': ')[1];
         },
         when(answer) {
             return !!answer.isRelease
         }
     },

     // 设置上传描述
     {
         type: 'input',
         name: 'versionDesc',
         message: `写一个简单的介绍来描述这个版本的改动过:`,
         default: versionDesc
     },
 ]
}

// 修改本地版本文件

function rewriteLocalVersionFile(filepath, versionConf) {

  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, jsonFormat(versionConf), err => {
      if(err){
        Log.error(err);
        process.exit(1);
      }
      else {
        resolve();
      }
    })
  })

}

async function startPublish (userConf = {}) {
  // ide路径
  const idePath = userConf.idePath || '/Applications/wechatwebdevtools.app/'; 
  // cli路径
  const cli = `${idePath}/Contents/Resources/app.nw/bin/cli`;
  // 版本配置文件路径
  const versionConfPath = Config.dir_root + '/cbsp.version.json';

  // 获取版本配置
  const versionConf = require(versionConfPath);

  // 开始执行问题队列
  const answer = await inquirer.prompt(getQuestion(versionConf));
  versionConf.version = answer.version;
  versionConf.versionDesc = answer.versionDesc;

  //上传体验版
  let res = spawn.sync(cli, ['-u', `${versionConf.version}@${Config.entry}`, '--upload-desc', versionConf.versionDesc], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(1);

  // 修改本地版本文件 (当为发行版时)
  !!answer.isRelease && await rewriteLocalVersionFile(versionConfPath, versionConf);

  Log.success(`上传体验版成功, 登录微信公众平台 https://mp.weixin.qq.com 获取体验版二维码`);
  
}

startPublish();
