/** @jsx createElement */
/** @tsx createElement */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render as customReactRender, createElement, cleanup } from '../src'

describe('My React', () => {
  describe('warm up: createElement', () => {
    test('task 0a: should create a VDOM element', () => {
      expect(<span />).toEqual({
        type: 'span',
        props: {
          children: [],
        },
      })
    })

    test('task 0b: should create a VDOM text node', () => {
      expect(<span>hello</span>).toEqual({
        type: 'span',
        props: {
          children: [
            {
              type: 'TEXT_NODE',
              props: {
                children: [],
                nodeValue: 'hello',
              },
            },
          ],
        },
      })
    })
  })

  describe('easy: rendering', () => {
    test('task 1: should render a single node', () => {
      const { container } = render(<span />)
      expect(container.innerHTML).toEqual('<span></span>')
    })

    test('task 2: should render children', () => {
      const { container } = render(
        <div>
          <span />
        </div>,
      )
      expect(container.innerHTML).toEqual('<div><span></span></div>')
    })

    test('task 3: should render text node', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')
    })

    test('task 4: should render children with text node', () => {
      const { container } = render(
        <div>
          <span>hello</span>
        </div>,
      )
      expect(container.innerHTML).toEqual('<div><span>hello</span></div>')
    })

    test('task 5a: should set props on node', () => {
      const { node } = render(<span className="hello"></span>)
      expect(node.className).toEqual('hello')
    })

    test('task 5b: should set up event listener', () => {
      const handler = jest.fn()
      const { node } = render(<span onClick={handler}></span>)
      node.click()
      expect(handler).toHaveBeenCalled()
    })

    test('task 5c: should not set event listener prop on node', () => {
      const { node }: { node: HTMLElement & { onClick?: unknown } } = render(
        <span onClick={() => {}}></span>,
      )
      expect(node.onClick).toBeUndefined()
    })
  })

  describe('easy: clean-up', () => {
    test('task 6a: should not duplicate component on re-render', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')

      render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')
    })

    test('task 6b: should replace previous DOM on re-render', () => {
      const { container } = render(<span>hello</span>)
      expect(container.innerHTML).toEqual('<span>hello</span>')

      render(<div>hello</div>)
      expect(container.innerHTML).toEqual('<div>hello</div>')
    })
  })

  describe('hard: reconciliation', () => {
    test('task 7: should re-use existing node on re-render', () => {
      const { node: span1 } = render(<span />)
      const { node: span2 } = render(<span />)

      expect(span1).toBeTruthy()
      expect(span2).toEqual(span1)
    })

    test('task 8: should re-use existing child node on re-render', () => {
      const { container } = render(
        <div>
          <span />
        </div>,
      )
      const span1 = container.querySelector('span')
      expect(span1).toBeTruthy()

      render(
        <div>
          <span />
        </div>,
      )
      const span2 = container.querySelector('span')
      expect(span1).toEqual(span2)
    })

    test('task 9: should update children props on re-render', () => {
      const { container } = render(
        <div>
          <span title="test" />
        </div>,
      )
      render(
        <div>
          <span title="another-test" />
        </div>,
      )
      const span2 = container.querySelector('span')!
      expect(span2.title).toBe('another-test')
    })
  })

  const render = (e: any) => {
    const root = document.body
    customReactRender(e, root)
    return { container: root, node: root.children[0] as HTMLElement }
  }

  afterEach(() => {
    cleanup()
  })
})
