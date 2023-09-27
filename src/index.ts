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
// let rootInstance: Instance | null = null

export function createElement(
  type: string,
  attributes: Props,
  ...children: Array<VDOMElement | string>
): VDOMElement {
  throw new Error('todo')
}

export function render(
  vdomElement: VDOMElement,
  parentNode: HTMLElement,
): void {
  throw new Error('todo')
}

export function cleanup() {
  // rootInstance = null
  document.body.innerHTML = ''
}
