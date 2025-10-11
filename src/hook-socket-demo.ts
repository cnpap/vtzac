import { WebSocketEventEmitter } from '../playground/src/backend/websocket.emitter'
import { WebSocketTestGateway } from '../playground/src/backend/websocket.gateway'
import { _socket } from './hook-socket'

// 初始化 socket 连接，类似于原始的 io('http://localhost:3001', { transports: ['websocket'] })
const { createEmitter, createListener, socket, disconnect } = _socket('http://localhost:3001', {
  socketIoOptions: {
    transports: ['websocket'],
  },
})

// 创建发送器，支持传入类或实例
const _emit1 = createEmitter(WebSocketTestGateway) // 传入类

async function demo(): Promise<void> {
  // 等待连接建立
  await new Promise<void>((resolve) => {
    socket.on('connect', () => {
      console.warn('Socket 连接已建立')
      resolve()
    })
  })

  // 直接方法名风格：_emit1.handleXxx(...)，自动映射为对应事件名
  _emit1.handleJoinChat({ nickname: 'Alice', avatar: 'avatar1.png' })
  _emit1.handlePublicMessage({ text: 'Hello everyone!' })
  _emit1.handlePrivateMessage({ text: '123', toUserId: 'user123' })
  _emit1.handlePing()
  // 有返回值的会默认从 emit 调用改为 emitWithAck 调用，等待服务器响应
  const counter = await _emit1.handleGetOnlineCount()
  console.warn('当前在线人数:', counter)
  _emit1.handleStartTyping({ toUserId: 'user123' })
  _emit1.handleStopTyping({ toUserId: 'user123' })

  /**
   * createListener 方法：设计方案实现
   *
   * 监听服务端的发送类，使用 createListener 创建类型安全的监听器
   */
  const _listener = createListener(WebSocketEventEmitter)

  // 使用类型安全的监听器，这个获得的 data 就是对应方法的返回值类型
  _listener.onConnected((data) => {
    console.warn('服务器确认连接:', data)
  })

  _listener.joinedChat((data) => {
    console.warn('加入聊天成功:', data)
  })

  _listener.publicMessage((data) => {
    console.warn('收到公共消息:', data)
  })

  _listener.privateMessage((data) => {
    console.warn('收到私聊消息:', data)
  })

  _listener.onlineUsers((data) => {
    console.warn('在线用户列表:', data)
  })

  _listener.userJoined((data) => {
    console.warn('用户加入:', data)
  })

  _listener.userLeft((data) => {
    console.warn('用户离开:', data)
  })

  _listener.pong((data) => {
    console.warn('心跳响应:', data)
  })

  _listener.onlineCount((data) => {
    console.warn('在线人数:', data)
  })

  _listener.error((data) => {
    console.error('Socket 错误:', data)
  })

  // 演示完成后断开连接
  setTimeout(() => {
    console.warn('演示完成，断开连接')
    disconnect()
  }, 10000)
}

// 运行演示
demo().catch(console.error)

// 使用说明：
// 1. 初始化：const { createEmitter, createListener, socket, disconnect } = _socket(url, options)
// 2. 创建发送器：const _emit = createEmitter(ControllerClass)
// 3. 创建监听器：const _listener = createListener(EventEmitterClass)
// 4. 发送消息：直接方法名 _emit.handleMethodName(params)
// 5. 监听响应：_listener.eventMethodName(callback) - 类型安全的事件监听
// 6. 断开连接：disconnect()

export { demo }
