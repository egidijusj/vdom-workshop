export function cleanup() {
  rootInstance = null
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

let rootInstance = null

export function render(element, parentNode) {
  let prevInstance = rootInstance
  const nextInstance = reconcile(parentNode, prevInstance, element)
  rootInstance = nextInstance
}

function reconcile(parentNode, instance, element) {
  if (!instance) {
    const newInstance = instantiate(element)
    parentNode.appendChild(newInstance.node);
    return newInstance
  } else if (!element) {
    parentNode.removeChild(instance.node)
  } else if (instance.element.type === element.type) {
    updateDomProperties(instance.node, instance.element.props, element.props)
    const childInstances = reconcileChildren(instance, element)
    instance.element = element
    instance.childInstances = childInstances
    return instance
  } else {
    const newInstance = instantiate(element)
    parentNode.replaceChild(newInstance.node, instance.node);
    return newInstance
  }
}

function reconcileChildren(instance, element) {
  const { node, childInstances } = instance
  const { props } = element
  const newChildInstances = []
  const childCount = Math.max(childInstances.length, props.children.length)

  for (let i = 0; i < childCount; i++) {
    const childInstance = childInstances[i]
    const childElement = props.children[i]
    const newChildInstance = reconcile(node, childInstance, childElement)
    newChildInstances.push(newChildInstance)
  }

  return newChildInstances
}

function instantiate(element) {
  const {type, props} = element

  const node = type === 'TEXT_ELEMENT'
    ? document.createTextNode(props.nodeValue)
    : document.createElement(type)

  const childInstances = props.children
    .map(instantiate)

  childInstances
    .forEach(childInstance => node.appendChild(childInstance.node))

  updateDomProperties(node, [], props)

  const instance = {
    node,
    element,
    childInstances
  }

  return instance
}

function updateDomProperties(node, prevProps, nextProps) {
  Object.keys(prevProps)
    .filter(isNodeProp)
    .forEach(key => {
      node[key] = undefined
    })

  Object.keys(prevProps)
    .filter(isListener)
    .forEach(key => {
      node.removeEventListener(toEventType(key), prevProps[key])
    })

  Object.keys(nextProps)
    .filter(isNodeProp)
    .forEach(key => {
      node[key] = nextProps[key]
    })

  Object.keys(nextProps)
    .filter(isListener)
    .forEach(key => {
      node.addEventListener(toEventType(key), nextProps[key])
    })
}

const isListener = name => name.startsWith('on')
const isNodeProp = name => !isListener(name) && name !== 'children'
const toEventType = name => name.substr(2).toLowerCase()

export class Component {

}