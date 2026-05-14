# 荒城幻影 H5 原型

这是一个参考“背包管理 + 尸潮自动战斗”思路实现的纯前端原型，未使用原作素材或命名资源。

当前版本已经从单局原型扩展为轻量成品框架，包含局外研究、永久武器库和 Boss 波次。

## 运行方式

直接用浏览器打开 [index.html](D:\MyProjectCode\ZhiJianHuanYing\index.html) 即可运行。

如果你更习惯本地服务，也可以在当前目录执行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 当前玩法

- `WASD / 方向键` 控制角色移动
- 手机端可按住战场区域拖动移动
- 自动攻击最近敌人
- 背包与上阵区支持点击卡牌后再点击目标格进行交换
- 相同武器卡可合成升级，最高 `Lv.5`
- 每波结束弹出 3 选 1 强化
- 每 `5` 波出现 `Boss`
- 结算可获得 `晶核`，用于局外研究
- 可通过 `补给箱` 永久提升武器库，下局生效

## 文件结构

- [index.html](D:\MyProjectCode\ZhiJianHuanYing\index.html): 页面结构
- [styles.css](D:\MyProjectCode\ZhiJianHuanYing\styles.css): 视觉样式与响应式布局
- [game.js](D:\MyProjectCode\ZhiJianHuanYing\game.js): 战斗循环、敌人生成、Boss、武器系统、局外研究、背包与合成逻辑
