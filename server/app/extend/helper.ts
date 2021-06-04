import * as path from 'path';
import * as fs from 'fs';

export default {
  randomNum(n: number) {
    let t = ''
    for (let i = 0; i < n; i++) {
      t += Math.floor(Math.random() * 10)
    }
    return t
  },
  /**
   * @description // 递归读取文件，类似于webpack的require.context()
   * @time 2020-9-12
   *
   * @param {String} directory 文件目录
   * @param {Boolean} useSubdirectories 是否查询子目录，默认false
   * @param {array} extList 查询文件后缀，默认 ['.js']
   *
   */
  requireContext(dir: string): any[] {
    const load = function (path, name) {
      if (name) {
        return require(path + name)
      }
      return require(path)
    }
    let patcher: any = {}

    fs.readdirSync(dir).forEach(filename => {
      if (!/\.js$/.test(filename)) {
        return
      }
      let name = path.basename(filename, '.js')
      let _load = load.bind(null, './' + dir + '/', name)

      patcher.__defineGetter__(name, _load)
    })

    return patcher
  },
}
