// 测试结果类型定义
export interface TestResult {
  message?: string;
  data?: unknown;
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
}

// 加载状态类型
export interface LoadingState {
  [key: string]: boolean;
}

// 结果状态类型
export interface ResultsState {
  [key: string]: TestResult | File[] | unknown;
}

// 查询参数对象类型
export interface QueryObject {
  page: string;
  limit: string;
  search: string;
}

// 路径参数对象类型
export interface ParamObject {
  type: string;
  id: string;
  action: string;
}

// 混合参数类型
export interface MixedParamObject {
  userId: string;
  postId: string;
}

// Headers 对象类型
export interface HeadersObject {
  authorization: string;
  'user-agent': string;
  'x-custom-header': string;
}

// 文件上传元数据类型
export interface UploadMetadata {
  metadata: string;
}

// 具名文件上传类型
export interface NamedFiles {
  documents: Express.Multer.File[];
  images: Express.Multer.File[];
}

// 复杂测试的 Body 类型
export interface ComplexTestBody {
  name: string;
  status: string;
}

// 复杂测试的 Request 类型
export interface ComplexTestRequest {
  // 这里可以根据实际需要定义具体的 request 对象结构
  [key: string]: unknown;
}

// 测试用例类型
export type TestCase =
  | 'hello'
  | 'query'
  | 'param'
  | 'headers'
  | 'upload'
  | 'complex'
  | 'delete'
  | 'websocket'
  | 'ask'
  | 'sse'
  | 'ai-sdk'
  | 'stream';

// 通用测试组件 Props 类型
export interface TestComponentProps {
  loading: LoadingState;
  results: ResultsState;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setResults: React.Dispatch<React.SetStateAction<ResultsState>>;
}

// Query 测试类型
export type QueryTestType = 'named' | 'object';

// Param 测试类型
export type ParamTestType = 'named' | 'object' | 'mixed';
