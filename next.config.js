/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保开发服务器可以接受外部连接
  experimental: {
    // 允许来自任何主机的连接
  },
  // 如果需要，可以添加其他网络配置
}

module.exports = nextConfig