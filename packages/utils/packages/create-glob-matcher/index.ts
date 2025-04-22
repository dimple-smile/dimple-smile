const createGlobMatcher = (pattern: string) => {
  // if (pattern?.startsWith('/')) pattern = pattern.replace('/', '')
  // 1. 转义正则特殊字符（如 .、*、?、[ 等）
  const escapeRegex = (str: string) => str.replace(/[.+^${}()|[\]\\]/g, '\\$&')

  // 2. 将 Glob 片段转为正则片段
  const globToRegexPart = (part: string): string => {
    return (
      part
        // 处理 ? 匹配单个字符
        .replace(/\?/g, '.')
        // 处理 * 匹配任意数量字符
        .replace(/\*/g, '.*?')
        // 处理字符组 [...]
        .replace(/\[([^\]]+)\]/g, (_, group: string) => {
          return group.startsWith('!')
            ? `[^${group.slice(1)}]` // 负向字符组 [!abc]
            : `[${group}]` // 正向字符组 [abc]
        })
    )
  }

  // 3. 构建完整正则（添加 ^ 和 $ 确保全匹配）
  const regexParts = pattern.split('/').map((part) => globToRegexPart(escapeRegex(part)))
  const regexString = `^${regexParts.join('/')}$`
  const regex = new RegExp(regexString)

  // 4. 返回匹配函数
  return (input: string) => regex.test(input)
}

export { createGlobMatcher }
