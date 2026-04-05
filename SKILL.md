---
name: token-monitor
description: Monitor and track LLM API token usage, costs, and account balance. Automatically calculate daily consumption, predict remaining days based on balance, and warn when balance is insufficient (default: less than 2 days). Use when asked about token statistics, usage costs, balance checking, or setting up usage monitoring for OpenClaw/LLM services.
---

# Token Monitor

A system for monitoring LLM API token usage, calculating costs, and warning when balance is low.

## Quick Start

### View Today's Usage

```bash
node C:\Users\danie\Documents\scripts\token-monitor.js
```

Output includes:
- Daily input/output tokens
- Daily cost (CNY)
- Cumulative cost
- Average daily consumption (7-day)
- Current balance
- Remaining days
- Warning if balance < 2 days

### Update Balance

```bash
node C:\Users\danie\Documents\scripts\update-balance.js <balance>
```

Example:
```bash
node update-balance.js 79.69
```

### Check Balance via Browser

Use OpenClaw browser automation to fetch balance from Zhipu AI console:

```javascript
// Navigate to: https://bigmodel.cn/finance-center/finance/overview
// Extract balance from page
```

## Architecture

### Files

```
C:\Users\danie\Documents\
├── scripts/
│   ├── token-monitor.js      # Main monitoring script
│   └── update-balance.js     # Balance update utility
└── memory/
    ├── token-usage.json      # Cumulative usage data
    ├── zhipu-balance.json    # Balance data
    └── token-daily/          # Daily log files
        └── YYYY-MM-DD.json   # Per-day records
```

### Data Structures

**token-usage.json**
```json
{
  "lastCheck": "2026-04-05",
  "totalTokensIn": 44540,
  "totalTokensOut": 893,
  "totalCost": 0.2185
}
```

**zhipu-balance.json**
```json
{
  "balance": 79.69,
  "lastUpdate": "2026-04-05T06:44:19.574Z",
  "warningThresholdDays": 2
}
```

**token-daily/YYYY-MM-DD.json**
```json
{
  "date": "2026-04-05",
  "inputTokens": 35117,
  "outputTokens": 146,
  "totalTokens": 35263,
  "costCNY": 0.0356,
  "cumulativeInput": 44540,
  "cumulativeOutput": 893
}
```

## Automated Monitoring

### Cron Job

A cron job runs daily at midnight (00:00 Asia/Shanghai) to:
1. Calculate daily token usage
2. Compute 7-day average consumption
3. Check balance vs. consumption
4. Warn if balance < threshold days

View cron job:
```bash
openclaw cron list
```

### Warning Threshold

Default: Warn when balance can support less than 2 days.

Modify in `zhipu-balance.json`:
```json
{
  "warningThresholdDays": 2
}
```

## Cost Calculation

### GLM-5 Pricing

- Input: ¥1 per 1M tokens
- Output: ¥3.2 per 1M tokens

### Formula

```javascript
costInput = (inputTokens * 1) / 1000000
costOutput = (outputTokens * 3.2) / 1000000
totalCost = costInput + costOutput
```

## Integration with OpenClaw

### Getting Token Stats

```bash
openclaw status --json
```

Returns session data including:
- `sessions.recent[0].inputTokens`
- `sessions.recent[0].outputTokens`
- `sessions.recent[0].totalTokens`

### Browser Profile

Login state is saved in `openclaw` browser profile:
- Location: `C:\Users\danie\.openclaw\browser\openclaw\user-data`
- Usage: `browser.start(profile="openclaw")`

## Extending for Other Providers

To add support for other LLM providers:

1. **Update pricing**: Modify cost calculation in `token-monitor.js`
2. **Add balance fetcher**: Create provider-specific balance extraction
3. **Update config**: Add provider selection in `zhipu-balance.json`

## Troubleshooting

### "Cannot get OpenClaw status"

Ensure OpenClaw gateway is running:
```bash
openclaw gateway status
```

### Balance Not Updating

1. Run `update-balance.js` manually with current balance
2. Or use browser automation to fetch from provider console

### Cron Job Not Running

Check cron status:
```bash
openclaw cron list
```

Verify job is enabled and check next run time.
