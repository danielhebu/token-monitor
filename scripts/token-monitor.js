// Token使用监控脚本 v2.0 - 多平台支持
// 新增：充值总额、今日消费金额（按平台）
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = 'C:\\Users\\11\\.openclaw\\workspace';
const tokenLogFile = path.join(basePath, 'memory', 'token-usage.json');
const dailyLogPath = path.join(basePath, 'memory', 'token-daily');
const balanceFile = path.join(basePath, 'memory', 'zhipu-balance.json');

if (!fs.existsSync(dailyLogPath)) fs.mkdirSync(dailyLogPath, { recursive: true });

const today = new Date().toISOString().slice(0, 10);

// ─── 1. 获取OpenClaw Session状态 ───
let status;
try {
  const statusJson = execSync('openclaw status --json', { encoding: 'utf8' });
  status = JSON.parse(statusJson);
} catch (e) {
  console.error('无法获取OpenClaw状态:', e.message);
  process.exit(1);
}

const session = status.sessions?.recent?.[0];
if (!session) { console.error('没有找到活跃的session'); process.exit(1); }

const currentInput = session.inputTokens || 0;
const currentOutput = session.outputTokens || 0;
const currentTotal = session.totalTokens || 0;

// ─── 2. 读取历史数据，计算今日增量 ───
let prevData = { totalTokensIn: 0, totalTokensOut: 0, totalCost: 0 };
if (fs.existsSync(tokenLogFile)) {
  try { prevData = JSON.parse(fs.readFileSync(tokenLogFile, 'utf8')); } catch(e) {}
}

const todayInput = Math.max(0, currentInput - prevData.totalTokensIn);
const todayOutput = Math.max(0, currentOutput - prevData.totalTokensOut);
const todayTotal = todayInput + todayOutput;

// 费用计算（GLM-5V-Turbo价格：input ¥1.2/M, output ¥4/M）
const costInput = Number((todayInput * 1.2 / 1000000).toFixed(4));
const costOutput = Number((todayOutput * 4 / 1000000).toFixed(4));
const todayCost = Number((costInput + costOutput).toFixed(4));

// ─── 3. 保存每日记录 ───
const dailyRecord = {
  date: today,
  inputTokens: todayInput,
  outputTokens: todayOutput,
  totalTokens: todayTotal,
  costCNY: todayCost,
  cumulativeInput: currentInput,
  cumulativeOutput: currentOutput
};
fs.writeFileSync(path.join(dailyLogPath, `${today}.json`), JSON.stringify(dailyRecord, null, 2), 'utf8');

const newData = {
  lastCheck: today,
  totalTokensIn: currentInput,
  totalTokensOut: currentOutput,
  totalCost: (prevData.totalCost || 0) + todayCost
};
fs.writeFileSync(tokenLogFile, JSON.stringify(newData, null, 2), 'utf8');

// ─── 4. 计算7天平均 ───
let avgDailyCost = todayCost;
try {
  const files = fs.readdirSync(dailyLogPath).filter(f => f.endsWith('.json')).sort().reverse().slice(0, 7);
  let tc = 0;
  for (const f of files) { const d = JSON.parse(fs.readFileSync(path.join(dailyLogPath, f), 'utf8')); tc += d.costCNY || 0; }
  if (files.length > 0) avgDailyCost = tc / files.length;
} catch(e) {}

// ─── 5. 读取多平台余额数据 ───
// zhipu-balance.json 结构 v2:
// {
//   "platforms": {
//     "zhipu": { "balance": 45.47, "totalTopUp": 200.00, "lastUpdate": "..." },
//     "kimi":  { "balance": 87.89, "totalTopUp": 100.00, "lastUpdate": "..." },
//     "openai":{ ... }
//   },
//   "warningThresholdDays": 2
// }

let platforms = {};
let warningThresholdDays = 2;

if (fs.existsSync(balanceFile)) {
  try {
    const raw = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
    // 兼容v1格式（单平台）和v2格式（多平台）
    if (raw.platforms) {
      platforms = raw.platforms;
      warningThresholdDays = raw.warningThresholdDays || 2;
    } else {
      // v1格式迁移
      platforms.zhipu = { balance: raw.balance || 0, totalTopUp: raw.totalTopUp || 0, lastUpdate: raw.lastUpdate || '' };
      warningThresholdDays = raw.warningThresholdDays || 2;
    }
  } catch(e) {}
}

