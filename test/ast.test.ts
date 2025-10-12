import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController, getFileParameterInfo } from '../src/ast'

describe('aST Analysis', () => {
  const testControllerPath = path.resolve(__dirname, '../examples/nestjs-example/src/test-input.controller.ts')

  it('should analyze basic controller information', () => {
    const result = analyzeNestJSController(testControllerPath)

    expect(result.controllers).toHaveLength(1)

    const controller = result.controllers[0]
    expect(controller.name).toBe('TestInputController')
    expect(controller.prefix).toBe('api/test')
    expect(controller.methods.length).toBeGreaterThan(0)
  })

  it('should analyze HTTP methods and routes', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 检查是否有 GET 方法
    const getMethods = controller.methods.filter(m => m.httpMethod === 'GET')
    expect(getMethods.length).toBeGreaterThan(0)

    // 检查是否有 POST 方法
    const postMethods = controller.methods.filter(m => m.httpMethod === 'POST')
    expect(postMethods.length).toBeGreaterThan(0)

    // 检查路径
    const methodWithPath = controller.methods.find(m => m.path)
    expect(methodWithPath).toBeDefined()
  })

  it('should analyze @Query decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有 @Query 装饰器的方法
    const methodWithQuery = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Query')),
    )

    expect(methodWithQuery).toBeDefined()

    if (methodWithQuery) {
      const queryParam = methodWithQuery.parameters.find(p =>
        p.decorators.some(d => d.name === 'Query'),
      )
      expect(queryParam).toBeDefined()
    }
  })

  it('should analyze @Param decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有 @Param 装饰器的方法
    const methodWithParam = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Param')),
    )

    expect(methodWithParam).toBeDefined()

    if (methodWithParam) {
      const paramParam = methodWithParam.parameters.find(p =>
        p.decorators.some(d => d.name === 'Param'),
      )
      expect(paramParam).toBeDefined()
    }
  })

  it('should analyze @Body decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有 @Body 装饰器的方法
    const methodWithBody = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Body')),
    )

    expect(methodWithBody).toBeDefined()

    if (methodWithBody) {
      const bodyParam = methodWithBody.parameters.find(p =>
        p.decorators.some(d => d.name === 'Body'),
      )
      expect(bodyParam).toBeDefined()
    }
  })

  it('should analyze @Headers decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有 @Headers 装饰器的方法
    const methodWithHeaders = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Headers')),
    )

    expect(methodWithHeaders).toBeDefined()

    if (methodWithHeaders) {
      const headersParam = methodWithHeaders.parameters.find(p =>
        p.decorators.some(d => d.name === 'Headers'),
      )
      expect(headersParam).toBeDefined()
    }
  })

  it('should analyze single file upload', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找单文件上传方法
    const singleFileMethod = controller.methods.find(m => m.name === 'testSingleFileUpload')
    expect(singleFileMethod).toBeDefined()

    if (singleFileMethod) {
      const fileInfo = getFileParameterInfo(singleFileMethod)
      expect(fileInfo).toBeDefined()
      expect(fileInfo!.uploadType).toBe('single')
      expect(fileInfo!.parameterName).toBe('_file')
      expect(fileInfo!.parameterType).toBe('Express.Multer.File')
      expect(fileInfo!.fileFields).toHaveLength(1)
      expect(fileInfo!.fileFields[0].fieldName).toBe('file')
      expect(fileInfo!.fileFields[0].isArray).toBe(false)
    }
  })

  it('should analyze multiple file upload', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找多文件上传方法
    const multipleFileMethod = controller.methods.find(m => m.name === 'testMultipleFileUpload')
    expect(multipleFileMethod).toBeDefined()

    if (multipleFileMethod) {
      const fileInfo = getFileParameterInfo(multipleFileMethod)
      expect(fileInfo).toBeDefined()
      expect(fileInfo!.uploadType).toBe('multiple')
      expect(fileInfo!.parameterName).toBe('_files')
      expect(fileInfo!.parameterType).toBe('Express.Multer.File[]')
      expect(fileInfo!.fileFields).toHaveLength(1)
      expect(fileInfo!.fileFields[0].fieldName).toBe('files')
      expect(fileInfo!.fileFields[0].isArray).toBe(true)
      expect(fileInfo!.fileFields[0].maxCount).toBe(5)
    }
  })

  it('should analyze named multiple file upload', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找具名多文件上传方法
    const namedMultipleMethod = controller.methods.find(m => m.name === 'testNamedMultipleFileUpload')
    expect(namedMultipleMethod).toBeDefined()

    if (namedMultipleMethod) {
      const fileInfo = getFileParameterInfo(namedMultipleMethod)
      expect(fileInfo).toBeDefined()
      expect(fileInfo!.uploadType).toBe('named-multiple')
      expect(fileInfo!.parameterName).toBe('_files')
      expect(fileInfo!.parameterType).toContain('documents?: Express.Multer.File[]')
      expect(fileInfo!.parameterType).toContain('images?: Express.Multer.File[]')
      expect(fileInfo!.fileFields).toHaveLength(2)

      // 检查 documents 字段
      const documentsField = fileInfo!.fileFields.find(f => f.fieldName === 'documents')
      expect(documentsField).toBeDefined()
      expect(documentsField!.isArray).toBe(true)
      expect(documentsField!.maxCount).toBe(3)

      // 检查 images 字段
      const imagesField = fileInfo!.fileFields.find(f => f.fieldName === 'images')
      expect(imagesField).toBeDefined()
      expect(imagesField!.isArray).toBe(true)
      expect(imagesField!.maxCount).toBe(2)
    }
  })

  it('should return null for methods without file upload', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找没有文件上传的方法
    const nonFileMethod = controller.methods.find(m => m.name === 'testNamedQuery')
    expect(nonFileMethod).toBeDefined()

    if (nonFileMethod) {
      const fileInfo = getFileParameterInfo(nonFileMethod)
      expect(fileInfo).toBeNull()
    }
  })

  it('should analyze @Req and @Res decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有 @Req 装饰器的方法
    const methodWithReq = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Req')),
    )

    // 查找有 @Res 装饰器的方法
    const methodWithRes = controller.methods.find(m =>
      m.parameters.some(p => p.decorators.some(d => d.name === 'Res')),
    )

    // 至少应该有一个
    expect(methodWithReq || methodWithRes).toBeTruthy()
  })

  it('should analyze complex method with multiple decorators', () => {
    const result = analyzeNestJSController(testControllerPath)
    const controller = result.controllers[0]

    // 查找有多个装饰器的方法
    const complexMethod = controller.methods.find(m =>
      m.parameters.length > 2
      && m.parameters.some(p => p.decorators.length > 0),
    )

    expect(complexMethod).toBeDefined()

    if (complexMethod) {
      expect(complexMethod.parameters.length).toBeGreaterThan(1)

      // 检查是否有装饰器参数
      const decoratedParam = complexMethod.parameters.find(p => p.decorators.length > 0)
      expect(decoratedParam).toBeDefined()
    }
  })
})
