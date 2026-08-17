# Paltrow 动画演示（GitHub Pages 纯静态版）

这是把桌宠的**动画部分**抽出来的纯静态版本：只有像素小人 + 7 个动作 + 眼睛跟随 + 待机/眩晕，
**没有模型、没有聊天、没有登录**。适合先验证"任何设备能打开动画"。

- `index.html` / `app.js` / `styles.css` — 前端（无后端依赖）
- `pet-assets/*/pet_*.gif` — 7 个动画资源

## 本地预览

直接在浏览器打开 `index.html` 即可；或用任意静态服务器：

```bash
cd gh-pages
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 部署到 GitHub Pages

**方式 A（最简单，单独仓库）**
1. 在 GitHub 新建一个仓库（如 `paltrow-pet`）。
2. 把本目录（`gh-pages/`）里的**内容**（不是文件夹本身）上传到仓库根目录。
3. 仓库 `Settings → Pages → Source` 选 `Deploy from a branch` → 分支 `main` → 目录 `/ (root)` → Save。
4. 几分钟后访问 `https://<你的用户名>.github.io/paltrow-pet/`。

**方式 B（现有仓库，gh-pages 分支）**
1. 把本目录内容推到 `gh-pages` 分支。
2. `Settings → Pages → Source` 选 `gh-pages` 分支 → `/ (root)`。

> 提示：GitHub Pages 只托管静态文件，无法跑 Python 或加载模型。要接入模型聊天，
> 仍走 `deployment/PUBLIC_DEPLOY_PLAN.md` 里的 Cloudflare Tunnel / 服务器方案。
