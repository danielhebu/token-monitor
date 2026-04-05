// Token使用监控脚本
// 每天午夜运行，记录token使用量并生成报告

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tokenLogFile = 'C:\\Users\\danie\\Documents\\memory\\token-usage.json';
const dailyLogPath = 'C:\\Users\\danie\\Documents\\memory\\token-daily';
const balanceFile = 'C:\\Users\\danie\\Documents\\memory\\zhipu-balance.json';

// 确保目录存在
if (!fs.existsSync(dailyLogPath)) {
  fs.mkdirSync(dailyLogPath, { recursive: true });
}

// 获取当前时间
const today = new Date().toISOString().slice(0, 10);

// 获取当前session状态
let status;
try {
  const statusJson = execSync('openclaw status --json', { encoding: 'utf8' });
  status = JSON.parse(statusJson);
} catch (e) {
  console.error('无法获取OpenClaw状态:', e.message);
  process.exit(1);
}

// 提取token使用情况
const session = status.sessions?.recent?.[0];
if (!session) {
  console.error('没有找到活跃的session');
  process.exit(1);
}

const currentInput = session.inputTokens || 0;
const currentOutput = session.outputTokens || 0;
const currentTotal = session.totalTokens || 0;

// 读取昨天的数据
let prevData = { totalTokensIn: 0, totalTokensOut: 0, totalCost: 0 };
if (fs.existsSync(tokenLogFile)) {
  try {
    prevData = JSON.parse(fs.readFileSync(tokenLogFile, 'utf8'));
  } catch (e) {
    console.log('无法读取历史数据，使用默认值');
  }
}

const prevInput = prevData.totalTokensIn || 0;
const prevOutput = prevData.totalTokensOut || 0;

// 计算今日增量
const todayInput = Math.max(0, currentInput - prevInput);
const todayOutput = Math.max(0, currentOutput - prevOutput);
const todayTotal = todayInput + todayOutput;

// 估算费用 (GLM-5: input ¥1/M tokens, output ¥3.2/M tokens)
const costInput = Number((todayInput * 1 / 1000000).toFixed(4));
const costOutput = Number((todayOutput * 3.2 / 1000000).toFixed(4));
const todayCost = Number((costInput + costOutput).toFixed(4));

// 保存每日记录
const dailyRecord = {
  date: today,
  inputTokens: todayInput,
  outputTokens: todayOutput,
  totalTokens: todayTotal,
  costCNY: todayCost,
  cumulativeInput: currentInput,
  cumulativeOutput: currentOutput
};

const dailyFile = path.join(dailyLogPath, `${today}.json`);
fs.writeFileSync(dailyFile, JSON.stringify(dailyRecord, null, 2), 'utf8');

// 更新累计数据
const newData = {
  lastCheck: today,
  totalTokensIn: currentInput,
  totalTokensOut: currentOutput,
  totalCost: (prevData.totalCost || 0) + todayCost
};
fs.writeFileSync(tokenLogFile, JSON.stringify(newData, null, 2), 'utf8');

// 计算最近7天平均日消耗
let avgDailyCost = todayCost;
const recentDays = [];
try {
  const files = fs.readdirSync(dailyLogPath).filter(f => f.endsWith('.json')).sort().reverse().slice(0, 7);
  let totalCost = 0;
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dailyLogPath, f), 'utf8'));
    totalCost += data.costCNY || 0;
    recentDays.push({ date: data.date, cost: data.costCNY });
  }
  if (files.length > 0) {
    avgDailyCost = totalCost / files.length;
  }
} catch (e) {
  console.log('无法读取历史每日数据');
}

// 读取余额信息
let balanceInfo = { balance: 0, warningThresholdDays: 2 };
if (fs.existsSync(balanceFile)) {
  try {
    balanceInfo = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
  } catch (e) {}
}

const balance = balanceInfo.balance || 0;
const warningDays = balanceInfo.warningThresholdDays || 2;

// 计算余额可支撑天数
const remainingDays = avgDailyCost > 0 ? Math.floor(balance / avgDailyCost) : 999;

// 判断是否需要提醒
let warning = null;
if (remainingDays < warningDays && avgDailyCost > 0) {
  warning = `⚠️ 余额不足！当前余额 ¥${balance.toFixed(2)}，按平均日消耗 ¥${avgDailyCost.toFixed(4)} 计算，仅够支撑 ${remainingDays} 天，请尽快充值！`;
}

// 输出报告
console.log(`=== Token使用日报 (${today}) ===`);
console.log(`今日输入: ${todayInput.toLocaleString()} tokens`);
console.log(`今日输出: ${todayOutput.toLocaleString()} tokens`);
console.log(`今日总计: ${todayTotal.toLocaleString()} tokens`);
console.log(`今日费用: ¥${todayCost.toFixed(4)}`);
console.log(`累计费用: ¥${newData.totalCost.toFixed(4)}`);
console.log(`---`);
console.log(`近7天平均日消耗: ¥${avgDailyCost.toFixed(4)}`);
console.log(`当前账户余额: ¥${balance.toFixed(2)}`);
console.log(`余额可支撑: ${remainingDays} 天`);
if (warning) {
  console.log(warning);
}
console.log(`=============================`);

// 返回JSON格式供OpenClaw读取
const result = {
  date: today,
  dailyInput: todayInput,
  dailyOutput: todayOutput,
  dailyTotal: todayTotal,
  dailyCost: todayCost,
  cumulativeInput: currentInput,
  cumulativeOutput: currentOutput,
  cumulativeCost: newData.totalCost,
  avgDailyCost: avgDailyCost,
  balance: balance,
  remainingDays: remainingDays,
  warning: warning,
  recentDays: recentDays
};
console.log(JSON.stringify(result));
