# 开始使用 vtzac

欢迎使用 vtzac！这是一个专为 Vite + NestJS 全栈开发设计的工具，能够自动生成前端 API 客户端代码，实现前后端类型安全的无缝集成。

## 什么是 vtzac？

vtzac 提供了一套完整的解决方案，让你可以：

- 🚀 **极低学习成本** - 基于熟悉的 Vite 和 NestJS 技术栈
- 🔒 **类型安全** - 自动生成类型安全的前端 API 客户端
- 🎯 **一体化开发** - 在同一个项目中同时开发前端和后端
- ⚡ **开发效率** - 自动同步 API 变更，无需手动维护接口文档

## 文档导航

### 🏗️ 集成指南

#### [【步骤 1】NestJS 集成](/nestjs-integration)
详细介绍如何在项目中集成 NestJS 后端，包括：
- 项目结构设置
- 依赖安装和配置
- TypeScript 配置
- 开发和构建流程

#### [【步骤 2】Vite 插件集成](/vite-plugin-integration)
了解如何配置 vtzac Vite 插件：
- 插件安装和基本配置
- glob 模式配置
- 自动生成 API 客户端代码

### 📚 使用指南

#### [参数处理用例](/guide/params-usage)
学习如何处理各种类型的 API 参数：
- 无参数接口
- 路径参数 (`@Param`)
- 查询参数 (`@Query`)
- 请求体参数 (`@Body`)
- 组合参数使用

#### [文件上传用例](/guide/file-upload-usage)
掌握文件上传功能的实现：
- 单文件上传
- 多文件上传
- 文件上传与其他参数组合
- 前端文件选择和上传

#### [注意事项](/guide/notes)
重要的开发注意事项和最佳实践：
- 参数顺序最佳实践
- Headers 参数处理
- 类型安全建议
- 性能优化提示

### 🔧 故障排除

#### [常见问题与解决方案](/troubleshooting)
遇到问题时的解决指南：
- 装饰器相关错误
- TypeScript 配置问题
- 依赖注入问题
- 构建和运行时错误

## 下一步

- 如果你是第一次使用，建议从 [NestJS 集成](/nestjs-integration) 开始
- 如果你已经在 Vite 项目中集成了 NestJS，可以直接查看 [Vite 插件集成](/vite-plugin-integration)
- 想了解具体用法，可以查看 [使用指南](/guide/params-usage) 部分
- 遇到问题时，请参考 [故障排除](/troubleshooting) 文档

开始你的 vtzac 全栈开发之旅吧！🎉
