import fs from 'node:fs'
import ts from 'typescript'

/**
 * 创建虚拟文件
 */
export function virtualSourceFile(id: string, code: string): ts.SourceFile {
  return ts.createSourceFile(
    id,
    code,
    ts.ScriptTarget.ESNext,
    true,
  )
}

/**
 * 装饰器参数信息
 */
export interface DecoratorArgument {
  type: 'string' | 'object' | 'array' | 'number' | 'boolean' | 'unknown'
  value: any
  raw: string
}

/**
 * 方法参数信息
 */
export interface MethodParameter {
  name: string
  type: string
  decorators: {
    name: string
    arguments: DecoratorArgument[]
  }[]
}

/**
 * HTTP 方法信息
 */
export interface HttpMethodInfo {
  name: string
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
  path?: string
  parameters: MethodParameter[]
  decorators: {
    name: string
    arguments: DecoratorArgument[]
  }[]
}

/**
 * 控制器信息
 */
export interface ControllerInfo {
  name: string
  prefix?: string
  methods: HttpMethodInfo[]
  decorators: {
    name: string
    arguments: DecoratorArgument[]
  }[]
}

/**
 * 文件参数详细信息
 */
export interface FileParameterInfo {
  /** 参数名称 */
  parameterName: string
  /** 参数类型 */
  parameterType: string
  /** 文件字段信息 */
  fileFields: {
    /** 字段名 */
    fieldName: string
    /** 是否为数组类型 */
    isArray: boolean
    /** 最大文件数量（仅对数组类型有效） */
    maxCount?: number
  }[]
  /** 文件上传类型 */
  uploadType: 'single' | 'multiple' | 'named-multiple'
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  controllers: ControllerInfo[]
}

/**
 * 解析装饰器参数
 */
function parseDecoratorArguments(args: ts.NodeArray<ts.Expression>): DecoratorArgument[] {
  return args.map((arg) => {
    const raw = arg.getText()

    if (ts.isStringLiteral(arg)) {
      return {
        type: 'string',
        value: arg.text,
        raw,
      }
    }

    if (ts.isNumericLiteral(arg)) {
      return {
        type: 'number',
        value: Number(arg.text),
        raw,
      }
    }

    if (arg.kind === ts.SyntaxKind.TrueKeyword || arg.kind === ts.SyntaxKind.FalseKeyword) {
      return {
        type: 'boolean',
        value: arg.kind === ts.SyntaxKind.TrueKeyword,
        raw,
      }
    }

    if (ts.isObjectLiteralExpression(arg)) {
      const obj: any = {}
      arg.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          const key = prop.name.text
          if (ts.isStringLiteral(prop.initializer)) {
            obj[key] = prop.initializer.text
          }
          else if (ts.isNumericLiteral(prop.initializer)) {
            obj[key] = Number(prop.initializer.text)
          }
          else if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword || prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
            obj[key] = prop.initializer.kind === ts.SyntaxKind.TrueKeyword
          }
          else {
            obj[key] = prop.initializer.getText()
          }
        }
      })
      return {
        type: 'object',
        value: obj,
        raw,
      }
    }

    if (ts.isArrayLiteralExpression(arg)) {
      const arr = arg.elements.map((element) => {
        if (ts.isStringLiteral(element)) {
          return element.text
        }
        else if (ts.isNumericLiteral(element)) {
          return Number(element.text)
        }
        else if (ts.isObjectLiteralExpression(element)) {
          const obj: any = {}
          element.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const key = prop.name.text
              if (ts.isStringLiteral(prop.initializer)) {
                obj[key] = prop.initializer.text
              }
              else if (ts.isNumericLiteral(prop.initializer)) {
                obj[key] = Number(prop.initializer.text)
              }
              else {
                obj[key] = prop.initializer.getText()
              }
            }
          })
          return obj
        }
        return element.getText()
      })
      return {
        type: 'array',
        value: arr,
        raw,
      }
    }

    return {
      type: 'unknown',
      value: raw,
      raw,
    }
  })
}

/**
 * 获取装饰器信息
 */
