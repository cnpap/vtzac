# Getting Started with vtzac

Welcome to vtzac! This is a tool specifically designed for Vite + NestJS full-stack development that automatically generates frontend API client code, enabling seamless type-safe integration between frontend and backend.

## What is vtzac?

vtzac provides a complete solution that allows you to:

- 🚀 **Minimal Learning Curve** - Built on familiar Vite and NestJS technology stack
- 🔒 **Type Safety** - Automatically generates type-safe frontend API clients
- 🎯 **Unified Development** - Develop both frontend and backend in the same project
- ⚡ **Development Efficiency** - Automatically sync API changes without manual interface documentation maintenance

## Documentation Navigation

### 🏗️ Integration Guide

#### [Step 1: NestJS Integration](/nestjs-integration)

Detailed guide on integrating NestJS backend in your project, including:

- Project structure setup
- Dependency installation and configuration
- TypeScript configuration
- Development and build process

#### [Step 2: Vite Plugin Integration](/vite-plugin-integration)

Learn how to configure the vtzac Vite plugin:

- Plugin installation and basic configuration
- Glob pattern configuration
- Automatic API client code generation

### 📚 Usage Guide

#### [Parameter Handling Examples](/guide/params-usage)

Learn how to handle various types of API parameters:

- No-parameter interfaces
- Path parameters (`@Param`)
- Query parameters (`@Query`)
- Request body parameters (`@Body`)
- Combined parameter usage

#### [File Upload Examples](/guide/file-upload-usage)

Master file upload functionality implementation:

- Single file upload
- Multiple file upload
- File upload combined with other parameters
- Frontend file selection and upload

#### [Important Notes](/guide/notes)

Important development considerations and best practices:

- Parameter order best practices
- Headers parameter handling
- Type safety recommendations
- Performance optimization tips

### 🔧 Troubleshooting

#### [Common Issues and Solutions](/troubleshooting)

Problem-solving guide when encountering issues:

- Decorator-related errors
- TypeScript configuration issues
- Dependency injection problems
- Build and runtime errors

## Next Steps

- If you're using this for the first time, we recommend starting with [NestJS Integration](/nestjs-integration)
- If you've already integrated NestJS in your Vite project, you can directly check [Vite Plugin Integration](/vite-plugin-integration)
- To understand specific usage, check the [Usage Guide](/guide/params-usage) section
- When encountering problems, please refer to the [Troubleshooting](/troubleshooting) documentation

Start your vtzac full-stack development journey! 🎉
