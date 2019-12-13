#!/usr/bin/env node
console.log('Hello World!!!!');

const version = require('./package').version;

const command = require('commander');

const createProgram = require('./lib/create-program-fs');

const publishProgram = require('./lib/publish-cbmp');

command.version(version, '-v --version');

command.command('create')
       .description('创建页面或组件')
       .action((cmd, options) => createProgram(cmd))


command.command('publish')
       .description('发布小程序体验版')
       .action((cmd, options) => publishProgram(cmd))


command.parse(process.argv);