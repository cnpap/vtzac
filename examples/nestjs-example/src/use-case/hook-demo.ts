import { TestInputController } from '../test-input.controller';
import { _http, setGlobalZacOfetchOptions } from 'vtzac/hook';

setGlobalZacOfetchOptions({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

// 只支持传递类构造函数
const api = _http(TestInputController, {
  ofetchOptions: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },
});

async function demo(): Promise<boolean> {
  // 返回值也有完整的类型提示。
  const result = await api.testComplex(
    '123',
    { name: 'test' },
    'v1.0',
    'Bearer token',
  );
  const data = result._data!;

  return data.success;
}

void demo();
