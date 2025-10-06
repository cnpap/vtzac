import type { HttpConfig } from '../src/templates/fetch'
import { beforeAll, describe, expect, it } from 'vitest'
import httpZac, { baseurl } from '../src/templates/fetch'

describe('httpZac Function Tests - Real HTTP Requests', () => {
  beforeAll(() => {
    // 设置基础 URL 用于测试
    baseurl('http://localhost:3001/api')
  })

  describe('基础功能测试', () => {
    it('应该正确发送 GET 请求并获得响应', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/query/named',
        parameters: [],
      }

      const response = await httpZac(config, [])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'named-query' })
    })
  })

  describe('查询参数测试', () => {
    it('应该正确处理具名查询参数', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/query/named',
        parameters: [
          {
            name: '_page',
            decorator: 'Query',
            key: 'page',
          },
          {
            name: '_limit',
            decorator: 'Query',
            key: 'limit',
          },
        ],
      }

      const response = await httpZac(config, ['1', '10'])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'named-query' })
    })

    it('应该正确处理查询对象', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/query/object',
        parameters: [
          {
            name: '_query',
            decorator: 'Query',
          },
        ],
      }

      const queryObj = { page: '1', limit: '10', sort: 'name' }
      const response = await httpZac(config, [queryObj])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'query-object' })
    })
  })

  describe('路径参数测试', () => {
    it('应该正确处理具名路径参数', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/param/named/:userId/:postId',
        parameters: [
          {
            name: '_userId',
            decorator: 'Param',
            key: 'userId',
          },
          {
            name: '_postId',
            decorator: 'Param',
            key: 'postId',
          },
        ],
      }

      const response = await httpZac(config, ['123', '456'])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'named-param' })
    })

    it('应该正确处理参数对象', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/param/object/:type/:id/:action',
        parameters: [
          {
            name: '_params',
            decorator: 'Param',
          },
        ],
      }

      const paramsObj = { type: 'user', id: '123', action: 'edit' }
      const response = await httpZac(config, [paramsObj])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'param-object' })
    })
  })

  describe('请求头测试', () => {
    it('应该正确处理具名请求头和请求头对象', async () => {
      const config: HttpConfig = {
        method: 'GET',
        path: 'test/headers',
        parameters: [
          {
            name: '_auth',
            decorator: 'Header',
            key: 'authorization',
          },
          {
            name: '_headers',
            decorator: 'Header',
          },
        ],
      }

      const headersObj = {
        'x-custom-header': 'custom-value',
      }
      const response = await httpZac(config, ['Bearer token123', headersObj])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'headers' })
    })
  })

  describe('请求体测试', () => {
    it('应该正确处理 JSON 请求体（通过复杂组合测试）', async () => {
      const config: HttpConfig = {
        method: 'PUT',
        path: 'test/complex/:id',
        parameters: [
          {
            name: '_id',
            decorator: 'Param',
            key: 'id',
          },
          {
            name: '_body',
            decorator: 'Body',
          },
        ],
      }

      const bodyData = { name: '更新的名称', status: 'active' }
      const response = await httpZac(config, ['123', bodyData])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'complex' })
    })
  })

  describe('文件上传测试', () => {
    it('应该正确处理单文件上传', async () => {
      const config: HttpConfig = {
        method: 'POST',
        path: 'test/upload/single',
        parameters: [
          {
            name: '_file',
            decorator: 'UploadedFile',
          },
          {
            name: '_metadata',
            decorator: 'Body',
          },
        ],
        fileUpload: {
          type: 'single',
          fieldNames: ['file'],
        },
      }

      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const metadata = { description: '测试文件' }

      const response = await httpZac(config, [mockFile, metadata])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'single-file-upload' })
    })

    it('应该正确处理多文件上传', async () => {
      const config: HttpConfig = {
        method: 'POST',
        path: 'test/upload/multiple',
        parameters: [
          {
            name: '_files',
            decorator: 'UploadedFiles',
          },
          {
            name: '_metadata',
            decorator: 'Body',
          },
        ],
        fileUpload: {
          type: 'multiple',
          fieldNames: ['files'],
          maxCount: 5,
        },
      }

      const mockFiles = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
      ]
      const metadata = { description: '测试多文件上传' }

      const response = await httpZac(config, [mockFiles, metadata])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'multiple-file-upload' })
    })

    it('应该正确处理具名多文件上传', async () => {
      const config: HttpConfig = {
        method: 'POST',
        path: 'test/upload/named-multiple',
        parameters: [
          {
            name: '_files',
            decorator: 'UploadedFiles',
          },
        ],
        fileUpload: {
          type: 'named-multiple',
          fieldNames: ['documents', 'images'],
        },
      }

      const files = {
        documents: [new File(['doc content'], 'doc.pdf', { type: 'application/pdf' })],
        images: [new File(['image content'], 'image.jpg', { type: 'image/jpeg' })],
      }
      const response = await httpZac(config, [files])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'named-multiple-file-upload' })
    })
  })

  describe('复杂组合测试', () => {
    it('应该正确处理所有参数类型的组合', async () => {
      const config: HttpConfig = {
        method: 'PUT',
        path: 'test/complex/:id',
        parameters: [
          {
            name: '_id',
            decorator: 'Param',
            key: 'id',
          },
          {
            name: '_version',
            decorator: 'Query',
            key: 'version',
          },
          {
            name: '_auth',
            decorator: 'Header',
            key: 'authorization',
          },
          {
            name: '_body',
            decorator: 'Body',
          },
        ],
      }

      const bodyData = { name: 'John', status: 'active' }
      const response = await httpZac(config, ['123', 'v1.0', 'Bearer token', bodyData])
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toEqual({ success: true, type: 'complex' })
    })
  })
})
