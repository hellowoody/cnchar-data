const fs = require('fs');
const path = require('path');

/**
 * 遍历目录并将MP3文件转换为base64格式
 * @param {string} directoryPath - 目录路径
 * @returns {Object} 包含base64编码的JSON对象
 */
function convertMp3FilesToBase64(directoryPath) {
  const result = {};
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`目录不存在: ${directoryPath}`);
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(directoryPath);
    
    // 过滤出.mp3文件
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
    
    console.log(`找到 ${mp3Files.length} 个MP3文件`);
    
    // 遍历每个MP3文件
    mp3Files.forEach(fileName => {
      try {
        const filePath = path.join(directoryPath, fileName);
        
        // 获取文件信息
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`正在处理: ${fileName} (${fileSizeMB}MB)`);
        
        // 读取文件内容为Buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        // 转换为base64
        const base64String = fileBuffer.toString('base64');
        
        // 使用文件名（去掉.mp3扩展名）作为key
        const key = path.basename(fileName, '.mp3');
        
        // 添加到结果对象中，包含base64数据和元信息
        result[key] = {
          data: base64String,
          originalName: fileName,
          size: stats.size,
          sizeMB: parseFloat(fileSizeMB),
          mimeType: 'audio/mpeg',
          encoding: 'base64'
        };
        
        console.log(`✓ 已处理: ${fileName} -> ${key}`);
        
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
    
    // 显示文件大小信息
    const outputStats = fs.statSync(outputPath);
    const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
    console.log(`输出文件大小: ${outputSizeMB}MB`);
    
  } catch (error) {
    console.error('保存文件时出错:', error.message);
    throw error;
  }
}

/**
 * 计算总文件大小和统计信息
 * @param {Object} data - 处理后的数据
 * @returns {Object} 统计信息
 */
function getStatistics(data) {
  const files = Object.keys(data);
  const totalSizeMB = files.reduce((sum, key) => sum + data[key].sizeMB, 0);
  const avgSizeMB = files.length > 0 ? (totalSizeMB / files.length).toFixed(2) : 0;
  
  return {
    totalFiles: files.length,
    totalSizeMB: totalSizeMB.toFixed(2),
    averageSizeMB: parseFloat(avgSizeMB),
    fileKeys: files
  };
}

/**
 * 从base64恢复MP3文件（用于测试）
 * @param {Object} data - 包含base64数据的对象
 * @param {string} key - 要恢复的文件key
 * @param {string} outputDir - 输出目录
 */
function restoreMp3FromBase64(data, key, outputDir = './restored') {
  try {
    if (!data[key]) {
      throw new Error(`找不到key: ${key}`);
    }
    
    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const fileData = data[key];
    const buffer = Buffer.from(fileData.data, 'base64');
    const outputPath = path.join(outputDir, fileData.originalName);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ 已恢复文件: ${outputPath}`);
    
  } catch (error) {
    console.error('恢复文件时出错:', error.message);
  }
}

// 主函数
function main() {
  // 配置参数
  const inputDirectory = './voice'; // 输入目录路径
  const outputFile = './voice_data.json'; // 输出文件路径
  
  try {
    console.log('开始处理MP3文件...');
    console.log(`输入目录: ${inputDirectory}`);
    console.log('警告: MP3文件转base64会占用大量内存和存储空间\n');
    
    // 转换MP3文件
    const convertedData = convertMp3FilesToBase64(inputDirectory);
    
    // 获取统计信息
    const stats = getStatistics(convertedData);
    
    console.log('\n=== 处理统计 ===');
    console.log(`处理文件数: ${stats.totalFiles}`);
    console.log(`总文件大小: ${stats.totalSizeMB}MB`);
    console.log(`平均文件大小: ${stats.averageSizeMB}MB`);
    console.log(`文件列表: ${stats.fileKeys.join(', ')}`);
    
    // 保存结果
    saveToFile(convertedData, outputFile);
    
    // 显示结果预览（只显示结构，不显示base64数据）
    const preview = {};
    Object.keys(convertedData).forEach(key => {
      preview[key] = {
        originalName: convertedData[key].originalName,
        sizeMB: convertedData[key].sizeMB,
        mimeType: convertedData[key].mimeType,
        dataLength: convertedData[key].data.length
      };
    });
    
    console.log('\n=== 结果预览 ===');
    console.log(JSON.stringify(preview, null, 2));
    
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
  convertMp3FilesToBase64,
  saveToFile,
  getStatistics,
  restoreMp3FromBase64
};