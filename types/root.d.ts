// import.meta.glob
// 全局类型声明

interface ImportMeta {
  glob: (pattern: string | string[]) => Record<string, any>
}

// 虚拟模块声明
declare module 'virtual:http-zac' {
  /**
   * 参数映射接口
   */
  interface ParameterMapping {
    name: string
    decorator: string
    key?: string
    fileInfo?: {
      uploadType: string
      fileFields: Array<{
        fieldName: string
        isArray: boolean
        maxCount?: number
      }>
    }
  }

  /**
   * 文件上传配置接口
   */
  interface FileUploadConfig {
    type: 'single' | 'multiple' | 'named-multiple'
    fieldNames: string[]
    maxCount?: number
    details?: Record<string, { maxCount: number }>
  }

  /**
   * HTTP 请求配置接口
   */
  interface HttpConfig {
    method: string
    path: string
    parameters: ParameterMapping[]
    fileUpload?: FileUploadConfig
  }

  /**
   * httpZac 函数 - 构建并发送 HTTP 请求
   * @param config HTTP 配置对象
   * @param args 传入的参数数组
   * @returns Promise<Response>
   */
  function httpZac(config: HttpConfig, args: any[]): Promise<Response>

  export default httpZac
}
