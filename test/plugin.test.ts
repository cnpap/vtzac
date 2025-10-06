import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController } from '../src/ast'
import { generateJavaScriptClass } from '../src/plugin'

describe('plugin Code Generation', () => {
  it('should generate JavaScript class from NestJS controller', () => {
    const testControllerPath = path.resolve(__dirname, '../src/backend/test-input.controller.ts')

    // 分析控制器
    const analysisResult = analyzeNestJSController(testControllerPath)

    // 生成JavaScript代码
    const generatedCode = generateJavaScriptClass(analysisResult)

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('import httpZac from \'virtual:http-zac\';')
    expect(generatedCode).toContain('class TestInputController')
    expect(generatedCode).toContain('testNamedQuery(...args)')
    expect(generatedCode).toContain('testQueryObject(...args)')
    expect(generatedCode).toContain('testNamedParam(...args)')
    expect(generatedCode).toContain('testParamObject(...args)')
    expect(generatedCode).toContain('testMixedParam(...args)')
    expect(generatedCode).toContain('testHeaders(...args)')
    expect(generatedCode).toContain('testSingleFileUpload(...args)')
    expect(generatedCode).toContain('testMultipleFileUpload(...args)')
    expect(generatedCode).toContain('testNamedMultipleFileUpload(...args)')
    expect(generatedCode).toContain('testComplex(...args)')
    expect(generatedCode).toContain('testDeleteMethod(...args)')

    // 验证生成的代码不包含TypeScript类型
    expect(generatedCode).not.toContain(': string')
    expect(generatedCode).not.toContain(': any')
    expect(generatedCode).not.toContain('Express.Multer.File')
    expect(generatedCode).not.toContain(': Request')
    expect(generatedCode).not.toContain(': Response')

    // 验证生成的代码调用 httpZac 函数
    expect(generatedCode).toContain('return httpZac(')
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
