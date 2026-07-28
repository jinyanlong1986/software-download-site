# 软集

一个可直接部署到 Cloudflare Pages 的静态软件下载目录站。无需服务器、数据库或付费套餐。

## 本地预览

直接用浏览器打开 `index.html` 即可。也可运行：

```powershell
npx wrangler pages dev .
```

## 部署到 Cloudflare Pages（免费）

1. 在 GitHub 新建仓库并推送此目录的文件。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) ，选择 **Workers 和 Pages** → **创建应用程序** → **Pages** → **连接到 Git**。
3. 选择刚创建的仓库，构建设置填写：
   - 框架预设：`None`
   - 构建命令：留空
   - 构建输出目录：`.`
4. 点击部署。Cloudflare 会免费提供 `*.pages.dev` 域名和 HTTPS。

之后每次推送到 GitHub，Cloudflare 会自动重新部署。软件条目都在 `app.js` 顶部的 `software` 数组中；请只填写软件厂商的官方下载页，避免托管未经授权的安装包。
