import type { FetchOptions, FetchResponse } from 'ofetch'
import { ofetch } from 'ofetch'

/**
 * HTTP 请求配置接口
 */
export interface HttpConfig {
  method: string
  path: string
  parameters: ParameterMapping[]
  fileUpload?: FileUploadConfig
  ofetchOptions?: FetchOptions<'json'>
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
let globalZacOfetchOptions: FetchOptions<'json'> = {}

export function setGlobalZacOfetchOptions(options: FetchOptions<'json'>): void {
  globalZacOfetchOptions = options
}

/**
 * _api 函数 - 构建并发送 HTTP 请求
 *
 * @param config HTTP 配置对象
 * @param args 传入的参数数组
 * @returns Promise<FetchResponse<T>> ofetch 的原生返回
 */
export default async function _api<T>(config: HttpConfig, args: unknown[]): Promise<FetchResponse<T>> {
  const { method, path, parameters, fileUpload } = config

  // 构建请求 URL
  const url = buildUrl(path, parameters, args)

  // 处理参数
  const { queryParams, headers, body, formData } = processParameters(parameters, args, fileUpload)

  // 构建查询参数对象
  const query: Record<string, unknown> = {}
  queryParams.forEach((value, key) => {
    query[key] = value
  })
  let ofetchOptions = config.ofetchOptions || {}
  ofetchOptions = { ...globalZacOfetchOptions, ...ofetchOptions }
  ofetchOptions.method = method.toUpperCase()
  if (ofetchOptions.method === 'SSE') {
    ofetchOptions.method = 'GET'
  }
  ofetchOptions.headers = Object.assign({}, ofetchOptions.headers, headers)
  ofetchOptions.query = Object.assign({}, ofetchOptions.query, query)

  // 设置请求体
  if (formData) {
    ofetchOptions.body = formData
  }
  else if (body !== undefined) {
    ofetchOptions.body = body
  }

  // 不直接返回 ofetch 的结果，而是使用 raw，这样返回值就不是直接的值了，而是 raw<T = any, R extends ResponseType = "json">(request: FetchRequest, options?: FetchOptions<R>): Promise<FetchResponse<MappedResponseType<R, T>>>;
  // return await ofetch(url, options)
  return ofetch.raw<T>(url, ofetchOptions)
}

/**
 * 构建 URL，处理路径参数
 */
function buildUrl(path: string, parameters: ParameterMapping[], args: unknown[]): string {
  let url = path

  // 处理路径参数
  parameters.forEach((param, index) => {
    if (param.decorator === 'Param' && param.key && args[index] !== undefined) {
      const placeholder = `:${param.key}`
      url = url.replace(placeholder, encodeURIComponent(String(args[index])))
    }
    else if (param.decorator === 'Param' && !param.key && args[index] !== undefined) {
      // 处理参数对象的情况
      const paramObj = args[index] as Record<string, unknown>
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
  args: unknown[],
  fileUpload?: FileUploadConfig,
): { queryParams: Map<string, unknown>, headers: Record<string, string>, body: unknown, formData?: FormData } {
  const queryParams = new Map<string, unknown>()
  const headers: Record<string, string> = {}
  let body: unknown
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

      case 'Header':
      case 'Headers':
        handleHeaderParameter(param, value, headers)
        break

      case 'Body':
        if (formData) {
          // 文件上传时，Body 参数作为表单字段
          if (typeof value === 'object' && value !== null) {
            Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
              formData.append(key, String(val))
            })
          }
          else if (value !== undefined) {
            formData.append('data', String(value))
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
function handleQueryParameter(param: ParameterMapping, value: unknown, queryParams: Map<string, unknown>): void {
  if (param.key) {
    // 具名查询参数
    queryParams.set(param.key, value)
  }
  else {
    // 查询对象
    if (typeof value === 'object' && value !== null) {
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        queryParams.set(key, val)
      })
    }
  }
}

/**
 * 处理请求头参数
 */
function handleHeaderParameter(param: ParameterMapping, value: unknown, headers: Record<string, string>): void {
  if (param.key) {
    // 具名请求头
    headers[param.key] = String(value)
  }
  else {
    // 请求头对象
    if (typeof value === 'object' && value !== null) {
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
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
  value: unknown,
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
          value.forEach((file: unknown) => {
            if (file instanceof File) {
              formData.append(field.fieldName, file)
            }
          })
        }
        else if (typeof value === 'object' && value !== null) {
          // 处理具名多文件上传
          const valueObj = value as Record<string, unknown>
          const files = valueObj[field.fieldName]
          if (Array.isArray(files)) {
            files.forEach((file: unknown) => {
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
          value.forEach((file: unknown) => {
            if (file instanceof File) {
              formData.append(fileUpload.fieldNames[0], file)
            }
          })
        }
        break

      case 'named-multiple':
        // 具名多文件上传
        if (typeof value === 'object' && value !== null) {
          Object.entries(value as Record<string, unknown>).forEach(([fieldName, files]) => {
            if (Array.isArray(files)) {
              files.forEach((file: unknown) => {
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
