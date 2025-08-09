const fs = require('fs');

// 读取原始 JSON 文件（格式化过的）
const data = fs.readFileSync('voice_data.json', 'utf8');
const jsonObj = JSON.parse(data);

// 将 JSON 重新序列化为无空格、无换行的紧凑格式
const minifiedJson = JSON.stringify(jsonObj);

// 写入新文件
fs.writeFileSync('voice_data.min.json', minifiedJson);

console.log('JSON 已压缩保存到 voice_data.min.json');