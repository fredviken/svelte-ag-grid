import type { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { mount, unmount, type Component, type Snippet } from 'svelte';
import CellRenderer from './CellRenderer.svelte';

type PropsTransformer<T> = (params: ICellRendererParams) => T;

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
