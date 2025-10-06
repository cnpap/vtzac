/**
 * HTTP 请求配置接口
 */
export interface HttpConfig {
  method: string
  path: string
  parameters: ParameterMapping[]
  fileUpload?: FileUploadConfig
}

/**
 * 参数映射接口
 */
export interface ParameterMapping {
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
export interface FileUploadConfig {
  type: 'single' | 'multiple' | 'named-multiple'
  fieldNames: string[]
  maxCount?: number
  details?: Record<string, { maxCount: number }>
}

// 默认基础 URL，可以通过环境变量或配置覆盖
let BASE_URL = 'http://localhost:3001/api'

export function baseurl(url: string): void {
  BASE_URL = url
}

/**
 * httpZac 函数 - 构建并发送 HTTP 请求
 * @param config HTTP 配置对象
 * @param args 传入的参数数组
 * @returns Promise<Response>
 */
export default function httpZac(config: HttpConfig, args: any[]): Promise<Response> {
  const { method, path, parameters, fileUpload } = config

  // 构建请求 URL
  let url = buildUrl(path, parameters, args)

  // 添加基础 URL
  if (!url.startsWith('http')) {
    const baseUrl = BASE_URL
    url = `${baseUrl}/${url}`.replace(/\/+/g, '/').replace(/:\//g, '://')
  }

  // 构建请求选项
  const requestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: {},
  }

  // 处理参数
  const { queryParams, headers, body, formData } = processParameters(parameters, args, fileUpload)

  // 添加查询参数到 URL
  if (queryParams.size > 0) {
    const searchParams = new URLSearchParams()
    queryParams.forEach((value, key) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      }
      else {
        searchParams.set(key, String(value))
      }
    })
    url += (url.includes('?') ? '&' : '?') + searchParams.toString()
  }

  // 设置请求头
  Object.assign(requestOptions.headers as Record<string, string>, headers)

  // 设置请求体
  if (formData) {
    requestOptions.body = formData
    // FormData 会自动设置 Content-Type，不需要手动设置
  }
  else if (body !== undefined) {
    if (typeof body === 'object' && body !== null) {
      requestOptions.body = JSON.stringify(body)
      ;(requestOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
    }
    else {
      requestOptions.body = String(body)
    }
  }

  return fetch(url, requestOptions)
}

/**
 * 构建 URL，处理路径参数
 */
function buildUrl(path: string, parameters: ParameterMapping[], args: any[]): string {
  let url = path

  // 处理路径参数
  parameters.forEach((param, index) => {
    if (param.decorator === 'Param' && param.key && args[index] !== undefined) {
      const placeholder = `:${param.key}`
      url = url.replace(placeholder, encodeURIComponent(String(args[index])))
    }
    else if (param.decorator === 'Param' && !param.key && args[index] !== undefined) {
      // 处理参数对象的情况
      const paramObj = args[index]
      if (typeof paramObj === 'object' && paramObj !== null) {
        Object.entries(paramObj).forEach(([key, value]) => {
          const placeholder = `:${key}`
          if (url.includes(placeholder)) {
            url = url.replace(placeholder, encodeURIComponent(String(value)))
          }
        })
      }
    }
  })

  return url
}

/**
 * 处理所有参数，分类到不同的请求部分
 */
function processParameters(
  parameters: ParameterMapping[],
  args: any[],
  fileUpload?: FileUploadConfig,
): { queryParams: Map<string, any>, headers: Record<string, string>, body: any, formData?: FormData } {
  const queryParams = new Map<string, any>()
  const headers: Record<string, string> = {}
  let body: any
  let formData: FormData | undefined

  // 如果有文件上传，创建 FormData
  if (fileUpload) {
    formData = new FormData()
  }

  parameters.forEach((param, index) => {
    const value = args[index]
    if (value === undefined)
      return

    switch (param.decorator) {
      case 'Query':
        handleQueryParameter(param, value, queryParams)
        break

      case 'Param':
        // 路径参数已在 buildUrl 中处理
        break

      case 'Headers':
        handleHeaderParameter(param, value, headers)
        break

      case 'Body':
        if (formData) {
          // 文件上传时，Body 参数作为表单字段
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([key, val]) => {
              formData!.append(key, String(val))
            })
          }
          else if (value !== undefined) {
            formData!.append('data', String(value))
          }
        }
        else {
          body = value
        }
        break

      case 'UploadedFile':
      case 'UploadedFiles':
        handleFileParameter(param, value, formData, fileUpload)
        break

      case 'Req':
      case 'Res':
        // 这些是 NestJS 的上下文对象，在客户端请求中忽略
        break
    }
  })

  return { queryParams, headers, body, formData }
}

/**
 * 处理查询参数
 */
function handleQueryParameter(param: ParameterMapping, value: any, queryParams: Map<string, any>): void {
  if (param.key) {
    // 具名查询参数
    queryParams.set(param.key, value)
  }
  else {
    // 查询对象
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        queryParams.set(key, val)
      })
    }
  }
}

/**
 * 处理请求头参数
 */
function handleHeaderParameter(param: ParameterMapping, value: any, headers: Record<string, string>): void {
  if (param.key) {
    // 具名请求头
    headers[param.key] = String(value)
  }
  else {
    // 请求头对象
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        headers[key] = String(val)
      })
    }
  }
}

/**
 * 处理文件参数
 */
function handleFileParameter(
  param: ParameterMapping,
  value: any,
  formData: FormData | undefined,
  fileUpload?: FileUploadConfig,
): void {
  if (!formData || !fileUpload)
    return

  // 使用 param.fileInfo 中的信息来处理文件上传
  const fileInfo = param.fileInfo
  if (fileInfo) {
    fileInfo.fileFields.forEach((field) => {
      if (field.isArray) {
        // 处理数组文件
        if (Array.isArray(value)) {
          value.forEach((file: File) => {
            if (file instanceof File) {
              formData.append(field.fieldName, file)
            }
          })
        }
        else if (typeof value === 'object' && value !== null && value[field.fieldName]) {
          // 处理具名多文件上传
          const files = value[field.fieldName]
          if (Array.isArray(files)) {
            files.forEach((file: File) => {
              if (file instanceof File) {
                formData.append(field.fieldName, file)
              }
            })
          }
        }
      }
      else {
        // 处理单个文件
        if (value instanceof File) {
          formData.append(field.fieldName, value)
        }
      }
    })
  }
  else {
    // 回退到原有逻辑
    switch (fileUpload.type) {
      case 'single':
        // 单文件上传
        if (value instanceof File) {
          formData.append(fileUpload.fieldNames[0], value)
        }
        break

      case 'multiple':
        // 多文件上传
        if (Array.isArray(value)) {
          value.forEach((file: File) => {
            if (file instanceof File) {
              formData.append(fileUpload.fieldNames[0], file)
            }
          })
        }
        break

      case 'named-multiple':
        // 具名多文件上传
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([fieldName, files]) => {
            if (Array.isArray(files)) {
              files.forEach((file: File) => {
                if (file instanceof File) {
                  formData.append(fieldName, file)
                }
              })
            }
          })
        }
        break
    }
  }
}
