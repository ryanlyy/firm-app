# 山东云根律师事务所 业务管理系统 — 发布与部署指南

## 版本信息

- 当前版本：**v1.0.0**
- 技术栈：React 19 + TypeScript + Vite + Tailwind CSS v4

---

## 一、环境要求

| 工具      | 最低版本 |
| --------- | -------- |
| Node.js   | 18.x     |
| npm       | 9.x      |

---

## 二、本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

---

## 三、生产构建

```bash
# 1. 类型检查 + 构建
npm run build

# 构建产物输出到 dist/ 目录
```

构建完成后，`dist/` 目录包含：

```
dist/
├── index.html         # 入口 HTML
├── assets/
│   ├── index-xxxx.js  # 应用 JS（含所有依赖）
│   └── index-xxxx.css # 样式表
└── favicon.svg        # 网站图标
```

---

## 四、本地预览构建产物

```bash
npm run preview
# 默认访问 http://localhost:4173
```

---

## 五、部署方式

### 方式 A：静态文件服务器（推荐）

将 `dist/` 目录部署到任意静态文件服务器：

#### Nginx 示例配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/firm-app/dist;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache (.htaccess) 示例

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 方式 B：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
# 构建镜像
docker build -t yungen-firm-app .

# 运行容器
docker run -d -p 8080:80 --name firm-app yungen-firm-app
```

### 方式 C：云平台一键部署

本项目支持一键部署到以下平台：

- **Vercel**：连接 Git 仓库，自动识别 Vite 配置
- **Netlify**：Build command: `npm run build`，Publish directory: `dist`
- **阿里云 OSS / 腾讯云 COS**：上传 `dist/` 目录全部文件

---

## 六、发布流程

### 标准发布流程

```
1. 代码开发完成 → 本地运行 npm run dev 验证
2. 执行 npm run build 确保构建无错误
3. 执行 npm run preview 在本地预览生产版本
4. 更新 package.json 中的 version 字段
5. 提交代码到 Git 仓库
6. 打版本标签：git tag v1.0.0 && git push --tags
7. 将 dist/ 目录部署到目标服务器
8. 验证线上功能正常
```

### 版本号规范（语义化版本）

- **主版本号**（Major）：重大功能变更或不兼容升级
- **次版本号**（Minor）：新增功能，向下兼容
- **修订号**（Patch）：Bug 修复，向下兼容

示例：`1.0.0` → `1.0.1`（修复 Bug）→ `1.1.0`（新增功能）→ `2.0.0`（重大变更）

---

## 七、注意事项

1. **SPA 路由**：部署后必须配置服务器将所有请求回退到 `index.html`，否则刷新页面会出现 404
2. **数据安全**：当前版本数据存储在浏览器 localStorage，清除浏览器缓存会丢失数据。生产环境建议定期导出备份
3. **HTTPS**：生产环境建议配置 SSL 证书启用 HTTPS
4. **浏览器兼容**：支持所有现代浏览器（Chrome 80+、Firefox 80+、Safari 14+、Edge 80+）
