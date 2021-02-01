# spring-rest-admin

## 简介

本项目是基于 Vue, ElementUI 搭建的管理台前端项目，与 [Spring-Rest Backend](https://github.com/bianyun1981/spring-rest-backend) 搭配使用，框架代码来自于 [Vue-Element-Admin](https://github.com/PanJiaChen/vue-element-admin) ，在其基础上做了一点改动。主要优化了权限管理功能。

## 优化

- 菜单权限根据路由配置自动生成，由管理员同步到后台数据库；

- 在已同步的菜单权限下可以添加、修改、删除按钮权限；

- 除按钮权限外，菜单权限、接口权限的元数据分别由前端和后端自动生成，即使数据库记录全部被清空，也只需要管理员再同步一次即可，无需手工插入表记录；

- 添加按钮权限时，自动生成前缀，只填写必要的部分，防止格式混乱；

- 增加菜单权限和按钮权限关联接口权限的功能，角色只与菜单权限和按钮权限直接关联；

- 对页面元素进行鉴权时，使用枚举常量，避免直接使用权限字符串，方便维护；

- 定义 API 接口调用类层次，与后台接口类层次保持一致，消除冗余，提高代码复用度；

- 修复组件 `el-scrollbar` 的 bug：浏览器缩小到一定程度时，原先隐藏的原始滚动条会暴露出来，缩小比例越大，现象越明显；


## 开发环境准备

### Node.js环境准备

Node.js 版本建议使用 v12，其它版本好像也没问题。

Linux 和 MacOS 下建议使用 [nvm](https://github.com/nvm-sh/nvm) 进行 Node.js 的版本管理，nvm不支持 Windows，不过可以使用替代方案 [nvm-windows](https://github.com/coreybutler/nvm-windows) 。

以 Windows 下 nvm-windows 为例（git bash 下运行）：

```bash
# 设置 nvm 下载 node 和 npm 的镜像地址（直接访问外网太慢）
$ nvm node_mirror https://npm.taobao.org/mirrors/node/
$ nvm npm_mirror https://npm.taobao.org/mirrors/npm/

# 设置 npm 下载包的镜像地址
$ npm config set registry https://registry.npm.taobao.org

# 查看可用的 Node.js版本
$ nvm list available

# 挑选一个最新的 v12 的 LTS 版本进行安装
$ nvm install 12.20.1
$ nvm use 12.20.1

# 查看已经安装的所有 Node.js 版本
$ nvm list
# 切换希望使用的版本
$ nvm use <nodeVersion>

# 查看当前的 Node.js 版本 和 npm 版本
$ node -v
$ npm -v
```

### 项目检出和运行

**注意：** 运行管理台前端前，最好把服务端后台运行起来先。

```bash
$ git clone https://github.com/bianyun1981/spring-rest-admin.git
$ cd spring-rest-admin
$ npm install
```

**注意：** 如果在执行 npm install 命令时有报错，且错误信息是 `npm ERR! Failed at the chromedriver@2.46.0 install script.` ，那么可以执行下面的命令后再执行 `npm install` ：

```bash
$ npm install chromedriver --chromedriver_cdnurl=http://cdn.npm.taobao.org/dist/chromedriver
```

如果 npm install 阶段还有报其它错，可能是由于某些包无法从淘宝镜像站下载，需直接访问某些无法访问的外网地址下载,，但是下载不成功导致的，可以尝试加上代理配置后重试。

```bash
$ npm config set proxy http://username:password@host:port
$ npm config set https-proxy http://username:password@host:port
```

如果 npm install 执行成功，没有报错的话，就可以继续运行

```bash
$ npm run serve
```

稍等片刻后，会自动打开浏览器，并跳转到地址 `http://localhost:9527/login?redirect=%2Fdashboard`，选择一个内置用户即可直接登录。

![](https://cdn.jsdelivr.net/gh/bianyun1981/CDN@latest/img/readme/2021-02/2021-02-01-160437-581.png)

**注意：**服务端后台要先启动才能登录成功。

![](https://cdn.jsdelivr.net/gh/bianyun1981/CDN@latest/img/readme/2021-02/2021-02-01-161355-195.png)

### 环境配置文件

vue-element-admin 支持多环境配置，环境配置文件名格式为 `.env.[环境名]`，如果此环境配置信息只需在本地使用，那么在文件名最后加上后缀 `.local`，这样该配置文件不会被 `git` 上传到版本库，只会保留在本地。

![](https://cdn.jsdelivr.net/gh/bianyun1981/CDN@latest/img/readme/2021-02/2021-02-01-162540-158.png)

**注意：** 除了开发环境配置 `.env.development` 和 `.env.development.local` 以外，其它环境配置文件都需要设置 `NODE_ENV = production` ，环境名 `ENV` 需要与 环境配置文件名中 `.env` 与 `.local`中间的部分对应，另外，接口调用地址前缀 `VUE_APP_BASE_API` 也要记得修改。

**注：** 配置文件中如果要定义其它的环境变量，需要以 `VUE_APP_` 开头，在代码中通过 `process.env.VUE_APP_xxxx` 的方式获取。

### 打包部署

**注意：** 打包前请确认 npm install 和 npm run serve 都能正常执行不报错。

打包命令为： `npm run build -- --mode <环境名>`，以上图为例，打包命令为：

```bash
$ npm run build -- --mode vm-centos7
```

命令成功执行结束后，dist 目录下即为打包结果文件。

**注意：** 代码压缩插件 compression-webpack-plugin 只能使用上一个版本 v6，不能使用最新的 v7 版本，否则好像会报错。

另外，本项目的路由模式配置为 history 模式，如果希望以此模式运行，需要 nginx也要做相应配置（详细说明见 [使用 `history.pushState` 的路由](https://cli.vuejs.org/zh/guide/deployment.html#%E4%BD%BF%E7%94%A8-history-pushstate-%E7%9A%84%E8%B7%AF%E7%94%B1) ）。同时，还要加上 gzip 相关配置（只需要这一行配置即可）：

```nginx
location / {
  gzip_static on;
  try_files $uri $uri/ /index.html;
}
```

