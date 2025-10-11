import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController, analyzeNestJSControllerFromCode } from '../src/ast'
import { generateSocketJavaScriptClass } from '../src/generate-socket'

describe('socket.IO Code Generation', () => {
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

    // 验证构造函数
    expect(generatedCode).toContain('constructor()')
    expect(generatedCode).toContain('this.socket = null')

    // 验证新增的方法
    expect(generatedCode).toContain('getNamespace()')
    expect(generatedCode).toContain('__setSocket(socket)')

    // 验证生成的代码包含 socket 调用
    expect(generatedCode).toContain('return this.socket.')
    expect(generatedCode).toContain(', ...args);')

    // 验证 void 方法使用 emit
    expect(generatedCode).toContain('this.socket.emit(')

    // 验证有返回值的方法使用 emitWithAck（如 handleGetOnlineCount）
    expect(generatedCode).toContain('this.socket.emitWithAck(')
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
    expect(generatedCode).toContain('class SimpleGateway')

    // 验证构造函数
    expect(generatedCode).toContain('constructor()')
    expect(generatedCode).toContain('this.socket = null')

    // 验证新增的方法
    expect(generatedCode).toContain('getNamespace()')
    expect(generatedCode).toContain('__setSocket(socket)')

    expect(generatedCode).toContain('handleTest(...args)')
    // 由于方法有返回值 any，应该生成 emitWithAck
    expect(generatedCode).toContain('this.socket.emitWithAck(\'test\'')
  })

  it('should use emit for void return type methods', () => {
    // 创建一个返回 void 的测试 Gateway 代码
    const voidGatewayCode = `
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway()
export class VoidGateway {
  @SubscribeMessage('voidTest')
  handleVoidTest(@MessageBody() data: any): void {
    console.log('void method');
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(voidGatewayCode)

    // 生成JavaScript代码
    const generatedCode = generateSocketJavaScriptClass(analysisResult)

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('class VoidGateway')
    expect(generatedCode).toContain('handleVoidTest(...args)')
    // 由于方法返回 void，应该生成 emit
    expect(generatedCode).toContain('this.socket.emit(\'voidTest\'')
  })

  it('should generate getNamespace method with correct namespace', () => {
    // 创建一个带有 namespace 的测试 Gateway 代码
    const namespaceGatewayCode = `
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): void {
    console.log('message received');
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(namespaceGatewayCode)

    // 生成JavaScript代码
    const generatedCode = generateSocketJavaScriptClass(analysisResult)

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('class ChatGateway')

    // 验证 getNamespace 方法返回正确的 namespace
    expect(generatedCode).toContain('getNamespace() {\n    return \'/chat\';')
  })
})
