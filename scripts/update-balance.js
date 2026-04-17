// 更新账户余额 v2.0 - 多平台支持
// 用法:
//   node update-balance.js <platform> <balance> [totalTopUp]
// 示例:
//   node update-balance.js zhipu 45.47 200
//   node update-balance.js kimi 87.89 100

const fs = require('fs');
const path = require('path');

const balanceFile = path.join(__dirname, '..', '..', '..', 'memory', 'zhipu-balance.json');

if (process.argv.length < 4) {
  console.log('用法: node update-balance.js <platform> <balance> [totalTopUp]');
  console.log('');
  console.log('参数:');
  console.log('  platform    平台名称 (zhipu / kimi / openai)');
  console.log('  balance     当前余额 (数字)');
  console.log('  totalTopUp  充值总额 (可选，首次设置时必填)');
  console.log('');
  console.log('示例:');
  console.log('  node update-balance.js zhipu 45.47 200');
  console.log('  node update-balance.js kimi 87.89 100');
  process.exit(1);
}

const platform = process.argv[2].toLowerCase();
const newBalance = parseFloat(process.argv[3]);
const newTopUp = process.argv[4] ? parseFloat(process.argv[4]) : null;

if (isNaN(newBalance)) {
  console.error('错误: 余额必须是数字');
  process.exit(1);
}

// 读取或初始化数据
let data = { platforms: {}, warningThresholdDays: 2 };
if (fs.existsSync(balanceFile)) {
  try {
    data = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
    // 兼容v1格式
    if (!data.platforms && data.balance !== undefined) {
      data.platforms = { zhipu: { balance: data.balance, totalTopUp: data.totalTopUp || 0, lastUpdate: data.lastUpdate || '' } };
      delete data.balance;
      delete data.totalTopUp;
      delete data.lastUpdate;
    }
  } catch(e) {}
}

if (!data.platforms[platform]) {
  data.platforms[platform] = { balance: 0, totalTopUp: 0, lastUpdate: '', todayCost: 0 };
}

data.platforms[platform].balance = newBalance;
data.platforms[platform].lastUpdate = new Date().toISOString();
if (newTopUp !== null) {
  data.platforms[platform].totalTopUp = newTopUp;
}

fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2), 'utf8');

const p = data.platforms[platform];
console.log(`✅ [${platform}] 余额已更新`);
console.log(`   当前余额: ¥${p.balance.toFixed(2)}`);
console.log(`   充值总额: ¥${p.totalTopUp.toFixed(2)}`);
console.log(`   更新时间: ${p.lastUpdate}`);
