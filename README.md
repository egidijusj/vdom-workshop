# Welcome to Create Your Own React workshop

In this workshop you will learn more about the concept of Virtual DOM, JSX, React terminology and as well as will replicate a very minimal version of React from scratch.

## Task 0 Warmup

Your goal is to implement `createElement` function. Typescript compiler will detect JSX syntax in .tsx files and will automatically convert html-style tags into valid TS code. 

Given the following JSX

```
<button label="I'm a button!">Click me</button>
```

It will extract 3 parts from it:
1. HTML Element type (`button`)
2. HTML Element attributes (`{ label: "I'm a button!" }`)
3. Child nodes (string `click me`)

Using this information and having the interface of `createElement` function in `src/index.ts`, implement the function which returns a valid instance of `VDOMElement` type which has the following shape:

```
{ type: string; props: Record<string, any> }
```

The `type` value must match the HTML tag and `props` must be an object containing all html attributes.

Note that `children` is a prop that always exists in JSX world and must be present in `VDOMElement`'s `props` value, even if jsx tag does not have any child elements (e.g. `<span />` is a tag without elements)

In the B part, your goal is to create a VDOM element representing text node, or a string, such as in the example below:

```
<span>hello</span>
```

This example of JSX has two nodes: `span` & `textNode` with the value of `"hello"`. You can use the constant `TEXT_NODE` to represent the type of this special VDOM element.

## Task 1

Your goal is to implement `render` function, which gets a `VDOMElement` (that we managed to create in previous step), and based on type, creates an actual DOM element. Second argument to `render` function is `parentNode` which represents the root element onto which our custom React will be rendering JSX.

To learn more about creating new DOM elements & adding them to the DOM, check out [document.createElement docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement) and [node.appendChild docs](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild).

## Task 2

Your goal is to adjust `render` function so that it can render not only the root JSX tag, but also its children. You might need to tweak your `createElement` function in order to have the JSX child tags in the `VDOMElement`'s `children` prop. Once `children` prop is correctly populated, the `render` function should iterate over `VDOMElement` `props.children` array and recursively render each child.

## Task 3

Your goal is to adjust `render` function so that it can render text nodes. For that you might check out [document.createTextNode docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode)

## Task 4

If you implemented everything correctly, this step may already be implemented as part of previous step, but the goal is to ensure that text nodes are rendered correctly in a deeply nested JSX structure.

## Task 5

### A part
Your goal is to ensure that JSX attributes are passed to DOM nodes correctly. Setting properties on DOM nodes is as simple as assigning a value to the property name, e.g. `node.propertyName = value`. Keep in mind that `children` property is very special in DOM world and since we are already handling it in our render function, this property should not be added to the DOM node.

If you encounter a difficulty with TS not allowing to set arbitrary properties to `Node` instance, feel free to cast `node` as `any`, as `props` validation is outside of scope of this workshop.

### B part
Your goal is to ensure that JSX event handlers are passed as native event handlers to DOM nodes. In JSX, it's very typical for native event handler to be named in the following manner:

```
"on" + "<EventType>"
```
e.g. JSX attribute `onClick` would correspond to `click` event on a native DOM node.

To learn more how to attach event handlers to DOM nodes, check out [node.addEventListener docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

### C part
Since click handlers are managed in special way, they should not be added as node properties in the same as regular properties are.

### Task 6

In React it is very common that same VDOMElements are rendered multiple times due to various reasons. Your goal is to ensure that subsequent re-renders do not produce multiple DOM nodes for the same VDOM element.

One way to deal with that is to replace any existing DOM node with the new DOM node. Checking if a node contains any child nodes with [node.lastChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild)` and replacing them with  [node.replaceChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild) can be useful in this case.

### Task 7

Up until now our custom React is quite inefficient. On every re-render, it throws away all of the work done previously and renders everything from scratch. In this task your goal is to reuse as much work as possible from previous renders.

For that, we need to introduce a new concept: `Instance`. Instance ties together a VDOM element and a DOM node. Whenever a new VDOM element needs to be rendered, we can use data stored in instance to check how much work we actually need to do, e.g. if previous render and next render require a `span` element and only their `title` prop differs, we might not need to throw away existing `span` DOM node and instead just update its props.

For starters, we need to have a global `instance` variable which will represent the previous render of root JSX tag. You should find `rootInstance` variable which is commented out and should be uncommented.

Next, we need to split the contents of `render` function into 2: a `reconcile` function and a `instantiate` function.
The purpose of `reconcile` function is to check data of previous instance and decide, whether we can keep existing DOM node or should we create a new one.
The purpose of `instantiate` function is to simply create DOM nodes as previously was done by `render`.

You may use these interfaces for the functions as a starting point:

```
function reconcile(
  parentNode: Node,
  instance: Instance | null,
  vdomElement: VDOMElement,
): Instance | null {
  //
}

function instantiate(vdomElement: VDOMElement): Instance {
  //
}
```

Our `render` function should look like this:

```
export function render(vdomElement: VDOMElement, parentNode: Node): void {
  const prevInstance = rootInstance
  const nextInstance = reconcile(parentNode, prevInstance, vdomElement)
  rootInstance = nextInstance
}
```

`reconcile` function has several decisions to make when invoked:
1. if `instance` passed to it is null, it is very likely that our JSX is rendered for the first time and there is no previous work done. In that case, we instantiate a new DOM node and add it to the parentNode as usual.
2. If `instance` exists but `element` is null, it's likely that our previously rendered DOM node is no longer present in virtual DOM and should be removed
3. If element type of previously rendered DOM node in the `instance` is the same as currently rendered `element` type, then it means we are re-rendering the same JSX tag. All we need to do is to ensure props are updated.
4. Otherwise, it is likely that previous element and new element are different JSX tags, so we should throw previous work away and create a new DOM node.

`instantiate` function is supposed to work almost as our previous `render` function, however, instead of appending created nodes on the parent node, it should create a new `instance` object containing the created DOM node, a reference to `VDOMElement` object for which the DOM node was created and any child instances that were creatred from `VDOMElement` `children` prop.

### Task 8

If you paid attention to previous task's description about child instances, you should be almost there. The goal is to ensure that any child instance created as part of its parent's instantiation is also appended to parent's DOM node.

### Task 9 and beyond

The task does not introduce any new features, but it serves as a sanity check to ensure previously working functionality is still working. At this point it is a good idea to run all the previously passing tests and see any previously functionality is broken. To move forward, go over the description of task 7 and see if reconcile function handles all the cases.

If you get stuck, don't hesitate to checkout out final code in `src/implementation/final.ts`.