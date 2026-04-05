// 更新智谱账户余额
// 用法: node update-balance.js <余额>

const fs = require('fs');

const balanceFile = 'C:\\Users\\danie\\Documents\\memory\\zhipu-balance.json';

if (process.argv.length < 3) {
  console.log('用法: node update-balance.js <余额>');
  console.log('示例: node update-balance.js 100.50');
  process.exit(1);
}

const newBalance = parseFloat(process.argv[2]);
if (isNaN(newBalance)) {
  console.error('错误: 余额必须是数字');
  process.exit(1);
}

let balanceInfo = { balance: 0, warningThresholdDays: 2, currency: 'CNY' };
if (fs.existsSync(balanceFile)) {
  try {
    balanceInfo = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
  } catch (e) {}
}

balanceInfo.balance = newBalance;
balanceInfo.lastUpdate = new Date().toISOString();

fs.writeFileSync(balanceFile, JSON.stringify(balanceInfo, null, 2), 'utf8');

console.log(`✅ 余额已更新: ¥${newBalance.toFixed(2)}`);
console.log(`更新时间: ${balanceInfo.lastUpdate}`);
