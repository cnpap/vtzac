import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController } from '../src/ast'
import { generateHttpJavaScriptClass } from '../src/generate-http'

describe('plugin Code Generation', () => {
  it('should generate JavaScript class from NestJS controller', () => {
    const testControllerPath = path.resolve(__dirname, '../playground/src/backend/test-input.controller.ts')

    // 分析控制器
    const analysisResult = analyzeNestJSController(testControllerPath)

    // 生成JavaScript代码
    const generatedCode = generateHttpJavaScriptClass(analysisResult)

    // 将生成的代码写入根目录 demo 文件夹
    const outputDir = path.resolve(__dirname, '../demo')
    fs.mkdirSync(outputDir, { recursive: true })
    const controllerName = analysisResult.controllers[0]?.name ?? 'GeneratedController'
    const outputFile = path.join(outputDir, `${controllerName}.js`)
    fs.writeFileSync(outputFile, generatedCode, 'utf-8')

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('import _api from \'vtzac/fetch\';')
    expect(generatedCode).toContain('class TestInputController')
    expect(generatedCode).toContain('testNamedQuery(options, ...args)')
    expect(generatedCode).toContain('testQueryObject(options, ...args)')
    expect(generatedCode).toContain('testNamedParam(options, ...args)')
    expect(generatedCode).toContain('testParamObject(options, ...args)')
    expect(generatedCode).toContain('testMixedParam(options, ...args)')
    expect(generatedCode).toContain('testHeaders(options, ...args)')
    expect(generatedCode).toContain('testSingleFileUpload(options, ...args)')
    expect(generatedCode).toContain('testMultipleFileUpload(options, ...args)')
    expect(generatedCode).toContain('testNamedMultipleFileUpload(options, ...args)')
    expect(generatedCode).toContain('testComplex(options, ...args)')
    expect(generatedCode).toContain('testDeleteMethod(options, ...args)')

    // 验证生成的代码不包含TypeScript类型
    expect(generatedCode).not.toContain(': string')
    expect(generatedCode).not.toContain(': any')
    expect(generatedCode).not.toContain('Express.Multer.File')
    expect(generatedCode).not.toContain(': Request')
    expect(generatedCode).not.toContain(': Response')

    // 验证生成的代码调用 _api 函数
    expect(generatedCode).toContain('return _api(')
    expect(generatedCode).toContain(', args);')
    expect(generatedCode).toContain('\'method\': \'GET\'')
    expect(generatedCode).toContain('\'method\': \'POST\'')
    expect(generatedCode).toContain('\'method\': \'PUT\'')
    expect(generatedCode).toContain('\'method\': \'DELETE\'')

    // 验证参数装饰器信息被正确传递
    expect(generatedCode).toContain('\'decorator\': \'Query\'')
    expect(generatedCode).toContain('\'decorator\': \'Param\'')
    expect(generatedCode).toContain('\'decorator\': \'Body\'')
    expect(generatedCode).toContain('\'decorator\': \'Headers\'')
    expect(generatedCode).toContain('\'decorator\': \'UploadedFile\'')
    expect(generatedCode).toContain('\'decorator\': \'UploadedFiles\'')

    // 验证装饰器参数被正确传递
    expect(generatedCode).toContain('\'key\': \'page\'')
    expect(generatedCode).toContain('\'key\': \'userId\'')
    expect(generatedCode).toContain('\'key\': \'authorization\'')

    // 验证文件上传信息被正确传递
    expect(generatedCode).toContain('fileUpload')
    expect(generatedCode).toContain('\'type\': \'single\'')
    expect(generatedCode).toContain('\'type\': \'multiple\'')
    expect(generatedCode).toContain('\'type\': \'named-multiple\'')
  })
})
