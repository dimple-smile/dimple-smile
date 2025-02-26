function readPackage(pkg, context) {
  const lockPackages = { dayjs: '1.11.10', '@dimple-smile/mframe': 'workspace:*' }

  Object.keys(pkg.dependencies)
    .filter((key) => lockPackages[key] && pkg.dependencies && pkg.dependencies[key])
    .forEach((key) => (pkg.dependencies[key] = lockPackages[key]))
  Object.keys(pkg.devDependencies)
    .filter((key) => lockPackages[key] && pkg.devDependencies && pkg.devDependencies[key])
    .forEach((key) => (pkg.devDependencies[key] = lockPackages[key]))
  return pkg
}

module.exports = { hooks: { readPackage } }
