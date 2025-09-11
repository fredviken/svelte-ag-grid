<script lang="ts" generics="TData">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { watch } from 'runed';
	import {
		createGrid,
		type GridApi,
		type GridOptions,
		type GridParams,
		type ICellRendererParams
	} from 'ag-grid-community';
	import type { HTMLAttributes } from 'svelte/elements';
	import { makeSvelteSnippetRenderer } from './SvelteCellRenderer.svelte.js';

	type Props = HTMLAttributes<HTMLDivElement> &
		GridOptions<TData> & {
			params?: GridParams;
			api?: GridApi<TData>;
		} & {
			[K in keyof TData]?: Snippet<[{ params: ICellRendererParams<TData, TData[K]> }]>;
		};

	let { params = {}, api = $bindable(), class: className, style, ...gridOptions }: Props = $props();

	// Separate HTML attributes from GridOptions
	const htmlAttributes = $derived(() => ({ class: className, style }));

	let gridDiv: HTMLDivElement;

	// Extract snippets from gridOptions - these are the field-named snippets
	const snippets = $derived(() => {
		const result: Record<string, Snippet> = {};
		if (gridOptions.rowData && gridOptions.rowData.length > 0) {
			const sampleRow = gridOptions.rowData[0];
			for (const key in sampleRow) {
				if (
					key in gridOptions &&
					typeof gridOptions[key as keyof typeof gridOptions] === 'function'
				) {
					result[key] = gridOptions[key as keyof typeof gridOptions] as Snippet;
				}
			}
		}
		return result;
	});

	// Update column definitions to use snippets
	const enhancedOptions = $derived(() => {
		if (!gridOptions.columnDefs) return gridOptions;

		const updatedColumnDefs = gridOptions.columnDefs.map((colDef: any) => {
			if ('field' in colDef && colDef.field && snippets()[colDef.field]) {
				return {
					...colDef,
					cellRenderer: makeSvelteSnippetRenderer(snippets()[colDef.field], (params) => ({
						params
					}))
				};
			}
			return colDef;
		});

		return {
			...gridOptions,
			columnDefs: updatedColumnDefs
		};
	});

	// Watch for changes to specific reactive fields
	watch(
		() => gridOptions.rowData,
		(newRowData) => {
			if (api && newRowData !== undefined) {
				api.setGridOption('rowData', newRowData);
			}
		}
	);

	watch(
		() => enhancedOptions().columnDefs,
		(newColumnDefs) => {
			if (api && newColumnDefs !== undefined) {
				api.setGridOption('columnDefs', newColumnDefs);
			}
		}
	);

	watch(
		() => gridOptions.defaultColDef,
		(newDefaultColDef) => {
			if (api && newDefaultColDef !== undefined) {
				api.setGridOption('defaultColDef', newDefaultColDef);
			}
		}
	);

	watch(
		() => gridOptions.pagination,
		(newPagination) => {
			if (api && newPagination !== undefined) {
				api.setGridOption('pagination', newPagination);
			}
		}
	);

	watch(
		() => gridOptions.paginationPageSize,
		(newPageSize) => {
			if (api && newPageSize !== undefined) {
				api.setGridOption('paginationPageSize', newPageSize);
			}
		}
	);

	onMount(() => {
		api = createGrid(gridDiv, enhancedOptions(), params);
	});

	onDestroy(() => {
		if (api) {
			api.destroy();
		}
		api = undefined;
	});
</script>

<div bind:this={gridDiv} {...htmlAttributes()}></div>
