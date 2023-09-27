interface NativeVDOMElement {
  type: string
  props: Props & ChildrenProp
}
interface VDOMTextElement {
  type: 'TEXT_NODE'
  props: { nodeValue: string } & ChildrenProp
}
type VDOMElement = NativeVDOMElement | VDOMTextElement
type Props = Record<string, any>
interface ChildrenProp {
  children: VDOMElement[]
}
interface Instance {
  element: VDOMElement
  node: Node
  childInstances: Array<Instance | null>
}

const TEXT_NODE = 'TEXT_NODE'

export function createElement(
  type: string,
  attributes: Props,
  ...children: Array<VDOMElement | string>
): VDOMElement {
  const childIsElement = (child: VDOMElement | string): child is VDOMElement =>
    typeof child === 'object'

  const props = {
    ...attributes,
    children: children.map((child) =>
      childIsElement(child)
        ? child
        : createElement(TEXT_NODE, { nodeValue: child }),
    ),
  }
  return {
    type,
    props,
  }
}

let rootInstance: Instance | null = null

export function render(
  vdomElement: VDOMElement,
  parentNode: HTMLElement,
): void {
  const prevInstance = rootInstance
  const nextInstance = reconcile(parentNode, prevInstance, vdomElement)
  rootInstance = nextInstance
}

function reconcile(
  parentNode: HTMLElement,
  instance: Instance | null,
  vdomElement: VDOMElement,
): Instance | null {
  if (!instance) {
    const newInstance = instantiate(vdomElement)
    parentNode.appendChild(newInstance.node)
    return newInstance
  } else if (!vdomElement) {
    parentNode.removeChild(instance.node)
    return null
  } else if (vdomElement.type === instance.element.type) {
    updateDomProperties(
      instance.node,
      instance.element.props,
      vdomElement.props,
    )
    const childInstances = reconcileChildren(instance, vdomElement)
    instance.element = vdomElement
    instance.childInstances = childInstances
    return instance
  } else {
    const newInstance = instantiate(vdomElement)
    parentNode.replaceChild(newInstance.node, instance.node)
    return newInstance
  }
}

function instantiate(vdomElement: VDOMElement): Instance {
  const elementIsTextNode = (
    element: VDOMElement,
  ): element is VDOMTextElement => element.type === TEXT_NODE

  const node: Node = elementIsTextNode(vdomElement)
    ? document.createTextNode(vdomElement.props.nodeValue)
    : document.createElement(vdomElement.type)

  updateDomProperties(node, {}, vdomElement.props)

  const childInstances = vdomElement.props.children.map((childElement) =>
    instantiate(childElement),
  )

  childInstances.forEach((childInstance) =>
    node.appendChild(childInstance.node),
  )

  return {
    element: vdomElement,
    node,
    childInstances,
  }
}

function reconcileChildren(
  instance: Instance,
  vdomElement: VDOMElement,
): (Instance | null)[] {
  const childCount = Math.max(
    vdomElement.props.children.length,
    instance.childInstances.length,
  )
  const childInstances = []
  for (let i = 0; i < childCount; i++) {
    const childInstance = instance.childInstances[i]
    const childElement = vdomElement.props.children[i]
    const newChildInstance = reconcile(
      instance.node as HTMLElement,
      childInstance,
      childElement,
    )
    childInstances.push(newChildInstance)
  }

  return childInstances
}

function updateDomProperties(node: Node, prevProps: Props, nextProps: Props) {
  Object.keys(prevProps)
    .filter(isValidNodeProp)
    .forEach((prop) => {
      delete (node as any)[prop]
    })

  Object.keys(prevProps)
    .filter(isListenerProp)
    .forEach((prop) => {
      const eventType = prop.replace('on', '').toLowerCase()
      node.removeEventListener(eventType, prevProps[prop])
    })

  Object.keys(nextProps)
    .filter(isValidNodeProp)
    .forEach((prop) => {
      ;(node as any)[prop] = nextProps[prop]
    })

  Object.keys(nextProps)
    .filter(isListenerProp)
    .forEach((prop) => {
      const eventType = prop.replace('on', '').toLowerCase()
      node.addEventListener(eventType, nextProps[prop])
    })
}

function isValidNodeProp(prop: string) {
  return prop !== 'children' && !isListenerProp(prop)
}

function isListenerProp(prop: string) {
  return prop.startsWith('on')
}

export function cleanup() {
  rootInstance = null
  document.body.innerHTML = ''
}
