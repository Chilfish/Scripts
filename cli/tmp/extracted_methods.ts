import * as fs from 'node:fs'
import * as path from 'node:path'
import * as ts from 'typescript'

// 配置路径
const INPUT_FILE = path.join(__dirname, 'index.min.js') // 请将你的源代码保存为 source.js
const OUTPUT_FILE = path.join(__dirname, 'extracted_methods.js')

// 存储提取结果的接口
interface ExtractedFunction {
  name: string
  node: ts.FunctionDeclaration
  endpoints: string[] // 该函数内包含的 endpoint
}

/**
 * 递归扫描节点，寻找包含 '/ajax/' 的字符串字面量或模板字面量
 */
function findAjaxEndpoints(node: ts.Node): string[] {
  const endpoints: string[] = []

  function visit(n: ts.Node) {
    // 检查普通字符串: 'url'
    if (ts.isStringLiteral(n)) {
      if (n.text.includes('/ajax/')) {
        endpoints.push(n.text)
      }
    }
    // 检查无替换模板字符串: `url`
    else if (ts.isNoSubstitutionTemplateLiteral(n)) {
      if (n.text.includes('/ajax/')) {
        endpoints.push(n.text)
      }
    }
    // 检查带变量的模板字符串: `url${var}`
    // 这里只检查头部，通常 API 路径的前缀在头部
    else if (ts.isTemplateExpression(n)) {
      if (n.head.text.includes('/ajax/')) {
        // 简单处理：只取头部文本，或者尝试拼接
        endpoints.push(`${n.head.text}...`)
      }
    }

    ts.forEachChild(n, visit)
  }

  visit(node)
  return endpoints
}

function processFile() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file ${INPUT_FILE} not found.`)
    return
  }

  const sourceCode = fs.readFileSync(INPUT_FILE, 'utf-8')
  const sourceFile = ts.createSourceFile(INPUT_FILE, sourceCode, ts.ScriptTarget.Latest, true)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const allEndpoints = new Set<string>()
  const extractedFunctions: ExtractedFunction[] = []

  // 转换核心逻辑
  function transform(node: ts.Node) {
    // 寻找 const _sfc_main = { ... }
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name) && declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
          const componentName = declaration.name.text

          // 寻找 methods 属性
          const methodsProp = declaration.initializer.properties.find(prop =>
            ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'methods',
          ) as ts.PropertyAssignment | undefined

          if (methodsProp && ts.isObjectLiteralExpression(methodsProp.initializer)) {
            methodsProp.initializer.properties.forEach((method) => {
              let functionName = ''
              let body: ts.Block | undefined
              let params: ts.NodeArray<ts.ParameterDeclaration> | undefined
              let modifiers: ts.NodeArray<ts.Modifier> | undefined // 处理 async

              // 1. 处理 method() {}
              if (ts.isMethodDeclaration(method) && ts.isIdentifier(method.name) && method.body) {
                functionName = `${componentName}_${method.name.text}`
                body = method.body
                params = method.parameters
                modifiers = method.modifiers
              }
              // 2. 处理 method: function() {}
              else if (ts.isPropertyAssignment(method) && ts.isFunctionExpression(method.initializer) && ts.isIdentifier(method.name)) {
                functionName = `${componentName}_${method.name.text}`
                body = method.initializer.body
                params = method.initializer.parameters
                modifiers = method.initializer.modifiers
              }
              // 忽略简写属性 (如 copyTextToClipboard)，因为无法判断其内部逻辑是否含 ajax

              if (functionName && body && params) {
                // *** 核心过滤逻辑 ***
                const endpoints = findAjaxEndpoints(body)

                if (endpoints.length > 0) {
                  // 收集所有 endpoint 用于头部注释
                  endpoints.forEach(ep => allEndpoints.add(ep))

                  // 创建标准函数声明 AST 节点
                  const funcNode = ts.factory.createFunctionDeclaration(
                    modifiers,
                    undefined,
                    ts.factory.createIdentifier(functionName),
                    undefined,
                    params,
                    undefined,
                    body,
                  )

                  extractedFunctions.push({
                    name: functionName,
                    node: funcNode,
                    endpoints,
                  })
                }
              }
            })
          }
        }
      })
    }
    ts.forEachChild(node, transform)
  }

  transform(sourceFile)

  // --- 生成输出内容 ---

  let outputContent = ''

  // 1. 生成 Endpoint 头部注释
  if (allEndpoints.size > 0) {
    outputContent += '/**\n * Detected AJAX Endpoints in this file:\n'
    Array.from(allEndpoints).sort().forEach((url) => {
      outputContent += ` * - ${url}\n`
    })
    outputContent += ' */\n\n'
  }
  else {
    outputContent += '// No AJAX endpoints detected.\n\n'
  }

  // 2. 生成函数代码
  extractedFunctions.forEach((item) => {
    const jsCode = printer.printNode(ts.EmitHint.Unspecified, item.node, sourceFile)
    outputContent += `// Found endpoints: ${item.endpoints.join(', ')}\n`
    outputContent += `${jsCode}\n\n`
  })

  fs.writeFileSync(OUTPUT_FILE, outputContent)
  console.log(`Extraction complete. Found ${extractedFunctions.length} methods with AJAX calls.`)
  console.log(`Output written to: ${OUTPUT_FILE}`)
}

processFile()
