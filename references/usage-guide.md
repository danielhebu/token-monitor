# token-monitor Skill 使用指南

## 📍 Skill位置

**文件路径**: `C:\Users\danie\Documents\skills\token-monitor\`
**已自动加载**: ✅ OpenClaw启动时会自动加载

---

## 🎯 如何使用

### 方式一：直接问我（推荐）

直接问我以下问题，我会自动调用这个skill：

- "今天的token使用情况怎么样？"
- "查看token消耗"
- "我的账户余额还剩多少？"
- "帮我统计下成本"
- "token用量报告"

### 方式二：手动运行脚本

```bash
# 查看今日报告
node C:\Users\danie\Documents\scripts\token-monitor.js

# 更新账户余额
node C:\Users\danie\Documents\scripts\update-balance.js 79.69
```

### 方式三：查看数据文件

```bash
# 累计数据
cat C:\Users\danie\Documents\memory\token-usage.json

# 账户余额
cat C:\Users\danie\Documents\memory\zhipu-balance.json

# 每日记录
ls C:\Users\danie\Documents\memory\token-daily\
```

---

## ⚙️ 自动化功能

### 每日自动统计（已配置）

- **时间**: 每天午夜 00:00 (Asia/Shanghai)
- **内容**: 
  - 统计今日token使用量和费用
  - 计算近7天平均消耗
  - 检查余额是否充足
  - **余额不足2天时自动提醒！**

查看cron任务：
```bash
openclaw cron list
```

---

## 📊 数据存储

| 文件 | 说明 |
|------|------|
| `memory/token-usage.json` | 累计统计数据 |
| `memory/zhipu-balance.json` | 账户余额配置 |
| `memory/token-daily/YYYY-MM-DD.json` | 每日详细记录 |

---

## 💰 费用计算

**GLM-5定价**:
- 输入: ¥1 / 百万tokens
- 输出: ¥3.2 / 百万tokens

**公式**:
```javascript
费用 = (输入tokens × 1 + 输出tokens × 3.2) / 1,000,000
```

---

## 🔔 预警机制

- **默认阈值**: 余额不足2天时提醒
- **计算方式**: 余额 ÷ 近7天平均日消耗 = 可支撑天数
- **修改阈值**: 编辑 `memory/zhipu-balance.json` 中的 `warningThresholdDays`

---

## 📱 快捷访问

把这个加到你的快捷方式：

```
查看token: node C:\Users\danie\Documents\scripts\token-monitor.js
更新余额: node C:\Users\danie\Documents\scripts\update-balance.js <金额>
```

---

## 🎓 示例对话

**你**: "大白，今天用了多少token？"

**我**: （自动运行token-monitor脚本）
```
=== Token使用日报 (2026-04-05) ===
今日输入: 35,117 tokens
今日输出: 146 tokens
今日总计: 35,263 tokens
今日费用: ¥0.0356
当前账户余额: ¥79.69
余额可支撑: 2,238 天
```

---

**开发成本**: ¥0.22 | **开发时间**: ~1小时 | **创建日期**: 2026-04-05
