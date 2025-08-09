const fs = require('fs');
const path = require('path');

/**
 * 遍历目录并合并所有JSON文件
 * @param {string} directoryPath - 目录路径
 * @returns {Object} 合并后的JSON对象
 */
function mergeJsonFiles(directoryPath) {
  const result = {};
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`目录不存在: ${directoryPath}`);
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(directoryPath);
    
    // 过滤出.json文件
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    
    console.log(`找到 ${jsonFiles.length} 个JSON文件`);
    
    // 遍历每个JSON文件
    jsonFiles.forEach(fileName => {
      try {
        const filePath = path.join(directoryPath, fileName);
        
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // 解析JSON内容
        const jsonContent = JSON.parse(fileContent);
        
        // 使用文件名（去掉.json扩展名）作为key
        const key = path.basename(fileName, '.json');
        
        // 添加到结果对象中
        result[key] = jsonContent;
        
        console.log(`✓ 已处理: ${fileName}`);
        
      } catch (fileError) {
        console.error(`处理文件 ${fileName} 时出错:`, fileError.message);
        // 继续处理其他文件，不中断整个过程
      }
    });
    
  } catch (error) {
    console.error('处理目录时出错:', error.message);
    throw error;
  }
  
  return result;
}

/**
 * 将合并结果保存到文件
 * @param {Object} data - 要保存的数据
 * @param {string} outputPath - 输出文件路径
 */
function saveToFile(data, outputPath) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf8');
    console.log(`✓ 结果已保存到: ${outputPath}`);
  } catch (error) {
    console.error('保存文件时出错:', error.message);
    throw error;
  }
}

// 主函数
function main() {
  // 配置参数
  const inputDirectory = './draw'; // 输入目录路径
  const outputFile = './draw_data.json'; // 输出文件路径
  
  try {
    console.log('开始处理JSON文件...');
    console.log(`输入目录: ${inputDirectory}`);
    
    // 合并JSON文件
    const mergedData = mergeJsonFiles(inputDirectory);
    
    console.log(`\n合并完成，共处理 ${Object.keys(mergedData).length} 个文件`);
    
    // 保存结果
    saveToFile(mergedData, outputFile);
    
    // 显示结果预览
    console.log('\n合并结果预览:');
    console.log(JSON.stringify(mergedData, null, 2).substring(0, 500) + '...');
    
  } catch (error) {
    console.error('脚本执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
module.exports = {
  mergeJsonFiles,
  saveToFile
};