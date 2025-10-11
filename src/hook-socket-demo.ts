import { WebSocketTestGateway } from '../playground/src/backend/websocket.gateway'
import { _socket } from './hook-socket'

// 初始化 socket 连接，类似于原始的 io('http://localhost:3001', { transports: ['websocket'] })
const { createEmitter, socket, disconnect } = _socket('http://localhost:3001', {
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
  // 有返回值的会默认从 emit 调用改为 emitWithAsk 调用，等待服务器响应
  const counter = await _emit1.handleGetOnlineCount()
  console.warn('当前在线人数:', counter)
  _emit1.handleStartTyping({ toUserId: 'user123' })
  _emit1.handleStopTyping({ toUserId: 'user123' })

  // 删除方式2（_emit.emit('handleMethodName', ...args)）

  // 监听服务器响应（这部分暂时使用原始 socket.on）
  socket.on('connected', (data) => {
    console.warn('服务器确认连接:', data)
  })

  socket.on('joinedChat', (data) => {
    console.warn('加入聊天成功:', data)
  })

  socket.on('publicMessage', (data) => {
    console.warn('收到公共消息:', data)
  })

  socket.on('privateMessage', (data) => {
    console.warn('收到私聊消息:', data)
  })

  socket.on('onlineUsers', (data) => {
    console.warn('在线用户列表:', data)
  })

  socket.on('userJoined', (data) => {
    console.warn('用户加入:', data)
  })

  socket.on('userLeft', (data) => {
    console.warn('用户离开:', data)
  })

  socket.on('pong', (data) => {
    console.warn('心跳响应:', data)
  })

  socket.on('onlineCount', (data) => {
    console.warn('在线人数:', data)
  })

  socket.on('error', (data) => {
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
// 1. 初始化：const { createEmitter, socket, disconnect } = _socket(url, options)
// 2. 创建发送器：const _emit = createEmitter(ControllerClass)
// 3. 发送消息：直接方法名 _emit.handleMethodName(params)
// 4. 监听响应：socket.on('eventName', callback)
// 5. 断开连接：disconnect()

export { demo }
