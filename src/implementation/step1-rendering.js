export function cleanup() {
  // rootInstance = null
  document.body.innerHTML = ''
}

export function createElement(type, config, ...args) {
  const props = {
    ...config,
    children: args.map(child => 
      child instanceof Object
        ? child
        : createElement('TEXT_ELEMENT', { nodeValue: child })
    )
  }
  return {
    type,
    props
  }
}

export function render(element, parentNode) {
  const {type, props} = element

  const node = type === 'TEXT_ELEMENT'
    ? document.createTextNode(props.nodeValue)
    : document.createElement(type)

  props.children.forEach(childNode => render(childNode, node))

  Object.keys(props)
    .filter(isNodeProp)
    .forEach(key => {
      node[key] = props[key]
    })

  Object.keys(props)
    .filter(isListener)
    .forEach(key => {
      const eventType = key.substr(2).toLowerCase()
      node.addEventListener(eventType, props[key])
    })

  parentNode.appendChild(node)
}

const isListener = name => name.startsWith('on')
const isNodeProp = name => !isListener(name) && name !== 'children'

export class Component {

}