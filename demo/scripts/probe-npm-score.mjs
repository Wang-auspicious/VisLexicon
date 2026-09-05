/* Inspect npm search result score structure */
const data = await (await fetch('https://registry.npmjs.org/-/v1/search?text=react%20ui%20components&size=5')).json()
for (const obj of data.objects) {
  console.log(obj.package.name, '->', JSON.stringify(obj.score))
}
