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
	let internalApi: GridApi<TData> | undefined = $state(undefined);

	$effect(() => {
		api = internalApi;
	});

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

	// Filter out snippets and create clean grid options
	const cleanGridOptions = $derived.by(() => {
		const clean = { ...gridOptions };
		const snippetKeys = Object.keys(snippets());

		// Remove snippet functions from grid options to avoid AG Grid warnings
		for (const key of snippetKeys) {
			delete clean[key as keyof typeof clean];
		}

		return clean;
	});

	// Update column definitions to use snippets
	const enhancedOptions = $derived.by(() => {
		if (!cleanGridOptions.columnDefs) return cleanGridOptions;

		const updatedColumnDefs = cleanGridOptions.columnDefs.map((colDef) => {
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
			...cleanGridOptions,
			columnDefs: updatedColumnDefs
		};
	});
	onMount(() => {
		internalApi = createGrid(gridDiv, enhancedOptions, params);
	});

	onDestroy(() => {
		if (internalApi) {
			internalApi.destroy();
		}
		internalApi = undefined;
	});

	// Watch for changes to specific reactive fields
	watch(
		() => cleanGridOptions.rowData,
		(newRowData) => {
			if (internalApi && newRowData !== undefined) {
				internalApi.setGridOption('rowData', newRowData);
			}
		}
	);

	watch(
		() => enhancedOptions.columnDefs,
		(newColumnDefs) => {
			if (internalApi && newColumnDefs !== undefined) {
				internalApi.setGridOption('columnDefs', newColumnDefs);
			}
		}
	);

	watch(
		() => cleanGridOptions.defaultColDef,
		(newDefaultColDef) => {
			if (internalApi && newDefaultColDef !== undefined) {
				internalApi.setGridOption('defaultColDef', newDefaultColDef);
			}
		}
	);

	watch(
		() => cleanGridOptions.pagination,
		(newPagination) => {
			if (internalApi && newPagination !== undefined) {
				internalApi.setGridOption('pagination', newPagination);
			}
		}
	);

	watch(
		() => cleanGridOptions.paginationPageSize,
		(newPageSize) => {
			if (internalApi && newPageSize !== undefined) {
				internalApi.setGridOption('paginationPageSize', newPageSize);
			}
		}
	);
</script>

<div bind:this={gridDiv} {...htmlAttributes()}></div>
