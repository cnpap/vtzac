import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController, analyzeNestJSControllerFromCode } from '../src/ast'
import { generateSocketJavaScriptClass } from '../src/generate-socket'

describe('socket.IO Code Generation', () => {
  it('should generate JavaScript class from NestJS Gateway', () => {
    const testGatewayPath = path.resolve(__dirname, '../playground/src/backend/ask.gateway.ts')

    // 分析 Gateway
    const analysisResult = analyzeNestJSController(testGatewayPath)

    // 生成JavaScript代码
    const generatedCode = generateSocketJavaScriptClass(analysisResult)

    // 将生成的代码写入根目录 demo 文件夹
    const outputDir = path.resolve(__dirname, '../demo')
    fs.mkdirSync(outputDir, { recursive: true })
    const gatewayName = analysisResult.gateways[0]?.name ?? 'GeneratedGateway'
    const outputFile = path.join(outputDir, `${gatewayName}.js`)
    fs.writeFileSync(outputFile, generatedCode, 'utf-8')

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('import _socket from \'vtzac/socket\';')
    expect(generatedCode).toContain('class AskGateway')

    // 验证生成的方法
    expect(generatedCode).toContain('handleAskServer(options, ...args)')
    expect(generatedCode).toContain('handleAskServerWithCallback(options, ...args)')
    expect(generatedCode).toContain('handleTriggerServerAsk(options, ...args)')
    expect(generatedCode).toContain('handleTriggerServerAskWithAck(options, ...args)')
    expect(generatedCode).toContain('handleAnswerServer(options, ...args)')
    expect(generatedCode).toContain('handleAskServerWithAck(options, ...args)')
    expect(generatedCode).toContain('handleGetConnectionInfo(options, ...args)')

    // 验证生成的代码不包含TypeScript类型
    expect(generatedCode).not.toContain(': string')
    expect(generatedCode).not.toContain(': any')
    expect(generatedCode).not.toContain(': Socket')
    expect(generatedCode).not.toContain(': Server')
    expect(generatedCode).not.toContain('AskRequest')
    expect(generatedCode).not.toContain('AskResponse')

    // 验证生成的代码调用 _socket 函数
    expect(generatedCode).toContain('return _socket(')
    expect(generatedCode).toContain(', args);')

    // 验证事件名称被正确传递
    expect(generatedCode).toContain('\'eventName\': \'askServer\'')
    expect(generatedCode).toContain('\'eventName\': \'askServerWithCallback\'')
    expect(generatedCode).toContain('\'eventName\': \'triggerServerAsk\'')
    expect(generatedCode).toContain('\'eventName\': \'triggerServerAskWithAck\'')
    expect(generatedCode).toContain('\'eventName\': \'answerServer\'')
    expect(generatedCode).toContain('\'eventName\': \'askServerWithAck\'')
    expect(generatedCode).toContain('\'eventName\': \'getConnectionInfo\'')

    // 验证命名空间被正确传递
    expect(generatedCode).toContain('\'namespace\': \'/ask\'')

    // 验证参数装饰器信息被正确传递
    expect(generatedCode).toContain('\'decorator\': \'MessageBody\'')
    expect(generatedCode).toContain('\'decorator\': \'ConnectedSocket\'')

    // 验证参数名称被正确传递
    expect(generatedCode).toContain('\'name\': \'data\'')
    expect(generatedCode).toContain('\'name\': \'client\'')

    console.warn('Generated Socket.IO code:')
    console.warn(generatedCode)
  })

  it('should generate JavaScript class from WebSocket Gateway', () => {
    const testGatewayPath = path.resolve(__dirname, '../playground/src/backend/websocket.gateway.ts')

    // 分析 Gateway
    const analysisResult = analyzeNestJSController(testGatewayPath)

    // 生成JavaScript代码
    const generatedCode = generateSocketJavaScriptClass(analysisResult)

    // 将生成的代码写入根目录 demo 文件夹
    const outputDir = path.resolve(__dirname, '../demo')
    fs.mkdirSync(outputDir, { recursive: true })
    const gatewayName = analysisResult.gateways[0]?.name ?? 'GeneratedGateway'
    const outputFile = path.join(outputDir, `${gatewayName}.js`)
    fs.writeFileSync(outputFile, generatedCode, 'utf-8')

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('import _socket from \'vtzac/socket\';')

    // 验证生成的代码调用 _socket 函数
    expect(generatedCode).toContain('return _socket(')
    expect(generatedCode).toContain(', args);')
  })

  it('should handle Gateway without namespace', () => {
    // 创建一个简单的测试 Gateway 代码
    const simpleGatewayCode = `
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway()
export class SimpleGateway {
  @SubscribeMessage('test')
  handleTest(@MessageBody() data: any): any {
    return { message: 'test response' };
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(simpleGatewayCode)

    // 生成JavaScript代码
    const generatedCode = generateSocketJavaScriptClass(analysisResult)

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('import _socket from \'vtzac/socket\';')
    expect(generatedCode).toContain('class SimpleGateway')
    expect(generatedCode).toContain('handleTest(options, ...args)')
    expect(generatedCode).toContain('\'eventName\': \'test\'')

    // 验证没有命名空间时的处理
    expect(generatedCode).toContain('\'namespace\': \'\'')
  })
})
