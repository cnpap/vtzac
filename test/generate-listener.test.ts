import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeNestJSController, analyzeNestJSControllerFromCode } from '../src/ast'
import { generateListenerJavaScriptClass } from '../src/generate-socket'

describe('socket.IO Listener Code Generation', () => {
  it('should generate JavaScript listener class from WebSocket EventEmitter', () => {
    const testEmitterPath = path.resolve(__dirname, '../playground/src/backend/websocket.emitter.ts')

    // 分析 EventEmitter
    const analysisResult = analyzeNestJSController(testEmitterPath)

    // 验证分析结果
    expect(analysisResult.eventEmitters).toHaveLength(1)
    expect(analysisResult.eventEmitters[0].name).toBe('WebSocketEventEmitter')
    expect(analysisResult.eventEmitters[0].events.length).toBeGreaterThan(0)

    // 生成JavaScript代码
    const generatedCode = generateListenerJavaScriptClass(analysisResult)

    // 将生成的代码写入根目录 demo 文件夹
    const outputDir = path.resolve(__dirname, '../demo')
    fs.mkdirSync(outputDir, { recursive: true })
    const emitterName = analysisResult.eventEmitters[0]?.name ?? 'GeneratedListener'
    const outputFile = path.join(outputDir, `${emitterName}Listener.js`)
    fs.writeFileSync(outputFile, generatedCode, 'utf-8')

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()

    // 验证构造函数
    expect(generatedCode).toContain('constructor(socket)')
    expect(generatedCode).toContain('this.socket = socket')

    // 验证生成的代码包含 socket.on 调用
    expect(generatedCode).toContain('this.socket.on(')
    expect(generatedCode).toContain(', callback);')

    // 验证特定的事件监听器方法

    expect(generatedCode).toContain('userLeft(callback)')
    expect(generatedCode).toContain('this.socket.on(\'userLeft\', callback);')

    expect(generatedCode).toContain('joinedChat(callback)')
    expect(generatedCode).toContain('this.socket.on(\'joinedChat\', callback);')

    expect(generatedCode).toContain('publicMessage(callback)')
    expect(generatedCode).toContain('this.socket.on(\'publicMessage\', callback);')

    expect(generatedCode).toContain('privateMessage(callback)')
    expect(generatedCode).toContain('this.socket.on(\'privateMessage\', callback);')
  })

  it('should handle EventEmitter with simple events', () => {
    // 创建一个简单的测试 EventEmitter 代码
    const simpleEmitterCode = `
import { Emit } from 'vtzac/typed-emit'

export class SimpleEventEmitter {
  @Emit('testEvent')
  testMethod(): { message: string } {
    return { message: 'test' };
  }

  @Emit('anotherEvent')
  anotherMethod(data: string): { data: string, timestamp: string } {
    return { data, timestamp: new Date().toISOString() };
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(simpleEmitterCode)

    // 验证分析结果
    expect(analysisResult.eventEmitters).toHaveLength(1)
    expect(analysisResult.eventEmitters[0].name).toBe('SimpleEventEmitter')
    expect(analysisResult.eventEmitters[0].events).toHaveLength(2)

    // 生成JavaScript代码
    const generatedCode = generateListenerJavaScriptClass(analysisResult)

    // 验证生成的代码
    expect(generatedCode).toBeTruthy()
    expect(generatedCode).toContain('class SimpleEventEmitter')

    // 验证构造函数
    expect(generatedCode).toContain('constructor(socket)')
    expect(generatedCode).toContain('this.socket = socket')

    // 验证事件监听器方法
    expect(generatedCode).toContain('testMethod(callback)')
    expect(generatedCode).toContain('this.socket.on(\'testEvent\', callback);')

    expect(generatedCode).toContain('anotherMethod(callback)')
    expect(generatedCode).toContain('this.socket.on(\'anotherEvent\', callback);')
  })

  it('should return empty string when no event emitters found', () => {
    // 创建一个没有 @Emit 装饰器的类
    const noEmitterCode = `
export class RegularClass {
  regularMethod(): void {
    console.log('regular method');
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(noEmitterCode)

    // 验证分析结果
    expect(analysisResult.eventEmitters).toHaveLength(0)

    // 生成JavaScript代码
    const generatedCode = generateListenerJavaScriptClass(analysisResult)

    // 验证生成的代码为空
    expect(generatedCode).toBe('')
  })

  it('should handle multiple event emitters in one file', () => {
    // 创建包含多个事件发射器的代码
    const multipleEmittersCode = `
import { Emit } from 'vtzac/typed-emit'

export class FirstEmitter {
  @Emit('event1')
  method1(): { data: string } {
    return { data: 'first' };
  }
}

export class SecondEmitter {
  @Emit('event2')
  method2(): { data: string } {
    return { data: 'second' };
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(multipleEmittersCode)

    // 验证分析结果
    expect(analysisResult.eventEmitters).toHaveLength(2)

    // 生成JavaScript代码
    const generatedCode = generateListenerJavaScriptClass(analysisResult)

    // 验证生成的代码包含两个类
    expect(generatedCode).toContain('class FirstEmitter')
    expect(generatedCode).toContain('class SecondEmitter')
    expect(generatedCode).toContain('this.socket.on(\'event1\', callback);')
    expect(generatedCode).toContain('this.socket.on(\'event2\', callback);')
  })

  it('should correctly map event names from @Emit decorator', () => {
    // 创建测试代码，验证事件名映射
    const eventMappingCode = `
import { Emit } from 'vtzac/typed-emit'

export class EventMappingEmitter {
  @Emit('customEventName')
  methodWithCustomEvent(): { message: string } {
    return { message: 'custom' };
  }

  @Emit('user:joined')
  userJoinedMethod(): { userId: string } {
    return { userId: '123' };
  }
}
`

    // 分析代码
    const analysisResult = analyzeNestJSControllerFromCode(eventMappingCode)

    // 生成JavaScript代码
    const generatedCode = generateListenerJavaScriptClass(analysisResult)

    // 验证事件名正确映射
    expect(generatedCode).toContain('methodWithCustomEvent(callback)')
    expect(generatedCode).toContain('this.socket.on(\'customEventName\', callback);')

    expect(generatedCode).toContain('userJoinedMethod(callback)')
    expect(generatedCode).toContain('this.socket.on(\'user:joined\', callback);')
  })
})
