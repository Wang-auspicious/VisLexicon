/* 舞台节点绑定器。
 * 舞台组件用它给每个可命名部件打上 data-node，热区的双向联动全走这里：
 *   悬停节点 → 左栏对应术语高亮、浮标报出它叫什么
 *   点选术语 → 该节点描边跑一圈
 * 返回纯 props 对象，不依赖 React，可单测。
 */
export function makeNodeBinder({ activeNode, hoverNode, onHover } = {}) {
  return function node(name, extraClass = '') {
    const on = activeNode === name || hoverNode === name
    return {
      'data-node': name,
      className: [extraClass, 'sn', on ? 'sn-on' : ''].filter(Boolean).join(' '),
      onMouseEnter: onHover ? () => onHover(name) : undefined,
      onMouseLeave: onHover ? () => onHover(null) : undefined,
    }
  }
}
