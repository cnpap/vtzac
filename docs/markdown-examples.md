# Markdown 扩展示例

此页面演示了 VitePress 提供的一些内置 markdown 扩展。

## 语法高亮

VitePress 提供由 [Shiki](https://github.com/shikijs/shiki) 驱动的语法高亮，具有行高亮等附加功能：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## 自定义容器

**输入**

```md
::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::
```

**输出**

::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::

## 更多

查看 [VitePress 文档](https://vitepress.dev/) 了解所有 markdown 扩展的完整列表。
