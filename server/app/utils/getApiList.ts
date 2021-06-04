import * as path from 'path'
import * as fs from 'fs'

const getApiList = (dir: string, needGetExportData?: boolean) => {
  let result: ResultItem[] = []
  const files = fs.readdirSync(dir, 'utf8')
  for (const fileName of files) {
    const filePath = path.resolve(dir, fileName)
    const fileStat = fs.statSync(filePath)
    let pushItem: any = {}
    if (fileStat.isDirectory()) {
      pushItem.key = fileName
      pushItem.name = fileName
      const groupNameFilePath = filePath + '/name'
      const groupNameFileExportData = require(groupNameFilePath)
      pushItem.name = groupNameFileExportData.name

      pushItem.children = getApiList(filePath, needGetExportData)
    } else {
      const exportData = require(filePath)
      const Api: IApi = exportData.Api || {}
      pushItem = Api
      if (needGetExportData) pushItem.exportDefault = exportData.default
    }
    pushItem.key = fileName.replace(fileName.split('.')[1], '').replace('.', '')
    if (pushItem.name) result.push(pushItem)
  }
  return result
}

export default getApiList

interface ResultItem extends IApi {
  children?: ResultItem[]
}