function getDecorators(node: ts.Node): { name: string, arguments: DecoratorArgument[] }[] {
  const decorators: { name: string, arguments: DecoratorArgument[] }[] = []

  // 在新版本的 TypeScript 中，装饰器可能在 modifiers 中
  const nodeDecorators = (node as any).decorators
    || ((node as any).modifiers?.filter((mod: any) => mod.kind === ts.SyntaxKind.Decorator))

  if (nodeDecorators) {
    nodeDecorators.forEach((decorator: any) => {
      if (ts.isCallExpression(decorator.expression)) {
        const name = decorator.expression.expression.getText()
        const args = parseDecoratorArguments(decorator.expression.arguments)
        decorators.push({ name, arguments: args })
      }
      else {
        const name = decorator.expression.getText()
        decorators.push({ name, arguments: [] })
      }
    })
  }

  return decorators
}

/**
 * 获取 HTTP 方法类型
 */
function getHttpMethod(decoratorName: string): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | null {
  const methodMap: Record<string, 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'> = {
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Delete: 'DELETE',
    Patch: 'PATCH',
    Options: 'OPTIONS',
    Head: 'HEAD',
  }

  return methodMap[decoratorName] || null
}

/**
 * 分析方法参数
 */
function analyzeMethodParameters(method: ts.MethodDeclaration): MethodParameter[] {
  const parameters: MethodParameter[] = []

  method.parameters.forEach((param) => {
    if (ts.isIdentifier(param.name)) {
      const paramName = param.name.text
      const paramType = param.type ? param.type.getText() : 'any'
      const decorators = getDecorators(param)

      parameters.push({
        name: paramName,
        type: paramType,
        decorators,
      })
    }
  })

  return parameters
}

/**
 * 分析控制器类
 */
function analyzeController(classNode: ts.ClassDeclaration): ControllerInfo | null {
  if (!classNode.name)
    return null

  const className = classNode.name.text
  const classDecorators = getDecorators(classNode)

  // 查找 @Controller 装饰器
  const controllerDecorator = classDecorators.find(d => d.name === 'Controller')
  const prefix = controllerDecorator?.arguments[0]?.value || ''

  const methods: HttpMethodInfo[] = []

  // 分析类中的方法
  classNode.members.forEach((member) => {
    if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
      const methodName = member.name.text
      const methodDecorators = getDecorators(member)
      const parameters = analyzeMethodParameters(member)

      // 查找 HTTP 方法装饰器
      const httpDecorator = methodDecorators.find(d => getHttpMethod(d.name))
      if (httpDecorator) {
        const httpMethod = getHttpMethod(httpDecorator.name)!
        const path = httpDecorator.arguments[0]?.value || ''

        methods.push({
          name: methodName,
          httpMethod,
          path,
          parameters,
          decorators: methodDecorators,
        })
      }
    }
  })

  return {
    name: className,
    prefix,
    methods,
    decorators: classDecorators,
  }
}

/**
 * 分析 NestJS 控制器文件
 */
export function analyzeNestJSController(filePath: string): AnalysisResult {
  // 读取文件内容
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  // 创建 TypeScript 源文件
  const sourceFile = virtualSourceFile(filePath, fileContent)

  const controllers: ControllerInfo[] = []

  // 遍历 AST 节点
  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      const controllerInfo = analyzeController(node)
      if (controllerInfo) {
        controllers.push(controllerInfo)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return { controllers }
}

/**
 * 解析文件参数类型信息
 */
function parseFileParameterType(parameterType: string): {
  isArray: boolean
  fieldNames: string[]
  isNamedMultiple: boolean
} {
  // 移除空格和换行符
  const cleanType = parameterType.replace(/\s+/g, ' ').trim()

  // 检查是否为具名多文件类型：{ documents?: Express.Multer.File[], images?: Express.Multer.File[] }
  const namedMultipleMatch = cleanType.match(/\{([^}]*)\}/)
  if (namedMultipleMatch) {
    const fieldsStr = namedMultipleMatch[1].trim()
    const fieldNames: string[] = []

    // 匹配字段名：fieldName?: Express.Multer.File[] 或 fieldName?: Express.Multer.File
    const fieldMatches = fieldsStr.matchAll(/(\w+)\?\s*:\s*Express\.Multer\.File(?:\[\])?/g)
    for (const match of fieldMatches) {
      fieldNames.push(match[1])
    }

    return {
      isArray: true, // 具名多文件通常都是数组
      fieldNames,
      isNamedMultiple: true,
    }
  }

  // 检查是否为数组类型：Express.Multer.File[]
  if (cleanType.includes('Express.Multer.File[]')) {
    return {
      isArray: true,
      fieldNames: [], // 需要从装饰器中获取
      isNamedMultiple: false,
    }
  }

  // 单文件类型：Express.Multer.File
  if (cleanType.includes('Express.Multer.File')) {
    return {
      isArray: false,
      fieldNames: [], // 需要从装饰器中获取
      isNamedMultiple: false,
    }
  }

  return {
    isArray: false,
    fieldNames: [],
    isNamedMultiple: false,
  }
}

