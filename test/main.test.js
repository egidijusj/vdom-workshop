/** @jsx createElement */
import { 
  render as customReactRender,
  createElement,
  Component,
  cleanup
} from '../src'

describe('My React', () => {
  
  describe('step 1 - rendering', () => {
    test('should render a single node', () => {
      const { container } = render(<span />)
      expect(container.innerHTML).toEqual('<span></span>')
    })

    test('should render multiple nodes', () => {
      const { container } = render(<div><span/></div>)
      expect(container.innerHTML).toEqual('<div><span></span></div>')
    })

    test('should render text node', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')
    })

    test('should render children with text node', () => {
      const { container } = render(<div><span>hello</span></div>)
      expect(container.innerHTML).toEqual('<div><span>hello</span></div>')
    })

    test('should set node properties', () => {
      const { node } = render(<span class="hello"></span>)
      expect(node['class']).toEqual('hello')
    })

    test('should set up event listener', () => {
      const handler = jest.fn()
      const { node } = render(<span onClick={handler}></span>)
      node.click()
      expect(handler).toHaveBeenCalled()
    })

    test('should not set event listener prop on node', () => {
      const { node } = render(<span onClick={() => {}}></span>)
      expect(node['onClick']).toBeUndefined()
    })
  })

  describe('step 2 - naive updates', () => {
    test('should not duplicate component on re-render', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')

      render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')
    })

    test('should replace previous DOM on re-render', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')

      render(<div>hello</div>)
      expect(container.innerHTML).toEqual('<div>hello</div>')
    })

    test('should add new properties on re-render', () => {
      const { node: span1 } = render(<span class="hello" />)
      expect(span1['class']).toBe('hello')

      const { node: span2 } = render(<span class="world" id="test"></span>)
      expect(span2['class']).toBe('world')
      expect(span2['id']).toBe('test')
    })

    test('should remove properties on re-render', () => {
      const { node: span1 } = render(<span class="hello" />)
      expect(span1['class']).toBe('hello')

      const { node: span2 } = render(<span id="test"></span>)
      expect(span2['class']).toBe(undefined)
    })

    test('should update event listeners on re-render', () => {
      const onClick1 = jest.fn()
      const onClick2 = jest.fn()
      const { node } = render(<span onClick={onClick1} />)
      render(<span onClick={onClick2} />)
      node.click()
      expect(onClick1).not.toHaveBeenCalled()
      expect(onClick2).toHaveBeenCalled()
    })

    test('should add new event listeners on re-render', () => {
      const onClick = jest.fn()
      const { node } = render(<span />)
      render(<span onClick={onClick} />)
      node.click()
      expect(onClick).toHaveBeenCalled()
    })

    test('should remove event listeners on re-render', () => {
      const onClick = jest.fn()
      const { node } = render(<span onClick={onClick} />)
      render(<span />)
      node.click()
      expect(onClick).not.toHaveBeenCalled()
    })

    test('should update properties on re-render', () => {
      const { node: span1 } = render(<span class="hello" />)
      expect(span1['class']).toBe('hello')

      const { node: span2 } = render(<span class="world"></span>)
      expect(span2['class']).toBe('world')
    })

    test('should add children on re-render', () => {
      const { container } = render(<div />)
      render(<div><span>hello</span></div>)
      expect(container.innerHTML).toBe('<div><span>hello</span></div>')
    })

    test('should remove children on re-render', () => {
      const { container } = render(<div><span>hello</span></div>)
      render(<div />)
      expect(container.innerHTML).toBe('<div></div>')
    })

    test('should update children on re-render', () => {
      const { container } = render(<div><span>hello</span></div>)
      render(<div><span class="test">world</span></div>)
      expect(container.innerHTML).toBe('<div><span>world</span></div>')
      expect(container.querySelector('span')['class']).toBe('test')
    })
  })

  describe('step 3 - reconciliation', () => {
    test('should re-use existing node on re-render', () => {
      const { node: span1, container } = render(<span>hello</span>)
      span1.__secretProp = true
      const { node: span2 } = render(<span>world</span>)
      expect(container.children.length).toBe(1)
      expect(span2.__secretProp).toBe(true)
    })

    test('should re-use existing child node on re-render', () => {
      const { container } = render(<div><span>hello</span></div>)
      const span1 = container.querySelector('span')
      span1.__secretProp = true
      render(<div><span>world</span></div>)
      const span2 = container.querySelector('span')
      expect(span2.__secretProp).toBe(true)
    })
  })

  describe('step 4 - components', () => {
    test('should render a component', () => {
      class TestComponent extends Component {
        render() {
          return <span>hello world</span>
        }
      }
      const { container } = render(<TestComponent />)
      expect(container.innerHTML).toBe('<span>hello world</span>')
    })

    test('should support component props', () => {
      class TestComponent extends Component {
        render() {
          return <button>{this.props.value}</button>
        }
      }
      const { container } = render(<TestComponent value={2} />)
      expect(container.innerHTML).toBe('<button>2</button>')
    })

    test('should support component state', () => {
      class TestComponent extends Component {
        constructor() {
          super()
          this.state = { value: 1 }
        }
        render() {
          return <button>{this.state.value}</button>
        }
      }
      const { container } = render(<TestComponent />)
      expect(container.innerHTML).toBe('<button>1</button>')
    })

    test('should re-render on state change', () => {
      class TestComponent extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 1 }
        }
        render() {
          const increment = () => this.setState({ value: this.state.value + 1 })
          return <button onClick={increment}>{this.state.value}</button>
        }
      }
      const { container } = render(<TestComponent />)
      const button = container.querySelector('button')

      button.click()
      expect(container.innerHTML).toBe('<button>2</button>')

      button.click()
      expect(container.innerHTML).toBe('<button>3</button>')
    })
  })

  const render = (e) => {
    const root = document.body
    customReactRender(e, root)
    return { container: root, node: root.childNodes[0] }
  }

  afterEach(() => {
    cleanup()
  })
})