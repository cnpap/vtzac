// import.meta.glob
// 全局类型声明

interface ImportMeta {
  glob: (pattern: string | string[]) => Record<string, any>
}
