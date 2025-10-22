/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('test')
@Controller('api/test')
export class TestInputController {
  // === @Query 测试用例 ===

  // 具名查询参数（有key）
  @Get('query/named')
  @ApiOperation({
    summary: '具名查询参数测试',
    description: '测试具名查询参数的处理',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: '10',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'named-query' } },
  })
  testNamedQuery(
    @Query('page') _page?: string,
    @Query('limit') _limit?: string
  ): { success: boolean; type: string } {
    return { success: true, type: 'named-query' };
  }

  // 查询对象（无key）
  @Get('query/object')
  @ApiOperation({ summary: '查询对象测试', description: '测试查询对象的处理' })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'query-object' } },
  })
  testQueryObject(@Query() _query: any): { success: boolean; type: string } {
    return { success: true, type: 'query-object' };
  }

  // === @Param 测试用例 ===

  // 具名路径参数（有key）
  @Get('param/named/:userId/:postId')
  @ApiOperation({
    summary: '具名路径参数测试',
    description: '测试具名路径参数的处理',
  })
  @ApiParam({ name: 'userId', description: '用户ID', example: '123' })
  @ApiParam({ name: 'postId', description: '文章ID', example: '456' })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'named-param' } },
  })
  testNamedParam(
    @Param('userId') _userId: string,
    @Param('postId') _postId: string
  ): { success: boolean; type: string } {
    return { success: true, type: 'named-param' };
  }

  // 参数对象（无key）
  @Get('param/object/:type/:id/:action')
  @ApiOperation({ summary: '参数对象测试', description: '测试参数对象的处理' })
  @ApiParam({ name: 'type', description: '类型', example: 'user' })
  @ApiParam({ name: 'id', description: 'ID', example: '123' })
  @ApiParam({ name: 'action', description: '操作', example: 'edit' })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'param-object' } },
  })
  testParamObject(@Param() _params: any): { success: boolean; type: string } {
    return { success: true, type: 'param-object' };
  }

  // 混合：具名参数 + 参数对象
  @Get('param/mixed/:userId/:postId')
  @ApiOperation({
    summary: '混合参数测试',
    description: '测试具名参数和参数对象的混合使用',
  })
  @ApiParam({ name: 'userId', description: '用户ID', example: '123' })
  @ApiParam({ name: 'postId', description: '文章ID', example: '456' })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'mixed-param' } },
  })
  testMixedParam(
    @Param('userId') _userId: string,
    @Param() _allParams: any
  ): { success: boolean; type: string } {
    return { success: true, type: 'mixed-param' };
  }

  // === @Headers 测试用例 ===

  // 具名请求头（有key）+ 请求头对象（无key）
  @Get('headers')
  @ApiOperation({ summary: '请求头测试', description: '测试请求头的处理' })
  @ApiHeader({
    name: 'authorization',
    required: false,
    description: '授权令牌',
    example: 'Bearer token123',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'headers' } },
  })
  testHeaders(
    @Headers('authorization') _auth?: string,
    @Headers() _headers?: any
  ): { success: boolean; type: string } {
    return { success: true, type: 'headers' };
  }

  // === 文件上传测试用例 ===

  // 单文件上传
  @Post('upload/single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '单文件上传测试',
    description: '测试单文件上传的处理',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '上传的文件',
        },
        metadata: {
          type: 'string',
          description: '文件元数据',
          example: '{"description": "测试文件"}',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'single-file-upload' } },
  })
  testSingleFileUpload(
    @UploadedFile() _file: Express.Multer.File,
    @Body() _metadata?: any
  ): { success: true; type: 'single-file-upload' } {
    return { success: true, type: 'single-file-upload' };
  }

  // 多文件上传
  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiOperation({
    summary: '多文件上传测试',
    description: '测试多文件上传的处理',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '多文件上传',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '上传的文件列表（最多5个）',
        },
        metadata: {
          type: 'string',
          description: '文件元数据',
          example: '{"description": "测试文件批量上传"}',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'multiple-file-upload' } },
  })
  testMultipleFileUpload(
    @UploadedFiles() _files: Express.Multer.File[],
    @Body() _metadata?: any
  ): { success: true; type: 'multiple-file-upload' } {
    return { success: true, type: 'multiple-file-upload' };
  }

  // 具名多文件上传
  @Post('upload/named-multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 3 },
      { name: 'images', maxCount: 2 },
    ])
  )
  @ApiOperation({
    summary: '具名多文件上传测试',
    description: '测试具名多文件上传的处理',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '具名多文件上传',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '文档文件（最多3个）',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '图片文件（最多2个）',
        },
        metadata: {
          type: 'string',
          description: '文件元数据',
          example: '{"description": "测试具名多文件上传"}',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'named-multiple-file-upload' } },
  })
  testNamedMultipleFileUpload(
    @UploadedFiles()
    _files: {
      documents?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @Body() _metadata?: any
  ): { success: true; type: 'named-multiple-file-upload' } {
    return { success: true, type: 'named-multiple-file-upload' };
  }

  // === 复杂组合测试用例 ===

  // 综合测试：所有装饰器类型组合
  @Put('complex/:id')
  @ApiOperation({
    summary: '复杂组合测试',
    description: '测试所有装饰器类型的组合使用',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '123' })
  @ApiQuery({
    name: 'version',
    required: false,
    description: '版本号',
    example: 'v1.0',
  })
  @ApiHeader({
    name: 'authorization',
    required: false,
    description: '授权令牌',
    example: 'Bearer token123',
  })
  @ApiBody({
    description: '更新数据',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '更新的名称' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '成功返回',
    schema: { example: { success: true, type: 'complex' } },
  })
  testComplex(
    @Param('id') _id: string,
    @Body() _body: any,
    @Query('version') _version?: string,
    @Headers('authorization') _auth?: string,
    @Req() _request?: Request
  ): { success: true; type: 'complex' } {
    return { success: true, type: 'complex' };
  }

  // === HTTP 方法测试 ===

  // DELETE 方法
  @Delete('methods/delete/:id')
  @ApiOperation({
    summary: 'DELETE 方法测试',
    description: '测试 DELETE HTTP 方法',
  })
  @ApiParam({ name: 'id', description: '要删除的资源ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: '成功删除',
    schema: { example: { success: true, method: 'DELETE' } },
  })
  testDeleteMethod(@Param('id') _id: string): any {
    return { success: true, method: 'DELETE' };
  }
}
