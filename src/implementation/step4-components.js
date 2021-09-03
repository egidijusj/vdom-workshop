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
  const prevInstance = rootInstance
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
    return null
  } else if (instance.element.type !== element.type) {
    const newInstance = instantiate(element)
    parentNode.replaceChild(newInstance.node, instance.node);
    return newInstance
  } else if (typeof element.type === "string") {
    updateDomProperties(instance.node, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    instance.componentInstance.props = element.props
    const childElement = instance.componentInstance.render()
    const oldChildInstance = instance.childInstance
    const newChildInstance = reconcile(parentNode, oldChildInstance, childElement)
    instance.node = newChildInstance.node
    instance.childInstance = newChildInstance
    instance.element = element
    return instance
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

  return newChildInstances.filter(instance => instance != null)
}

function instantiate(element) {
  const {type, props} = element

  if (typeof type === 'string') {
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
  } else {
    const instance = {}
    const componentInstance = new type(props)
    componentInstance.__instance = instance

    const childElement = componentInstance.render()
    const childInstance = instantiate(childElement)

    Object.assign(instance, {
      node: childInstance.node,
      element,
      childInstance,
      componentInstance
    })

    return instance
  }
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
  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }

  setState(partialState) {
    this.state = {...this.state, ...partialState}
    const {node, element} = this.__instance
    reconcile(node.parentNode, this.__instance, element)
  }
}
