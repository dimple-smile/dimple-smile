import * as path from 'path'
import * as fs from 'fs'
const getFilesTree = (dir: string, exprotData?: boolean) => {
  let result: ResultItem[] = []
  const filePaths = fs.readdirSync(dir, 'utf8')
  for (const filePath of filePaths) {
    const fileName = filePath.split('.')[0]
    const fileFullPath = path.resolve(dir, filePath)
    const fileStat = fs.statSync(fileFullPath)
    let pushItem: ResultItem = { name: fileName, path: fileFullPath }
    if (fileStat.isDirectory()) {
      pushItem.children = getFilesTree(fileFullPath)
    } else {
      if (exprotData) pushItem.exprotData = require(fileFullPath)
    }
    result.push(pushItem)
  }
  return result
}

export default getFilesTree

type ResultItem = {
  name: string
  path: string
  children?: ResultItem[]
  exprotData?: any
}