// 确保至少有默认平台
if (!platforms.zhipu) platforms.zhipu = { balance: 0, totalTopUp: 0, lastUpdate: '', todayCost: 0 };
if (!platforms.kimi) platforms.kimi = { balance: 0, totalTopUp: 0, lastUpdate: '', todayCost: 0 };

// 计算各平台今日消费（按token比例分摊或直接取记录）
// 智谱为主力模型，Kimi为备用，这里按9:1比例估算
Object.keys(platforms).forEach(p => {
  if (platforms[p].todayCost === undefined) {
    platforms[p].todayCost = p === 'zhipu' ? todayCost : 0; // 后续可接入各平台API精确统计
  }
});

// ─── 6. 输出报告 ───
console.log(``);
console.log(`╔══════════════════════════════════════════════╗`);
console.log(`║       📊 Token 消费日报 (${today})            ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║                                              ║`);
console.log(`║  📥 今日输入 tokens: ${todayInput.toLocaleString().padStart(16)}          ║`);
console.log(`║  📤 今日输出 tokens: ${todayOutput.toLocaleString().padStart(16)}          ║`);
console.log(`║  🔢 今日总计 tokens: ${todayTotal.toLocaleString().padStart(15)}          ║`);
console.log(`║  💰 今日费用: ¥${todayCost.toFixed(4).padStart(18)}              ║`);
console.log(`║                                              ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  📈 累计输入: ${currentInput.toLocaleString().padStart(20)} tokens        ║`);
console.log(`║  📈 累计输出: ${currentOutput.toLocaleString().padStart(20)} tokens        ║`);
console.log(`║  💵 累计费用: ¥${newData.totalCost.toFixed(4).padStart(17)}             ║`);
console.log(`║                                              ║`);
console.log(`╠══════════════════════════════════════════════╣`);
console.log(`║  📉 近7天平均日消耗: ¥${avgDailyCost.toFixed(4).padStart(14)}           ║`);
console.log(`╚══════════════════════════════════════════════╝`);

console.log(``);
console.log(`┌──────────────────────────────────────────────┐`);
console.log(`│     🏦 账户健康度（多平台）                    │`);
console.log(`├──────┬──────────┬──────────┬─────────┬───────┤`);
console.log(`│ 平台 │ 充值总额 │ 今日消费 │ 当前余额│ 可用天│`);
console.log(`├──────┼──────────┼──────────┼─────────┼───────┤`);

let anyWarning = false;
Object.entries(platforms).forEach(([name, info]) => {
  const bal = info.balance || 0;
  const topUp = info.totalTopUp || 0;
  const tCost = info.todayCost || 0;
  const days = avgDailyCost > 0 ? Math.floor(bal / avgDailyCost) : 999;

  const namePad = name.padEnd(6);
  const topUpStr = `¥${topUp.toFixed(2)}`.padStart(8);
  const costStr = `¥${tCost.toFixed(4)}`.padStart(8);
  const balStr = `¥${bal.toFixed(2)}`.padStart(7);
  const daysStr = `${days}天`.padStart(4);

  console.log(`│ ${namePad} │ ${topUpStr} │ ${costStr} │ ${balStr} │ ${daysStr} │`);

  if (days < warningThresholdDays && avgDailyCost > 0) anyWarning = true;
});

console.log(`└──────┴──────────┴──────────┴─────────┴───────┘`);

if (anyWarning) {
  console.log(``);
  console.log(`  ⚠️  部分账户余额不足预警！请关注上方标记。`);
}

// ─── 7. 输出JSON供程序调用 ───
const result = {
  date: today,
  tokenUsage: {
    dailyInput: todayInput,
    dailyOutput: todayOutput,
    dailyTotal: todayTotal,
    dailyCost: todayCost,
    cumulativeInput: currentInput,
    cumulativeOutput: currentOutput,
    cumulativeCost: newData.totalCost,
    avgDailyCost: avgDailyCost
  },
  accountHealth: Object.fromEntries(
    Object.entries(platforms).map(([name, info]) => [
      name,
      {
        balance: info.balance || 0,
        totalTopUp: info.totalTopUp || 0,
        todayCost: info.todayCost || 0,
        lastUpdate: info.lastUpdate || '',
        remainingDays: avgDailyCost > 0 ? Math.floor((info.balance||0) / avgDailyCost) : 999
      }
    ])
  ),
  warning: anyWarning ? '部分账户余额不足' : null
};

console.log(`\n` + JSON.stringify(result, null, 2));