/**
 * 获取文件参数的详细信息
 */
export function getFileParameterInfo(methodInfo: HttpMethodInfo): FileParameterInfo | null {
  // 查找文件上传相关的参数
  const fileParam = methodInfo.parameters.find(p =>
    p.decorators.some(d => d.name === 'UploadedFile' || d.name === 'UploadedFiles'),
  )

  if (!fileParam) {
    return null
  }

  // 解析参数类型
  const typeInfo = parseFileParameterType(fileParam.type)

  // 获取装饰器信息
  const uploadInfo = getFileUploadInfo(methodInfo)

  if (uploadInfo.type === 'none') {
    return null
  }

  // 构建文件字段信息
  const fileFields: FileParameterInfo['fileFields'] = []

  if (typeInfo.isNamedMultiple) {
    // 具名多文件：从参数类型中获取字段名
    for (const fieldName of typeInfo.fieldNames) {
      fileFields.push({
        fieldName,
        isArray: true,
        maxCount: uploadInfo.details?.[fieldName]?.maxCount,
      })
    }
  }
  else {
    // 单文件或多文件：从装饰器中获取字段名
    const fieldName = uploadInfo.fieldNames?.[0] || 'file'
    fileFields.push({
      fieldName,
      isArray: typeInfo.isArray,
      maxCount: uploadInfo.maxCount,
    })
  }

  return {
    parameterName: fileParam.name,
    parameterType: fileParam.type,
    fileFields,
    uploadType: uploadInfo.type as 'single' | 'multiple' | 'named-multiple',
  }
}

/**
 * 获取文件上传装饰器的详细信息
 */
export function getFileUploadInfo(methodInfo: HttpMethodInfo): {
  type: 'single' | 'multiple' | 'named-multiple' | 'none'
  fieldNames?: string[]
  maxCount?: number
  details?: any
} {
  // 检查 UseInterceptors 装饰器
  const interceptorDecorator = methodInfo.decorators.find(d => d.name === 'UseInterceptors')
  if (!interceptorDecorator) {
    return { type: 'none' }
  }

  const interceptorArg = interceptorDecorator.arguments[0]?.raw || ''

  if (interceptorArg.includes('FileInterceptor')) {
    // 单文件上传
    const match = interceptorArg.match(/FileInterceptor\(['"]([^'"]+)['"]\)/)
    const fieldName = match ? match[1] : 'file'
    return {
      type: 'single',
      fieldNames: [fieldName],
    }
  }

  if (interceptorArg.includes('FilesInterceptor')) {
    // 多文件上传
    const match = interceptorArg.match(/FilesInterceptor\(['"]([^'"]+)['"],\s*(\d+)\)/)
    const fieldName = match ? match[1] : 'files'
    const maxCount = match ? Number.parseInt(match[2]) : undefined
    return {
      type: 'multiple',
      fieldNames: [fieldName],
      maxCount,
    }
  }

  if (interceptorArg.includes('FileFieldsInterceptor')) {
    // 具名多文件上传
    const fieldNames: string[] = []
    const details: any = {}

    // 尝试解析字段配置
    const fieldsMatch = interceptorArg.match(/\[([^\]]+)\]/)
    if (fieldsMatch) {
      const fieldsStr = fieldsMatch[1]
      const fieldMatches = fieldsStr.matchAll(/\{\s*name:\s*['"]([^'"]+)['"],\s*maxCount:\s*(\d+)\s*\}/g)

      for (const match of fieldMatches) {
        const fieldName = match[1]
        const maxCount = Number.parseInt(match[2])
        fieldNames.push(fieldName)
        details[fieldName] = { maxCount }
      }
    }

    return {
      type: 'named-multiple',
      fieldNames,
      details,
    }
  }

  return { type: 'none' }
}
