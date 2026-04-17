---
name: token-monitor
description: Monitor and track LLM API token usage, costs, and account balance across multiple platforms (Zhipu, Kimi, OpenAI, etc.). Automatically calculate daily consumption, predict remaining days based on balance, warn when balance is insufficient. Support per-platform top-up total tracking. Use when asked about token statistics, usage costs, balance checking, or setting up usage monitoring for OpenClaw/LLM services.
---

# Token Monitor v2.0

Multi-platform LLM API token usage monitoring with balance tracking.

## Quick Start

### View Today's Usage

```bash
node scripts/token-monitor.js
```

Output includes:
- Daily input/output tokens
- Daily cost (CNY)
- Cumulative cost
- 7-day average daily consumption
- **Per-platform account health** (充值总额, 今日消费, 当前余额, 可用天数)
- Warning if any platform balance < threshold

### Update Balance

```bash
# Update single platform balance
node scripts/update-balance.js <platform> <balance> [totalTopUp]

# Examples:
node scripts/update-balance.js zhipu 45.47 200
node scripts/update-balance.js kimi 87.89 100
```

## Architecture

### Files

```
token-monitor/
├── SKILL.md                    # This file
├── README.md                   # Detailed documentation
├── package.json
├── LICENSE
├── scripts/
│   ├── token-monitor.js        # Main monitoring script (v2.0 multi-platform)
│   └── update-balance.js       # Balance update utility (v2.0 multi-platform)
└── references/
    ├── development-report.md
    └── usage-guide.md
```

### Data Files (in workspace/memory/)

```
memory/
├── token-usage.json            # Cumulative token usage data
├── zhipu-balance.json          # Multi-platform balance data (v2 format)
└── token-daily/                # Daily log files
    └── YYYY-MM-DD.json         # Per-day records
```

### Data Structures

**zhipu-balance.json (v2 format)**

```json
{
  "platforms": {
    "zhipu": {
      "balance": 45.47,
      "totalTopUp": 200.00,
      "lastUpdate": "2026-04-17T09:08:00.000Z",
      "todayCost": 0.2062
    },
    "kimi": {
      "balance": 87.89,
      "totalTopUp": 100.00,
      "lastUpdate": "2026-04-17T07:30:00.000Z",
      "todayCost": 0
    }
  },
  "warningThresholdDays": 2
}
```

**token-usage.json**

```json
{
  "lastCheck": "2026-04-17",
  "totalTokensIn": 167092,
  "totalTokensOut": 1426,
  "totalCost": 0.2062
}
```

**token-daily/YYYY-MM-DD.json**

```json
{
  "date": "2026-04-17",
  "inputTokens": 167092,
  "outputTokens": 1426,
  "totalTokens": 168518,
  "costCNY": 0.2062,
  "cumulativeInput": 167092,
  "cumulativeOutput": 1426
}
```

## Report Format

### Token消费日报

```
╔══════════════════════════════════════════════╗
║       📊 Token 消费日报 (2026-04-17)        ║
╠══════════════════════════════════════════════╣
║  📥 今日输入 tokens:           167,092       ║
║  📤 今日输出 tokens:             1,426       ║
║  🔢 今日总计 tokens:           168,518       ║
║  💰 今日费用: ¥0.2062                      ║
╠══════════════════════════════════════════════╣
║  📈 累计输入:              167,092 tokens     ║
║  📈 累计输出:                1,426 tokens     ║
║  💵 累计费用: ¥0.2062                       ║
╠══════════════════════════════════════════════╣
║  📉 近7天平均日消耗: ¥0.2062                 ║
╚══════════════════════════════════════════════╝

┌──────────────────────────────────────────────┐
│     🏦 账户健康度（多平台）                    │
├──────┬──────────┬──────────┬─────────┬───────┤
│ 平台 │ 充值总额 │ 今日消费 │ 当前余额│ 可用天│
├──────┼──────────┼──────────┼─────────┼───────┤
│ zhipu│ ¥200.00  │ ¥0.2062  │ ¥45.47  │ ~219天│
│ kimi │ ¥100.00  │ ¥0.0000  │ ¥87.89  │ ~426天│
└──────┴──────────┴──────────┴─────────┴───────┘
```

## Cost Calculation

### GLM-5V-Turbo Pricing (default)

- Input: ¥1.2 per 1M tokens
- Output: ¥4 per 1M tokens

### Formula

```javascript
costInput = (inputTokens * 1.2) / 1000000
costOutput = (outputTokens * 4) / 1000000
totalCost = costInput + costOutput
```

## Changelog

### v2.0 (2026-04-17)
- ✅ Multi-platform support (Zhipu, Kimi, OpenAI, etc.)
- ✅ Added 充值总额 (totalTopUp) field per platform
- ✅ Added 今日消费金额 (todayCost) field per platform
- ✅ Upgraded report format with account health table
- ✅ Backward compatible with v1 data format (auto-migration)
- ✅ Updated `update-balance.js` for multi-platform CLI

### v1.0 (Initial)
- Single-platform (Zhipu only)
- Basic token counting and cost calculation
