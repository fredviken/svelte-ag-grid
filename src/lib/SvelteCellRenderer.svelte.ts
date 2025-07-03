import type { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { mount, unmount, type Component, type Snippet } from 'svelte';
import CellRenderer from './CellRenderer.svelte';

/**
 * Function that transforms AG Grid cell renderer parameters into component props
 * @template T The props type expected by the component or snippet
 */
type PropsTransformer<T> = (params: ICellRendererParams) => T;

/**
 * Creates an AG Grid cell renderer class that renders a Svelte component.
 *
 * This function allows you to use any Svelte component as a cell renderer in AG Grid.
 * The component will be mounted when the cell is created and unmounted when destroyed.
 *
 * @template T The props type expected by the Svelte component
 * @param component - The Svelte component to render in the cell
 * @param propsTransformer - Function that converts AG Grid's ICellRendererParams to component props
 * @returns AG Grid cell renderer class that can be used in column definitions
 *
 * @example
 * ```typescript
 * import MyButton from './MyButton.svelte';
 *
 * const ButtonRenderer = makeSvelteCellRenderer(MyButton, (params) => ({
 *   label: params.value,
 *   onclick: () => console.log('Clicked:', params.data)
 * }));
 *
 * const columnDefs = [
 *   {
 *     field: 'action',
 *     cellRenderer: ButtonRenderer
 *   }
 * ];
 * ```
 */
export default function makeSvelteCellRenderer<T extends Record<string, unknown>>(
	component: Component<T>,
	propsTransformer: PropsTransformer<T>
) {
	return class SvelteCellRenderer implements ICellRenderer {
		element: HTMLElement | undefined = undefined;
		component: Record<string, unknown> | undefined = undefined;
		props: ICellRendererParams | undefined = $state(undefined);

		init(params: ICellRendererParams) {
			this.element = document.createElement('div');
			this.props = params;

			this.component = mount(component, {
				target: this.element,
				props: propsTransformer(params)
			});
		}

		getGui() {
			return this.element!;
		}

		refresh(params: ICellRendererParams): boolean {
			this.props = params;
			if (this.component) {
				Object.assign(this.component, propsTransformer(params));
			}
			return true;
		}

		destroy() {
			if (this.component) {
				unmount(this.component);
				this.component = undefined;
			}
		}
	};
}

/**
 * Creates an AG Grid cell renderer class that renders a Svelte 5 snippet.
 *
 * This function allows you to use Svelte 5 snippets as cell renderers in AG Grid.
 * Snippets are lightweight and perfect for simple custom cell content without
 * creating separate component files.
 *
 * @template T The props type expected by the snippet
 * @param snippet - The Svelte 5 snippet to render in the cell
 * @param propsTransformer - Function that converts AG Grid's ICellRendererParams to snippet props
 * @returns AG Grid cell renderer class that can be used in column definitions
 *
 * @example
 * ```typescript
 * // Define a snippet in your markup
 * {#snippet priceCell(params: { price: number })}
 *   <span class="price {params.price > 100 ? 'expensive' : 'affordable'}">
 *     ${params.price.toFixed(2)}
 *   </span>
 * {/snippet}
 *
 * // Use it as a cell renderer
 * const columnDefs = [
 *   {
 *     field: 'price',
 *     cellRenderer: makeSvelteSnippetRenderer(priceCell, (params) => ({
 *       price: params.value
 *     }))
 *   }
 * ];
 * ```
 *
 * @see For the recommended approach, use inline snippets directly inside AgGrid component
 */
export function makeSvelteSnippetRenderer<T extends Record<string, unknown>>(
	snippet: Snippet<[T]>,
	propsTransformer: PropsTransformer<T>
) {
	return class SvelteSnippetRenderer implements ICellRenderer {
		element: HTMLElement | undefined = undefined;
		component: Record<string, unknown> | undefined = undefined;
		props: ICellRendererParams | undefined = $state(undefined);

		init(params: ICellRendererParams) {
			this.element = document.createElement('div');
			this.element.classList.add('contents');
			this.props = params;

			this.component = mount(CellRenderer<T>, {
				target: this.element,
				props: {
					snippet: snippet,
					params: propsTransformer(params)
				}
			});
		}

		getGui() {
			return this.element!;
		}

		refresh(params: ICellRendererParams): boolean {
			this.props = params;
			return true;
		}

		destroy() {
			if (this.component) {
				unmount(this.component);
				this.component = undefined;
			}
		}
	};
}
