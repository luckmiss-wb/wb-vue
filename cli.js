#!/usr/bin/env node

/**
 * 脚手架工作过程
 * 1. 通过命令行交互询问用户问题
 * 2. 根据用户反馈结果生成文件
 **/

const fs = require("fs")
const path = require("path")
const inquirer = require("inquirer")
const ejs = require("ejs")
const { resolve } = require("path")
// 正则匹配 plug
const plug = RegExp(/plug/);

inquirer.prompt([
  {
    // 项目欢迎语
    type: 'input',
    name: 'name',
    message: 'Please enter the project name ?',
    default: 'wb-vue'
  },
  {
    // 选择启用插件
    type: 'checkbox',
    name: 'plug',
    message: 'Please select your Plugen ?',
    choices: [
      { name: 'jQuery', checked: true },
      { name: 'Highcharts', checked: true },
      { name: 'Echarts', checked: true },
      { name: 'd3', checked: true },
      { name: 'antv', checked: true },
      { name: 'bootstrap', checked: true }
    ]
  },
  {
    // 是否覆盖已存在文件
    type: "confirm",
    message: "overwrite an existing file？",
    name: "watch",
    default: true
  }
]).then(answers => {
  // 模板路径
  const tmpPath = path.join(__dirname, 'templates');
  // 工作目录路径
  const destPath = process.cwd();
  // 添加映射，用于渲染plug根目录
  answers.plug.push("plug")
  // 是否覆盖已存在目录，覆盖则清空当前目录
  const clean = answers.watch;
  // 递归遍历方法
  function readdir(paths, destPath) {
    // 遍历模板目录
    fs.readdir(paths, (err, files) => {
      // 失败抛出错误
      if(err) throw err;
      // 循环目录
      files.forEach(item => {
        // 获取当前文件描述符，用于判断当前路径是否是文件夹
        fs.stat(path.join(paths, item), function(err, info){
          const s_path = path.join(destPath, item)
          // 当前路径是目录
          if (info.isDirectory()){
            // 判断当前目录是否存在  true 表示文件存在  false 表示文件不存在
            const stat = fs.existsSync(path.join(destPath, item));
            // fileType 匹配路径包含pulg的路径
            const fileType = path.join(destPath, item).match(plug)
            // 路径包含 plug
            if(fileType) {
              // 用户配置中启用当前插件
               if(answers.plug.includes(item)) {
                  // 文件夹不存在，生成文件夹
                  if(!stat) fs.mkdirSync(s_path)
                  // 递归下一层目录
                  readdir(path.join(paths, item), s_path);
                }
                // 用户配置不启用插件，不做任何操作
            } else {
              // html 文件夹下目录
              // 文件夹不存在，生成文件夹
              if(!stat) {
                // 生成文件夹
                fs.mkdirSync(s_path)
              }
              // 递归下一层目录
              readdir(path.join(paths, item), s_path);
            }
          } else {
            // 如果当前路径存在
            if(fs.existsSync(s_path)) {
              // 当选择 yes 时重置项目，EJS模板渲染输出
              // 选择 no 什么都不做
              if(clean) {
                ejs.renderFile(path.join(paths, item), answers, (err, result) => {
                  if (err) throw err
                  fs.writeFileSync(s_path, result)
                },)
              }
            } else {
              // 如果当前路径不存在，EJS模板渲染输出
              ejs.renderFile(path.join(paths, item), answers, (err, result) => {
                if (err) throw err
                fs.writeFileSync(s_path, result)
              },)
            }
          }	
        })
      })
    })
  }
  
  readdir(tmpPath, destPath)
})