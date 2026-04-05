# Token Monitor Skill for OpenClaw

🤖 **Monitor LLM API token usage, costs, and account balance with automatic warnings**

[![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-blue)](https://openclaw.ai)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/yourusername/token-monitor)

## Features

- ✅ **Daily Token Tracking** - Automatically track input/output tokens and costs
- ✅ **Cost Calculation** - Calculate daily and cumulative costs (CNY/USD)
- ✅ **Balance Monitoring** - Monitor account balance from LLM providers
- ✅ **Smart Warnings** - Alert when balance is insufficient (default: < 2 days)
- ✅ **Browser Automation** - Auto-fetch balance from provider console
- ✅ **Historical Records** - Daily logs for trend analysis

## Quick Start

### Installation

1. Copy the skill folder to your OpenClaw skills directory:
```bash
cp -r token-monitor ~/Documents/skills/
```

2. Copy scripts to your workspace:
```bash
cp -r scripts/* ~/Documents/scripts/
```

3. Restart OpenClaw:
```bash
openclaw gateway restart
```

### Usage

#### Method 1: Ask Your AI Assistant (Recommended)

Just ask naturally:
- "What's my token usage today?"
- "How much did I spend on tokens?"
- "Check my account balance"

#### Method 2: Run Script Directly

```bash
node ~/Documents/scripts/token-monitor.js
```

#### Method 3: Update Balance

```bash
node ~/Documents/scripts/update-balance.js 79.69
```

## Configuration

### Cron Job (Automatic Daily Report)

The skill automatically runs at midnight daily. View scheduled jobs:
```bash
openclaw cron list
```

### Warning Threshold

Default: Warn when balance < 2 days remaining.

Edit `memory/zhipu-balance.json`:
```json
{
  "warningThresholdDays": 2
}
```

## Supported Providers

### Current
- **Zhipu AI (智谱)** - GLM-4/5 series models

### Adding More Providers

The skill is extensible. To add support for other providers:

1. Update pricing in `scripts/token-monitor.js`
2. Add balance fetcher for your provider
3. Configure in `memory/zhipu-balance.json`

## Cost Calculation

### GLM-5 Pricing
- Input: ¥1 per 1M tokens
- Output: ¥3.2 per 1M tokens

### Formula
```javascript
cost = (inputTokens * 1 + outputTokens * 3.2) / 1,000,000
```

## Project Structure

```
token-monitor/
├── SKILL.md                    # Skill definition (required)
├── scripts/
│   ├── token-monitor.js        # Main monitoring script
│   └── update-balance.js       # Balance update utility
├── references/
│   ├── usage-guide.md          # Detailed usage guide
│   └── development-report.md   # Development documentation
└── README.md                   # This file
```

## Data Files

| File | Purpose |
|------|---------|
| `memory/token-usage.json` | Cumulative statistics |
| `memory/zhipu-balance.json` | Account balance |
| `memory/token-daily/YYYY-MM-DD.json` | Daily records |

## Example Output

```
=== Token使用日报 (2026-04-05) ===
今日输入: 35,117 tokens
今日输出: 146 tokens
今日总计: 35,263 tokens
今日费用: ¥0.0356
累计费用: ¥0.2185
---
近7天平均日消耗: ¥0.0356
当前账户余额: ¥79.69
余额可支撑: 2,238 天
=============================
```

## Development Cost

This skill was developed with:
- **Input Tokens**: 45,000
- **Output Tokens**: 893
- **Total Cost**: ¥0.22 (~$0.05)
- **Development Time**: ~1 hour

## Requirements

- OpenClaw 2026.4.0+
- Node.js 14+
- OpenClaw Browser (for auto-fetching balance)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Ideas for Contributions
- Support for more LLM providers (OpenAI, Anthropic, etc.)
- Web dashboard for visualization
- Email/notification integration
- Cost prediction based on usage trends

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

Created by **大白 (Dabai)** - An AI assistant powered by OpenClaw

## Links

- [OpenClaw Documentation](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Skill Hub](https://clawhub.ai)

---

**Made with ❤️ by OpenClaw Community**
