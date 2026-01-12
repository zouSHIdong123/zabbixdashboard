#!/bin/bash

echo "Zabbix Dashboard 启动脚本"
echo "=========================="

# 检查是否安装了Python
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python3"
    exit 1
fi

echo "在当前目录启动简单HTTP服务器..."
echo "访问地址: http://localhost:8000"
echo "按 Ctrl+C 停止服务器"

# 启动HTTP服务器
python3 -m http.server 8000